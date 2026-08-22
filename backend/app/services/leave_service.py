from datetime import date, datetime
from typing import Optional, List
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from app.models.leave import LeaveRequest, LeaveBalance, LeaveStatus, LeaveType
from app.schemas.leave import LeaveRequestCreate, LeaveBalanceResponse
from fastapi import HTTPException
import math

LEAVE_DEFAULTS = {
    LeaveType.casual: 12,
    LeaveType.sick: 12,
    LeaveType.earned: 15,
    LeaveType.maternity: 180,
    LeaveType.paternity: 15,
    LeaveType.emergency: 5,
}

class LeaveService:
    def __init__(self, db: AsyncSession):
        self.db = db

    def _calculate_working_days(self, start: date, end: date) -> float:
        delta = (end - start).days + 1
        total = 0
        for i in range(delta):
            from datetime import timedelta
            d = start + timedelta(days=i)
            if d.weekday() < 5:  # Mon-Fri
                total += 1
        return float(total)

    async def submit_request(self, employee_id: UUID, data: LeaveRequestCreate) -> LeaveRequest:
        if data.end_date < data.start_date:
            raise HTTPException(status_code=400, detail='End date must be after start date')
        total_days = self._calculate_working_days(data.start_date, data.end_date)
        # Check leave balance
        year = date.today().year
        balance_result = await self.db.execute(
            select(LeaveBalance).where(
                and_(LeaveBalance.employee_id == employee_id,
                     LeaveBalance.leave_type == data.leave_type,
                     LeaveBalance.year == year)
            )
        )
        balance = balance_result.scalar_one_or_none()
        if balance and (balance.used_days + balance.pending_days + total_days) > balance.total_days:
            raise HTTPException(status_code=400, detail=f'Insufficient leave balance. Available: {balance.total_days - balance.used_days - balance.pending_days} days')
        request = LeaveRequest(
            employee_id=employee_id,
            leave_type=data.leave_type,
            start_date=data.start_date,
            end_date=data.end_date,
            total_days=total_days,
            reason=data.reason,
            status=LeaveStatus.pending
        )
        self.db.add(request)
        # Update pending balance
        if balance:
            balance.pending_days += total_days
        await self.db.commit()
        await self.db.refresh(request)
        return request

    async def approve_request(self, request_id: UUID, approver_id: UUID) -> LeaveRequest:
        request = await self._get_request(request_id)
        if request.status != LeaveStatus.pending:
            raise HTTPException(status_code=400, detail='Request is not pending')
        request.status = LeaveStatus.approved
        request.approved_by = approver_id
        request.approved_at = datetime.utcnow()
        # Update balance: move from pending to used
        await self._update_balance(request.employee_id, request.leave_type, -request.total_days, request.total_days)
        await self.db.commit()
        await self.db.refresh(request)
        return request

    async def reject_request(self, request_id: UUID, approver_id: UUID, reason: Optional[str] = None) -> LeaveRequest:
        request = await self._get_request(request_id)
        if request.status != LeaveStatus.pending:
            raise HTTPException(status_code=400, detail='Request is not pending')
        request.status = LeaveStatus.rejected
        request.approved_by = approver_id
        request.approved_at = datetime.utcnow()
        request.rejection_reason = reason
        # Release pending balance
        await self._update_balance(request.employee_id, request.leave_type, 0, -request.total_days)
        await self.db.commit()
        await self.db.refresh(request)
        return request

    async def cancel_request(self, request_id: UUID, employee_id: UUID) -> LeaveRequest:
        request = await self._get_request(request_id)
        if request.employee_id != employee_id:
            raise HTTPException(status_code=403, detail='Not authorized')
        if request.status not in (LeaveStatus.pending, LeaveStatus.approved):
            raise HTTPException(status_code=400, detail='Cannot cancel this request')
        was_approved = request.status == LeaveStatus.approved
        request.status = LeaveStatus.cancelled
        await self._update_balance(request.employee_id, request.leave_type,
                                    -request.total_days if was_approved else 0,
                                    -request.total_days if not was_approved else 0)
        await self.db.commit()
        await self.db.refresh(request)
        return request

    async def get_leave_balance(self, employee_id: UUID, year: int) -> List[LeaveBalanceResponse]:
        result = await self.db.execute(
            select(LeaveBalance).where(
                and_(LeaveBalance.employee_id == employee_id, LeaveBalance.year == year)
            )
        )
        balances = result.scalars().all()
        # Initialize missing leave types
        existing_types = {b.leave_type for b in balances}
        for lt in LeaveType:
            if lt not in existing_types:
                new_balance = LeaveBalance(
                    employee_id=employee_id, leave_type=lt,
                    total_days=LEAVE_DEFAULTS[lt], year=year
                )
                self.db.add(new_balance)
                balances = list(balances) + [new_balance]
        await self.db.commit()
        return [
            LeaveBalanceResponse(
                leave_type=b.leave_type.value,
                total_days=b.total_days,
                used_days=b.used_days,
                pending_days=b.pending_days,
                remaining_days=b.total_days - b.used_days - b.pending_days,
                year=b.year
            ) for b in balances
        ]

    async def _get_request(self, request_id: UUID) -> LeaveRequest:
        result = await self.db.execute(select(LeaveRequest).where(LeaveRequest.id == request_id))
        request = result.scalar_one_or_none()
        if not request:
            raise HTTPException(status_code=404, detail='Leave request not found')
        return request

    async def _update_balance(self, employee_id: UUID, leave_type, used_delta: float, pending_delta: float):
        year = date.today().year
        result = await self.db.execute(
            select(LeaveBalance).where(
                and_(LeaveBalance.employee_id == employee_id,
                     LeaveBalance.leave_type == leave_type,
                     LeaveBalance.year == year)
            )
        )
        balance = result.scalar_one_or_none()
        if balance:
            balance.used_days = max(0, balance.used_days + used_delta)
            balance.pending_days = max(0, balance.pending_days + pending_delta)
