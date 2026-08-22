from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, and_
from typing import Optional, List
from app.core.database import get_db
from app.services.auth_service import get_current_user, require_hr
from app.models.employee import Employee
from app.models.user import User
from app.models.attendance import Attendance
from datetime import datetime, date
import uuid

router = APIRouter(prefix='/attendance', tags=['Attendance'])

@router.post('/checkin')
async def checkin(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    emp_result = await db.execute(select(Employee).where(Employee.user_id == current_user.id))
    emp = emp_result.scalar_one_or_none()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found for current user")
        
    today = date.today()
    att_result = await db.execute(
        select(Attendance).where(and_(
            Attendance.employee_id == emp.id,
            Attendance.date == today
        ))
    )
    att = att_result.scalar_one_or_none()
    if att and att.check_in:
        raise HTTPException(status_code=400, detail="Already checked in today")
        
    if not att:
        att = Attendance(
            id=str(uuid.uuid4()),
            employee_id=emp.id,
            date=today,
            check_in=datetime.now(),
            status='present'
        )
        db.add(att)
    else:
        att.check_in = datetime.now()
        att.status = 'present'
        
    await db.commit()
    await db.refresh(att)
    return {
        "id": att.id,
        "employee_id": att.employee_id,
        "date": str(att.date),
        "check_in": str(att.check_in) if att.check_in else None,
        "check_out": str(att.check_out) if att.check_out else None,
        "status": att.status,
        "hours_worked": att.hours_worked
    }

@router.post('/checkout')
async def checkout(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    emp_result = await db.execute(select(Employee).where(Employee.user_id == current_user.id))
    emp = emp_result.scalar_one_or_none()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
        
    today = date.today()
    att_result = await db.execute(
        select(Attendance).where(and_(
            Attendance.employee_id == emp.id,
            Attendance.date == today
        ))
    )
    att = att_result.scalar_one_or_none()
    if not att or not att.check_in:
        raise HTTPException(status_code=400, detail="Not checked in today")
        
    att.check_out = datetime.now()
    delta = att.check_out - att.check_in
    att.hours_worked = round(delta.total_seconds() / 3600.0, 2)
    
    await db.commit()
    await db.refresh(att)
    return {
        "id": att.id,
        "employee_id": att.employee_id,
        "date": str(att.date),
        "check_in": str(att.check_in),
        "check_out": str(att.check_out),
        "status": att.status,
        "hours_worked": att.hours_worked
    }

@router.get('/today')
async def get_today_attendance(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = date.today()
    if current_user.role == 'hr':
        query = select(Attendance).where(Attendance.date == today)
    else:
        emp_result = await db.execute(select(Employee).where(Employee.user_id == current_user.id))
        emp = emp_result.scalar_one_or_none()
        if not emp:
            return []
        query = select(Attendance).where(and_(
            Attendance.employee_id == emp.id,
            Attendance.date == today
        ))
        
    result = await db.execute(query)
    attendances = result.scalars().all()
    
    return [{
        "id": a.id,
        "employee_id": a.employee_id,
        "date": str(a.date),
        "check_in": str(a.check_in) if a.check_in else None,
        "check_out": str(a.check_out) if a.check_out else None,
        "status": a.status,
        "hours_worked": a.hours_worked
    } for a in attendances]

@router.get('/my')
async def get_my_attendance(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    emp_result = await db.execute(select(Employee).where(Employee.user_id == current_user.id))
    emp = emp_result.scalar_one_or_none()
    if not emp:
        return []
        
    result = await db.execute(
        select(Attendance)
        .where(Attendance.employee_id == emp.id)
        .order_by(Attendance.date.desc())
        .limit(30)
    )
    attendances = result.scalars().all()
    return [{
        "id": a.id,
        "date": str(a.date),
        "check_in": str(a.check_in) if a.check_in else None,
        "check_out": str(a.check_out) if a.check_out else None,
        "status": a.status,
        "hours_worked": a.hours_worked
    } for a in attendances]

@router.get('')
async def get_all_attendance(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    employee_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_hr)
):
    query = select(Attendance)
    if start_date:
        query = query.where(Attendance.date >= start_date)
    if end_date:
        query = query.where(Attendance.date <= end_date)
    if employee_id:
        query = query.where(Attendance.employee_id == employee_id)
        
    result = await db.execute(query)
    attendances = result.scalars().all()
    
    return [{
        "id": a.id,
        "employee_id": a.employee_id,
        "date": str(a.date),
        "check_in": str(a.check_in) if a.check_in else None,
        "check_out": str(a.check_out) if a.check_out else None,
        "status": a.status,
        "hours_worked": a.hours_worked
    } for a in attendances]

@router.get('/summary')
async def get_attendance_summary(
    month: int = Query(..., ge=1, le=12),
    year: int = Query(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_hr)
):
    query = select(Attendance).where(
        and_(
            func.extract('month', Attendance.date) == month,
            func.extract('year', Attendance.date) == year
        )
    )
    result = await db.execute(query)
    attendances = result.scalars().all()
    
    summary = {}
    for a in attendances:
        if a.employee_id not in summary:
            summary[a.employee_id] = {
                "employee_id": a.employee_id,
                "present_days": 0,
                "absent_days": 0,
                "late_days": 0,
                "total_hours": 0.0,
                "count": 0
            }
        s = summary[a.employee_id]
        if a.status == 'present':
            s["present_days"] += 1
        elif a.status == 'absent':
            s["absent_days"] += 1
            
        if a.check_in and a.check_in.time() > datetime.strptime('09:00:00', '%H:%M:%S').time():
            s["late_days"] += 1
            
        if a.hours_worked:
            s["total_hours"] += a.hours_worked
        s["count"] += 1
        
    for s in summary.values():
        s["avg_hours"] = round(s["total_hours"] / s["count"], 2) if s["count"] > 0 else 0
        del s["total_hours"]
        del s["count"]
        
    return list(summary.values())
