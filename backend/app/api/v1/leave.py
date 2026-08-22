from fastapi import APIRouter, Depends, Query, HTTPException
from typing import Optional
from datetime import date
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from app.core.database import get_db
from app.services.leave_service import LeaveService
from app.services.auth_service import get_current_user, require_hr
from app.schemas.leave import LeaveRequestCreate, LeaveRequestResponse, LeaveApprovalRequest, LeaveBalanceResponse
from app.models.user import User
from app.models.leave import LeaveRequest, LeaveStatus

router = APIRouter(prefix='/leave', tags=['Leave'])


@router.post('/request', response_model=LeaveRequestResponse, status_code=201)
async def submit_leave_request(
    data: LeaveRequestCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    svc = LeaveService(db)
    req = await svc.submit_request(current_user.employee_id, data)
    return LeaveRequestResponse.model_validate(req)


@router.get('/requests', response_model=list[LeaveRequestResponse])
async def get_leave_requests(
    status: Optional[str] = None,
    employee_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(LeaveRequest)
    # HR sees all, employees see only their own
    if current_user.role not in ('admin', 'hr', 'manager'):
        query = query.where(LeaveRequest.employee_id == current_user.employee_id)
    elif employee_id:
        query = query.where(LeaveRequest.employee_id == UUID(employee_id))
    if status:
        query = query.where(LeaveRequest.status == status)
    query = query.order_by(LeaveRequest.created_at.desc()).limit(100)
    result = await db.execute(query)
    requests = result.scalars().all()
    return [LeaveRequestResponse.model_validate(r) for r in requests]


@router.put('/requests/{request_id}/approve', response_model=LeaveRequestResponse)
async def approve_leave(
    request_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_hr)
):
    svc = LeaveService(db)
    req = await svc.approve_request(request_id, current_user.employee_id)
    return LeaveRequestResponse.model_validate(req)


@router.put('/requests/{request_id}/reject', response_model=LeaveRequestResponse)
async def reject_leave(
    request_id: UUID,
    data: LeaveApprovalRequest = LeaveApprovalRequest(),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_hr)
):
    svc = LeaveService(db)
    req = await svc.reject_request(request_id, current_user.employee_id, data.rejection_reason)
    return LeaveRequestResponse.model_validate(req)


@router.delete('/requests/{request_id}')
async def cancel_leave(
    request_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    svc = LeaveService(db)
    req = await svc.cancel_request(request_id, current_user.employee_id)
    return {'message': 'Leave request cancelled', 'id': str(req.id)}


@router.get('/balance', response_model=list[LeaveBalanceResponse])
async def get_leave_balance(
    year: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from datetime import datetime
    svc = LeaveService(db)
    year = year or datetime.now().year
    return await svc.get_leave_balance(current_user.employee_id, year)


@router.get('/calendar')
async def get_leave_calendar(
    year: int = Query(...),
    month: int = Query(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from datetime import timedelta
    first_day = date(year, month, 1)
    last_day = date(year, month + 1, 1) - timedelta(days=1) if month < 12 else date(year, 12, 31)
    query = select(LeaveRequest).where(
        and_(
            LeaveRequest.status == LeaveStatus.approved,
            LeaveRequest.start_date <= last_day,
            LeaveRequest.end_date >= first_day
        )
    )
    result = await db.execute(query)
    leaves = result.scalars().all()
    return {
        'year': year,
        'month': month,
        'approved_leaves': [LeaveRequestResponse.model_validate(l) for l in leaves]
    }
