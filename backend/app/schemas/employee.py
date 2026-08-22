from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import date


class EmployeeCreate(BaseModel):
    employee_code: str
    first_name: str
    last_name: str
    email: str
    phone: Optional[str] = None
    department: str
    designation: str
    location: str = "Bangalore"
    date_of_joining: date
    date_of_birth: Optional[date] = None
    employment_type: str = "full_time"
    salary: Optional[float] = 0


class EmployeeUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    location: Optional[str] = None
    employment_type: Optional[str] = None
    status: Optional[str] = None
    salary: Optional[float] = None


class EmployeeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    employee_code: str
    first_name: str
    last_name: str
    email: str
    phone: Optional[str] = None
    department: str
    designation: str
    location: Optional[str] = None
    date_of_joining: Optional[date] = None
    date_of_birth: Optional[date] = None
    employment_type: str
    status: str
    salary: Optional[float] = None


class EmployeeListResponse(BaseModel):
    items: list[EmployeeResponse]
    total: int
    page: int
    pages: int


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    email: str
    full_name: str
    role: str
    is_active: bool
