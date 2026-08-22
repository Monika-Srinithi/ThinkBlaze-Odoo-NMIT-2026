from pydantic import BaseModel, ConfigDict
from typing import Optional
from uuid import UUID
from datetime import date, datetime
from decimal import Decimal

class PayrollResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    employee_id: UUID
    month: int
    year: int
    basic_salary: Decimal
    hra: Decimal
    other_allowances: Decimal
    pf_deduction: Decimal
    tax_deduction: Decimal
    other_deductions: Decimal
    gross_salary: Decimal
    net_salary: Decimal
    status: str
    payment_date: Optional[date] = None
    created_at: datetime

class PayrollCreate(BaseModel):
    employee_id: UUID
    month: int
    year: int
    basic_salary: Decimal
    hra: Decimal = Decimal('0')
    other_allowances: Decimal = Decimal('0')
    pf_deduction: Decimal = Decimal('0')
    tax_deduction: Decimal = Decimal('0')
    other_deductions: Decimal = Decimal('0')
