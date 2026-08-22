import uuid
from datetime import datetime
from sqlalchemy import Column, Numeric, Integer, String, Enum, Date, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum

class PayrollStatus(str, enum.Enum):
    draft = 'draft'
    processed = 'processed'
    paid = 'paid'

class PayrollRecord(Base):
    __tablename__ = 'payroll_records'
    __table_args__ = (UniqueConstraint('employee_id', 'month', 'year'),)
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    employee_id = Column(String(36), ForeignKey('employees.id', ondelete='CASCADE'), nullable=False)
    month = Column(Integer, nullable=False)
    year = Column(Integer, nullable=False)
    basic_salary = Column(Numeric(12, 2), default=0)
    hra = Column(Numeric(12, 2), default=0)
    other_allowances = Column(Numeric(12, 2), default=0)
    pf_deduction = Column(Numeric(12, 2), default=0)
    tax_deduction = Column(Numeric(12, 2), default=0)
    other_deductions = Column(Numeric(12, 2), default=0)
    gross_salary = Column(Numeric(12, 2), default=0)
    net_salary = Column(Numeric(12, 2), default=0)
    status = Column(Enum(PayrollStatus), default=PayrollStatus.draft)
    payment_date = Column(Date, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    employee = relationship('Employee', back_populates='payroll_records')
