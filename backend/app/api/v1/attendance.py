from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from typing import Optional, List
from app.core.database import get_db
from app.services.auth_service import get_current_user, require_hr
from app.models.employee import Employee
from app.models.user import User
from app.models.attendance import Attendance
from datetime import datetime, date
import uuid

router = APIRouter(prefix='/attendance', tags=['Attendance'])


def format_attendance(a: Attendance, emp: Optional[Employee] = None) -> dict:
    return {
        "id": str(a.id),
        "employee_id": str(a.employee_id),
        "employee_name": f"{emp.first_name} {emp.last_name}" if emp else None,
        "employee_code": emp.employee_code if emp else None,
        "date": str(a.date),
        "check_in": str(a.check_in) if a.check_in else None,
        "check_out": str(a.check_out) if a.check_out else None,
        "status": a.status if isinstance(a.status, str) else (a.status.value if hasattr(a.status, 'value') else str(a.status)),
        "hours_worked": float(a.hours_worked) if a.hours_worked is not None else None,
    }


@router.post('/checkin')
async def checkin(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.employee_id:
        raise HTTPException(status_code=400, detail="No employee linked to current user")

    today_val = date.today()
    today_str = today_val.isoformat()

    att_result = await db.execute(
        select(Attendance).where(and_(
            Attendance.employee_id == current_user.employee_id,
            or_(Attendance.date == today_val, Attendance.date == today_str)
        ))
    )
    att = att_result.scalar_one_or_none()
    if att and att.check_in:
        raise HTTPException(status_code=400, detail="Already checked in today")

    now = datetime.now()
    if not att:
        att = Attendance(
            id=str(uuid.uuid4()),
            employee_id=current_user.employee_id,
            date=today_val,
            check_in=now,
            status='present'
        )
        db.add(att)
    else:
        att.check_in = now
        att.status = 'present'

    await db.commit()
    await db.refresh(att)

    emp_res = await db.execute(select(Employee).where(Employee.id == current_user.employee_id))
    emp = emp_res.scalar_one_or_none()
    return format_attendance(att, emp)


@router.post('/checkout')
async def checkout(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.employee_id:
        raise HTTPException(status_code=400, detail="No employee linked to current user")

    today_val = date.today()
    today_str = today_val.isoformat()

    att_result = await db.execute(
        select(Attendance).where(and_(
            Attendance.employee_id == current_user.employee_id,
            or_(Attendance.date == today_val, Attendance.date == today_str)
        ))
    )
    att = att_result.scalar_one_or_none()
    if not att or not att.check_in:
        raise HTTPException(status_code=400, detail="Not checked in today")

    now = datetime.now()
    att.check_out = now
    delta = att.check_out - att.check_in
    att.hours_worked = round(delta.total_seconds() / 3600.0, 2)

    await db.commit()
    await db.refresh(att)

    emp_res = await db.execute(select(Employee).where(Employee.id == current_user.employee_id))
    emp = emp_res.scalar_one_or_none()
    return format_attendance(att, emp)


@router.get('/today')
async def get_today_attendance(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(Attendance, Employee).join(Employee, Employee.id == Attendance.employee_id).order_by(Attendance.date.desc()).limit(50)
    result = await db.execute(query)
    rows = result.all()
    return [format_attendance(a, e) for a, e in rows]


@router.get('/my')
async def get_my_attendance(
    days: int = Query(30),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.employee_id:
        result = await db.execute(select(Attendance, Employee).join(Employee, Employee.id == Attendance.employee_id).order_by(Attendance.date.desc()).limit(days))
        return [format_attendance(a, e) for a, e in result.all()]

    result = await db.execute(
        select(Attendance, Employee)
        .join(Employee, Employee.id == Attendance.employee_id)
        .where(Attendance.employee_id == current_user.employee_id)
        .order_by(Attendance.date.desc())
        .limit(days)
    )
    rows = result.all()
    return [format_attendance(a, e) for a, e in rows]


@router.get('')
async def get_all_attendance(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    employee_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(Attendance, Employee).join(Employee, Employee.id == Attendance.employee_id)
    if start_date:
        query = query.where(Attendance.date >= start_date)
    if end_date:
        query = query.where(Attendance.date <= end_date)
    if employee_id:
        query = query.where(Attendance.employee_id == employee_id)

    query = query.order_by(Attendance.date.desc()).limit(100)
    result = await db.execute(query)
    rows = result.all()

    return [format_attendance(a, e) for a, e in rows]


@router.get('/summary')
async def get_attendance_summary(
    month: Optional[int] = None,
    year: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(Attendance, Employee).join(Employee, Employee.id == Attendance.employee_id).limit(300)
    result = await db.execute(query)
    rows = result.all()

    summary: dict = {}
    for a, e in rows:
        eid = str(e.id)
        if eid not in summary:
            summary[eid] = {
                "employee_id": eid,
                "employee_name": f"{e.first_name} {e.last_name}",
                "department": e.department,
                "present_days": 0,
                "absent_days": 0,
                "late_days": 0,
                "total_hours": 0.0,
                "count": 0
            }
        st = a.status if isinstance(a.status, str) else (a.status.value if hasattr(a.status, 'value') else str(a.status))
        s = summary[eid]
        s["count"] += 1
        if st in ('present', 'late'):
            s["present_days"] += 1
        if st == 'late':
            s["late_days"] += 1
        elif st == 'absent':
            s["absent_days"] += 1

        if a.hours_worked:
            s["total_hours"] += float(a.hours_worked)

    for s in summary.values():
        cnt = max(s["count"], 1)
        s["attendance_rate"] = round((s["present_days"] / cnt) * 100, 1)
        s["avg_hours"] = round(s["total_hours"] / max(s["present_days"], 1), 1)
        del s["total_hours"]
        del s["count"]

    return list(summary.values())
