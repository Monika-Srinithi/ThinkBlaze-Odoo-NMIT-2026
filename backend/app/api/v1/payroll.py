from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from typing import Optional
import uuid
from datetime import date
from decimal import Decimal

from app.core.database import get_db
from app.services.auth_service import get_current_user, require_hr
from app.models.payroll import PayrollRecord, PayrollStatus
from app.models.employee import Employee
from app.models.user import User

router = APIRouter(prefix='/payroll', tags=['Payroll'])


def payroll_to_dict(p: PayrollRecord, emp: Employee = None) -> dict:
    return {
        "id": str(p.id),
        "employee_id": str(p.employee_id),
        "employee_name": f"{emp.first_name} {emp.last_name}" if emp else None,
        "employee_code": emp.employee_code if emp else None,
        "department": emp.department if emp else None,
        "month": p.month,
        "year": p.year,
        "period": f"{['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][p.month-1]} {p.year}",
        "basic_salary": float(p.basic_salary or 0),
        "hra": float(p.hra or 0),
        "other_allowances": float(p.other_allowances or 0),
        "gross_salary": float(p.gross_salary or 0),
        "pf_deduction": float(p.pf_deduction or 0),
        "tax_deduction": float(p.tax_deduction or 0),
        "other_deductions": float(p.other_deductions or 0),
        "net_salary": float(p.net_salary or 0),
        "status": p.status if isinstance(p.status, str) else p.status.value,
        "payment_date": str(p.payment_date) if p.payment_date else None,
    }


@router.get('/my')
async def get_my_payroll(
    limit: int = Query(12),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.employee_id:
        return []
    result = await db.execute(
        select(PayrollRecord, Employee)
        .join(Employee, Employee.id == PayrollRecord.employee_id)
        .where(PayrollRecord.employee_id == current_user.employee_id)
        .order_by(PayrollRecord.year.desc(), PayrollRecord.month.desc())
        .limit(limit)
    )
    return [payroll_to_dict(p, e) for p, e in result.all()]


@router.get('')
async def list_payroll(
    employee_id: Optional[str] = None,
    month: Optional[int] = None,
    year: Optional[int] = None,
    limit: int = Query(50),
    offset: int = Query(0),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_hr),
):
    q = select(PayrollRecord, Employee).join(Employee, Employee.id == PayrollRecord.employee_id)
    if employee_id:
        q = q.where(PayrollRecord.employee_id == employee_id)
    if month:
        q = q.where(PayrollRecord.month == month)
    if year:
        q = q.where(PayrollRecord.year == year)
    q = q.order_by(PayrollRecord.year.desc(), PayrollRecord.month.desc()).limit(limit).offset(offset)
    result = await db.execute(q)
    return [payroll_to_dict(p, e) for p, e in result.all()]


@router.get('/{payroll_id}')
async def get_payroll(
    payroll_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(PayrollRecord, Employee)
        .join(Employee, Employee.id == PayrollRecord.employee_id)
        .where(PayrollRecord.id == payroll_id)
    )
    row = result.first()
    if not row:
        raise HTTPException(status_code=404, detail='Payroll record not found')
    p, e = row
    if current_user.role == 'employee' and str(e.id) != str(current_user.employee_id):
        raise HTTPException(status_code=403, detail='Access denied')
    return payroll_to_dict(p, e)


@router.post('/generate', status_code=201)
async def generate_payroll(
    body: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_hr),
):
    month = body.get('month', date.today().month)
    year = body.get('year', date.today().year)

    # Get all active employees
    result = await db.execute(
        select(Employee).where(Employee.status.in_(['active', 'on_leave']))
    )
    employees = result.scalars().all()
    created = 0
    skipped = 0

    for emp in employees:
        # Check if already exists
        exists = await db.execute(
            select(PayrollRecord).where(
                and_(
                    PayrollRecord.employee_id == emp.id,
                    PayrollRecord.month == month,
                    PayrollRecord.year == year,
                )
            )
        )
        if exists.scalar_one_or_none():
            skipped += 1
            continue
        basic = emp.salary or Decimal('50000')
        hra = (basic * Decimal('0.4')).quantize(Decimal('0.01'))
        allow = (basic * Decimal('0.1')).quantize(Decimal('0.01'))
        pf = (basic * Decimal('0.12')).quantize(Decimal('0.01'))
        gross = basic + hra + allow
        tax = (gross * Decimal('0.1')).quantize(Decimal('0.01')) if gross > 50000 else Decimal('0')
        net = gross - pf - tax
        pr = PayrollRecord(
            id=str(uuid.uuid4()),
            employee_id=emp.id,
            month=month, year=year,
            basic_salary=basic, hra=hra, other_allowances=allow,
            pf_deduction=pf, tax_deduction=tax, other_deductions=Decimal('0'),
            gross_salary=gross, net_salary=net,
            status='processed',
            payment_date=date(year, month, 28),
        )
        db.add(pr)
        created += 1

    await db.commit()
    return {"message": f"Payroll generated: {created} created, {skipped} already existed", "month": month, "year": year}
