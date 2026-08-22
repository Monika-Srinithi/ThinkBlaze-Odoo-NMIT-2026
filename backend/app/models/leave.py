import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, Enum, Date, DateTime, ForeignKey, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum

class LeaveType(str, enum.Enum):
    casual = 'casual'
    sick = 'sick'
    earned = 'earned'
    maternity = 'maternity'
    paternity = 'paternity'
    emergency = 'emergency'

class LeaveStatus(str, enum.Enum):
    pending = 'pending'
    approved = 'approved'
    rejected = 'rejected'
    cancelled = 'cancelled'

class LeaveRequest(Base):
    __tablename__ = 'leave_requests'
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    employee_id = Column(String(36), ForeignKey('employees.id', ondelete='CASCADE'), nullable=False)
    leave_type = Column(String(20), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    total_days = Column(Float, nullable=False)
    reason = Column(Text, nullable=False)
    status = Column(String(20), default='pending')
    approved_by = Column(String(36), ForeignKey('employees.id', ondelete='SET NULL'), nullable=True)
    approved_at = Column(DateTime, nullable=True)
    rejection_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    employee = relationship('Employee', back_populates='leave_requests', foreign_keys=[employee_id])
    approver = relationship('Employee', foreign_keys=[approved_by])

class LeaveBalance(Base):
    __tablename__ = 'leave_balances'
    __table_args__ = (UniqueConstraint('employee_id', 'leave_type', 'year'),)
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    employee_id = Column(String(36), ForeignKey('employees.id', ondelete='CASCADE'), nullable=False)
    leave_type = Column(String(20), nullable=False)
    total_days = Column(Float, default=0)
    used_days = Column(Float, default=0)
    pending_days = Column(Float, default=0)
    year = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
