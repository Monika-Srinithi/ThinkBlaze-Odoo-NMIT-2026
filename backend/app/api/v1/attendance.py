from fastapi import APIRouter, Depends, Query
from typing import Optional
from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from app.core.database import get_db
from app.services.attendance_service import AttendanceService
from app.services.auth_service import get_current_user, require_hr
from app.schemas.attendance import AttendanceResponse, CheckInRequest, CheckOutRequest, AttendanceSummary
from app.models.user import User
from app.models.attendance import Attendance

router = APIRouter(prefix='/attendance', tags=['Attendance'])


@router.post('/checkin', response_model=AttendanceResponse)
async def check_in(
    request: CheckInRequest = CheckInRequest(),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    svc = AttendanceService(db)
    record = await svc.record_checkin(current_user.employee_id, request.notes)
    return AttendanceResponse.model_validate(record)


@router.post('/checkout', response_model=AttendanceResponse)
async def check_out(
    request: CheckOutRequest = CheckOutRequest(),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    svc = AttendanceService(db)
    record = await svc.record_checkout(current_user.employee_id, request.notes)
    return AttendanceResponse.model_validate(record)


@router.get('', response_model=list[AttendanceResponse])
async def get_attendance(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    employee_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_hr)
):
    from uuid import UUID
    query = select(Attendance)
    filters = []
    if start_date:
        filters.append(Attendance.date >= start_date)
    if end_date:
        filters.append(Attendance.date <= end_date)
    if employee_id:
        filters.append(Attendance.employee_id == UUID(employee_id))
    if filters:
        query = query.where(and_(*filters))
    query = query.order_by(Attendance.date.desc()).limit(500)
    result = await db.execute(query)
    records = result.scalars().all()
    return [AttendanceResponse.model_validate(r) for r in records]


@router.get('/my', response_model=list[AttendanceResponse])
async def get_my_attendance(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(Attendance).where(Attendance.employee_id == current_user.employee_id)
    filters = []
    if start_date:
        filters.append(Attendance.date >= start_date)
    if end_date:
        filters.append(Attendance.date <= end_date)
    if filters:
        from sqlalchemy import and_
        query = query.where(and_(*filters))
    query = query.order_by(Attendance.date.desc()).limit(90)
    result = await db.execute(query)
    records = result.scalars().all()
    return [AttendanceResponse.model_validate(r) for r in records]


@router.get('/today')
async def get_today_attendance(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_hr)
):
    today = date.today()
    result = await db.execute(select(Attendance).where(Attendance.date == today))
    records = result.scalars().all()
    stats = {
        'present': sum(1 for r in records if r.status.value == 'present'),
        'absent': sum(1 for r in records if r.status.value == 'absent'),
        'late': sum(1 for r in records if r.status.value == 'late'),
        'half_day': sum(1 for r in records if r.status.value == 'half_day'),
        'on_leave': sum(1 for r in records if r.status.value == 'on_leave'),
    }
    return {'date': str(today), 'stats': stats, 'records': [AttendanceResponse.model_validate(r) for r in records]}


@router.get('/summary')
async def get_attendance_summary(
    year: int = Query(default=None),
    month: int = Query(default=None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from datetime import datetime
    if not year:
        year = datetime.now().year
    if not month:
        month = datetime.now().month
    svc = AttendanceService(db)
    return await svc.get_monthly_summary(current_user.employee_id, year, month)
