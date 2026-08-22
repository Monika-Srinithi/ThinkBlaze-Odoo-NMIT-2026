from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, and_
from typing import Optional
from app.core.database import get_db
from app.services.auth_service import get_current_user, require_hr
from app.models.employee import Employee
from app.models.user import User
from app.models.leave import LeaveRequest, LeaveBalance
from pydantic import BaseModel
from datetime import date
import uuid

router = APIRouter(prefix='/leave', tags=['Leave'])

class LeaveRequestCreate(BaseModel):
    leave_type: str
    start_date: date
    end_date: date
    reason: str

class RejectRequest(BaseModel):
    reason: str

@router.post('/request')
async def request_leave(
    data: LeaveRequestCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    emp_result = await db.execute(select(Employee).where(Employee.user_id == current_user.id))
    emp = emp_result.scalar_one_or_none()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
        
    leave = LeaveRequest(
        id=str(uuid.uuid4()),
        employee_id=emp.id,
        leave_type=data.leave_type,
        start_date=data.start_date,
        end_date=data.end_date,
        reason=data.reason,
        status='pending'
    )
    db.add(leave)
    await db.commit()
    await db.refresh(leave)
    
    return {
        "id": leave.id,
        "employee_id": leave.employee_id,
        "leave_type": leave.leave_type,
        "start_date": str(leave.start_date),
        "end_date": str(leave.end_date),
        "status": leave.status,
        "reason": leave.reason
    }

@router.get('/requests')
async def get_leave_requests(
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(LeaveRequest)
    if current_user.role != 'hr':
        emp_result = await db.execute(select(Employee).where(Employee.user_id == current_user.id))
        emp = emp_result.scalar_one_or_none()
        if not emp:
            return []
        query = query.where(LeaveRequest.employee_id == emp.id)
        
    if status:
        query = query.where(LeaveRequest.status == status)
        
    result = await db.execute(query)
    leaves = result.scalars().all()
    
    return [{
        "id": l.id,
        "employee_id": l.employee_id,
        "leave_type": l.leave_type,
        "start_date": str(l.start_date),
        "end_date": str(l.end_date),
        "status": l.status,
        "reason": l.reason,
        "reject_reason": l.reject_reason if hasattr(l, 'reject_reason') else None
    } for l in leaves]

@router.put('/requests/{id}/approve')
async def approve_leave(
    id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_hr)
):
    result = await db.execute(select(LeaveRequest).where(LeaveRequest.id == id))
    leave = result.scalar_one_or_none()
    if not leave:
        raise HTTPException(status_code=404, detail="Leave request not found")
        
    leave.status = 'approved'
    
    today = date.today()
    if leave.start_date <= today <= leave.end_date:
        emp_result = await db.execute(select(Employee).where(Employee.id == leave.employee_id))
        emp = emp_result.scalar_one_or_none()
        if emp:
            emp.status = 'on_leave'
            
    await db.commit()
    return {"message": "Leave approved"}

@router.put('/requests/{id}/reject')
async def reject_leave(
    id: str,
    data: RejectRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_hr)
):
    result = await db.execute(select(LeaveRequest).where(LeaveRequest.id == id))
    leave = result.scalar_one_or_none()
    if not leave:
        raise HTTPException(status_code=404, detail="Leave request not found")
        
    leave.status = 'rejected'
    leave.reject_reason = data.reason
    await db.commit()
    return {"message": "Leave rejected"}

@router.delete('/requests/{id}')
async def cancel_leave(
    id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    emp_result = await db.execute(select(Employee).where(Employee.user_id == current_user.id))
    emp = emp_result.scalar_one_or_none()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
        
    result = await db.execute(select(LeaveRequest).where(LeaveRequest.id == id))
    leave = result.scalar_one_or_none()
    if not leave:
        raise HTTPException(status_code=404, detail="Leave request not found")
        
    if leave.employee_id != emp.id:
        raise HTTPException(status_code=403, detail="Not authorized to cancel this leave")
        
    if leave.status != 'pending':
        raise HTTPException(status_code=400, detail="Only pending leaves can be cancelled")
        
    leave.status = 'cancelled'
    await db.commit()
    return {"message": "Leave cancelled"}

@router.get('/balance')
async def get_my_leave_balance(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    emp_result = await db.execute(select(Employee).where(Employee.user_id == current_user.id))
    emp = emp_result.scalar_one_or_none()
    if not emp:
        return []
        
    result = await db.execute(select(LeaveBalance).where(LeaveBalance.employee_id == emp.id))
    balances = result.scalars().all()
    
    return [{
        "leave_type": b.leave_type,
        "total": b.total,
        "used": b.used,
        "available": b.total - b.used
    } for b in balances]

@router.get('/balance/{employee_id}')
async def get_employee_leave_balance(
    employee_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_hr)
):
    result = await db.execute(select(LeaveBalance).where(LeaveBalance.employee_id == employee_id))
    balances = result.scalars().all()
    
    return [{
        "leave_type": b.leave_type,
        "total": b.total,
        "used": b.used,
        "available": b.total - b.used
    } for b in balances]
