from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from uuid import UUID
from datetime import date, datetime

class LeaveRequestCreate(BaseModel):
    leave_type: str
    start_date: date
    end_date: date
    reason: str

class LeaveRequestResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    employee_id: UUID
    leave_type: str
    start_date: date
    end_date: date
    total_days: float
    reason: str
    status: str
    approved_by: Optional[UUID] = None
    approved_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    created_at: datetime

class LeaveApprovalRequest(BaseModel):
    rejection_reason: Optional[str] = None

class LeaveBalanceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    leave_type: str
    total_days: float
    used_days: float
    pending_days: float
    remaining_days: float
    year: int
