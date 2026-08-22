from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, List
from uuid import UUID
from datetime import date, datetime
from decimal import Decimal

class EmployeeCreate(BaseModel):
    employee_code: str
    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str] = None
    department: str
    designation: str
    location: str = 'Bangalore'
    date_of_joining: date
    date_of_birth: Optional[date] = None
    employment_type: str = 'full_time'
    salary: Optional[Decimal] = None
    manager_id: Optional[UUID] = None

class EmployeeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    employee_code: str
    first_name: str
    last_name: str
    full_name: str
    email: str
    phone: Optional[str] = None
    department: str
    designation: str
    location: str
    date_of_joining: date
    employment_type: str
    status: str
    salary: Optional[Decimal] = None
    manager_id: Optional[UUID] = None
    created_at: datetime

class EmployeeUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    location: Optional[str] = None
    employment_type: Optional[str] = None
    status: Optional[str] = None
    salary: Optional[Decimal] = None
    manager_id: Optional[UUID] = None

class EmployeeListResponse(BaseModel):
    items: List[EmployeeResponse]
    total: int
    page: int
    size: int
    pages: int
