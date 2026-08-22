from fastapi import APIRouter, Depends, Query
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.employee_service import EmployeeService
from app.services.auth_service import get_current_user, require_hr
from app.schemas.employee import EmployeeCreate, EmployeeUpdate, EmployeeListResponse, EmployeeResponse
from app.models.user import User
from uuid import UUID

router = APIRouter(prefix='/employees', tags=['Employees'])


@router.get('', response_model=EmployeeListResponse)
async def list_employees(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    department: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    svc = EmployeeService(db)
    return await svc.get_employees(page=page, size=size, department=department, status=status, search=search)


@router.post('', response_model=EmployeeResponse, status_code=201)
async def create_employee(
    data: EmployeeCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_hr)
):
    svc = EmployeeService(db)
    return await svc.create_employee(data)


@router.get('/{employee_id}', response_model=EmployeeResponse)
async def get_employee(
    employee_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    svc = EmployeeService(db)
    emp = await svc.get_employee(employee_id)
    return EmployeeResponse.model_validate(emp)


@router.put('/{employee_id}', response_model=EmployeeResponse)
async def update_employee(
    employee_id: UUID,
    data: EmployeeUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_hr)
):
    svc = EmployeeService(db)
    emp = await svc.update_employee(employee_id, data)
    return EmployeeResponse.model_validate(emp)


@router.delete('/{employee_id}')
async def delete_employee(
    employee_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_hr)
):
    svc = EmployeeService(db)
    return await svc.delete_employee(employee_id)


@router.get('/{employee_id}/summary')
async def get_employee_summary(
    employee_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    svc = EmployeeService(db)
    return await svc.get_employee_summary(employee_id)
