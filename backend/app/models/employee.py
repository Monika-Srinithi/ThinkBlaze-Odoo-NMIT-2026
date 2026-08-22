import uuid
from datetime import datetime
from sqlalchemy import Column, String, Numeric, Enum, Date, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum

class EmploymentType(str, enum.Enum):
    full_time = 'full_time'
    part_time = 'part_time'
    contract = 'contract'
    intern = 'intern'

class EmployeeStatus(str, enum.Enum):
    active = 'active'
    on_leave = 'on_leave'
    terminated = 'terminated'

class Employee(Base):
    __tablename__ = 'employees'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    employee_code = Column(String(20), unique=True, nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    phone = Column(String(20), nullable=True)
    department = Column(String(100), nullable=False)
    designation = Column(String(150), nullable=False)
    location = Column(String(100), default='Bangalore')
    date_of_joining = Column(Date, nullable=False)
    date_of_birth = Column(Date, nullable=True)
    employment_type = Column(Enum(EmploymentType), default=EmploymentType.full_time)
    status = Column(Enum(EmployeeStatus), default=EmployeeStatus.active)
    manager_id = Column(UUID(as_uuid=True), ForeignKey('employees.id', ondelete='SET NULL'), nullable=True)
    salary = Column(Numeric(12, 2), default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user = relationship('User', back_populates='employee', uselist=False, foreign_keys='User.employee_id')
    attendance_records = relationship('Attendance', back_populates='employee')
    leave_requests = relationship('LeaveRequest', back_populates='employee', foreign_keys='LeaveRequest.employee_id')
    payroll_records = relationship('PayrollRecord', back_populates='employee')
    @property
    def full_name(self):
        return f'{self.first_name} {self.last_name}'
