from pydantic import BaseModel, ConfigDict
from typing import Optional
from uuid import UUID
from datetime import date, datetime
from decimal import Decimal

class AttendanceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    employee_id: UUID
    date: date
    check_in: Optional[datetime] = None
    check_out: Optional[datetime] = None
    status: str
    hours_worked: Optional[Decimal] = None
    is_anomaly: bool
    anomaly_score: Optional[float] = None
    created_at: datetime

class CheckInRequest(BaseModel):
    notes: Optional[str] = None

class CheckOutRequest(BaseModel):
    notes: Optional[str] = None

class AttendanceSummary(BaseModel):
    total_working_days: int
    present_days: int
    absent_days: int
    late_days: int
    half_days: int
    total_hours: float
    average_hours: float
    attendance_rate: float
