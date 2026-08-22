import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, Float, Numeric, Enum, Date, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum

class AttendanceStatus(str, enum.Enum):
    present = 'present'
    absent = 'absent'
    late = 'late'
    half_day = 'half_day'
    on_leave = 'on_leave'

class Attendance(Base):
    __tablename__ = 'attendance'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    employee_id = Column(UUID(as_uuid=True), ForeignKey('employees.id', ondelete='CASCADE'), nullable=False)
    date = Column(Date, nullable=False)
    check_in = Column(DateTime, nullable=True)
    check_out = Column(DateTime, nullable=True)
    status = Column(Enum(AttendanceStatus), default=AttendanceStatus.absent)
    hours_worked = Column(Numeric(5, 2), nullable=True)
    notes = Column(Text, nullable=True)
    is_anomaly = Column(Boolean, default=False)
    anomaly_score = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    employee = relationship('Employee', back_populates='attendance_records')
