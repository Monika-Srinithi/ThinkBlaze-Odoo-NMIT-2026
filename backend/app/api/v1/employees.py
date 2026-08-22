from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, and_
from typing import Optional
from app.core.database import get_db
from app.services.auth_service import get_current_user, require_hr
from app.models.employee import Employee, EmployeeStatus, EmploymentType
from app.models.user import User
from app.schemas.employee import EmployeeCreate, EmployeeResponse, EmployeeUpdate
from datetime import datetime
import uuid
import math

router = APIRouter(prefix='/employees', tags=['Employees'])

@router.get('')
async def list_employees(
    page: int = 1,
    limit: int = 10,
    search: Optional[str] = None,
    department: Optional[str] = None,
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(Employee)
    
    if search:
        query = query.where(or_(
            Employee.first_name.ilike(f"%{search}%"),
            Employee.last_name.ilike(f"%{search}%"),
            Employee.employee_code.ilike(f"%{search}%"),
            Employee.email.ilike(f"%{search}%")
        ))
    if department:
        query = query.where(Employee.department == department)
    if status:
        query = query.where(Employee.status == status)
        
    total_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(total_query)
    
    offset = (page - 1) * limit
    query = query.offset(offset).limit(limit)
    
    result = await db.execute(query)
    employees = result.scalars().all()
    
    return {
        "items": [{
            "id": e.id,
            "first_name": e.first_name,
            "last_name": e.last_name,
            "email": e.email,
            "employee_code": e.employee_code,
            "department": e.department,
            "designation": e.designation,
            "status": e.status.value if hasattr(e.status, 'value') else e.status,
            "employment_type": e.employment_type.value if hasattr(e.employment_type, 'value') else e.employment_type,
            "joining_date": str(e.joining_date) if e.joining_date else None,
            "manager_id": e.manager_id
        } for e in employees],
        "total": total,
        "page": page,
        "pages": math.ceil(total / limit) if total else 0
    }

@router.post('', status_code=201)
async def create_employee(
    data: EmployeeCreate, 
    db: AsyncSession = Depends(get_db), 
    current_user: User = Depends(require_hr)
):
    emp_id = str(uuid.uuid4())
    emp = Employee(
        id=emp_id,
        first_name=data.first_name,
        last_name=data.last_name,
        email=data.email,
        employee_code=data.employee_code,
        department=data.department,
        designation=data.designation,
        status=data.status,
        employment_type=data.employment_type,
        joining_date=data.joining_date,
        manager_id=data.manager_id
    )
    db.add(emp)
    await db.commit()
    await db.refresh(emp)
    return {
        "id": emp.id,
        "first_name": emp.first_name,
        "last_name": emp.last_name,
        "email": emp.email,
        "employee_code": emp.employee_code,
        "department": emp.department,
        "status": emp.status.value if hasattr(emp.status, 'value') else emp.status
    }

@router.get('/{employee_id}')
async def get_employee(
    employee_id: str, 
    db: AsyncSession = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Employee).where(Employee.id == employee_id))
    e = result.scalar_one_or_none()
    if not e:
        raise HTTPException(status_code=404, detail="Employee not found")
        
    return {
        "id": e.id,
        "first_name": e.first_name,
        "last_name": e.last_name,
        "email": e.email,
        "employee_code": e.employee_code,
        "department": e.department,
        "designation": e.designation,
        "status": e.status.value if hasattr(e.status, 'value') else e.status,
        "employment_type": e.employment_type.value if hasattr(e.employment_type, 'value') else e.employment_type,
        "joining_date": str(e.joining_date) if e.joining_date else None,
        "manager_id": e.manager_id
    }

@router.put('/{employee_id}')
async def update_employee(
    employee_id: str, 
    data: EmployeeUpdate, 
    db: AsyncSession = Depends(get_db), 
    current_user: User = Depends(require_hr)
):
    result = await db.execute(select(Employee).where(Employee.id == employee_id))
    emp = result.scalar_one_or_none()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
        
    update_data = data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(emp, key, value)
        
    await db.commit()
    await db.refresh(emp)
    return {
        "id": emp.id,
        "first_name": emp.first_name,
        "last_name": emp.last_name,
        "email": emp.email,
        "employee_code": emp.employee_code,
        "status": emp.status.value if hasattr(emp.status, 'value') else emp.status
    }

@router.delete('/{employee_id}')
async def delete_employee(
    employee_id: str, 
    db: AsyncSession = Depends(get_db), 
    current_user: User = Depends(require_hr)
):
    result = await db.execute(select(Employee).where(Employee.id == employee_id))
    emp = result.scalar_one_or_none()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
        
    emp.status = "terminated"
    await db.commit()
    return {"message": "Employee terminated"}
