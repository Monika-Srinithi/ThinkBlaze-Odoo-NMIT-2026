from typing import Optional, List
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from sqlalchemy.orm import selectinload
from app.models.employee import Employee, EmployeeStatus
from app.schemas.employee import EmployeeCreate, EmployeeUpdate, EmployeeResponse, EmployeeListResponse
from fastapi import HTTPException
import math

class EmployeeService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_employees(self, page: int = 1, size: int = 20, department: Optional[str] = None,
                             status: Optional[str] = None, search: Optional[str] = None) -> EmployeeListResponse:
        query = select(Employee).where(Employee.status != EmployeeStatus.terminated)
        if department:
            query = query.where(Employee.department == department)
        if status:
            query = query.where(Employee.status == status)
        if search:
            query = query.where(or_(
                Employee.first_name.ilike(f'%{search}%'),
                Employee.last_name.ilike(f'%{search}%'),
                Employee.email.ilike(f'%{search}%'),
                Employee.employee_code.ilike(f'%{search}%')
            ))
        count_result = await self.db.execute(select(func.count()).select_from(query.subquery()))
        total = count_result.scalar()
        query = query.offset((page - 1) * size).limit(size).order_by(Employee.first_name)
        result = await self.db.execute(query)
        employees = result.scalars().all()
        return EmployeeListResponse(
            items=[EmployeeResponse.model_validate(e) for e in employees],
            total=total, page=page, size=size, pages=math.ceil(total / size) if total else 1
        )

    async def get_employee(self, employee_id: UUID) -> Employee:
        result = await self.db.execute(select(Employee).where(Employee.id == employee_id))
        employee = result.scalar_one_or_none()
        if not employee:
            raise HTTPException(status_code=404, detail='Employee not found')
        return employee

    async def create_employee(self, data: EmployeeCreate) -> Employee:
        # Check email uniqueness
        existing = await self.db.execute(select(Employee).where(Employee.email == data.email))
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=400, detail='Employee with this email already exists')
        employee = Employee(**data.model_dump())
        self.db.add(employee)
        await self.db.commit()
        await self.db.refresh(employee)
        return employee

    async def update_employee(self, employee_id: UUID, data: EmployeeUpdate) -> Employee:
        employee = await self.get_employee(employee_id)
        for field, value in data.model_dump(exclude_none=True).items():
            setattr(employee, field, value)
        await self.db.commit()
        await self.db.refresh(employee)
        return employee

    async def delete_employee(self, employee_id: UUID) -> dict:
        employee = await self.get_employee(employee_id)
        employee.status = EmployeeStatus.terminated
        await self.db.commit()
        return {'message': 'Employee terminated successfully'}

    async def get_employee_summary(self, employee_id: UUID) -> dict:
        from app.models.attendance import Attendance
        from app.models.leave import LeaveRequest, LeaveStatus
        from datetime import date, timedelta
        from sqlalchemy import and_
        employee = await self.get_employee(employee_id)
        # Last 30 days attendance
        thirty_days_ago = date.today() - timedelta(days=30)
        att_result = await self.db.execute(
            select(Attendance).where(
                and_(Attendance.employee_id == employee_id, Attendance.date >= thirty_days_ago)
            )
        )
        attendance_records = att_result.scalars().all()
        # Pending leaves
        leave_result = await self.db.execute(
            select(LeaveRequest).where(
                and_(LeaveRequest.employee_id == employee_id, LeaveRequest.status == LeaveStatus.pending)
            )
        )
        pending_leaves = leave_result.scalars().all()
        present_days = sum(1 for a in attendance_records if a.status.value in ('present', 'late', 'half_day'))
        total_hours = sum(float(a.hours_worked or 0) for a in attendance_records)
        return {
            'employee': EmployeeResponse.model_validate(employee),
            'attendance_summary': {
                'total_days': len(attendance_records),
                'present_days': present_days,
                'total_hours': round(total_hours, 2),
                'attendance_rate': round((present_days / max(len(attendance_records), 1)) * 100, 1)
            },
            'pending_leave_requests': len(pending_leaves)
        }
