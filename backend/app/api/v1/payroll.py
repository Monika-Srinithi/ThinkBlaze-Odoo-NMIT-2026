from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.services.auth_service import get_current_user, require_hr
from app.schemas.payroll import PayrollResponse, PayrollCreate
from app.models.user import User
from app.models.payroll import PayrollRecord, PayrollStatus
from app.models.employee import Employee
from uuid import UUID
from decimal import Decimal

router = APIRouter(prefix='/payroll', tags=['Payroll'])


@router.get('/my', response_model=list[PayrollResponse])
async def get_my_payroll(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(PayrollRecord)
        .where(PayrollRecord.employee_id == current_user.employee_id)
        .order_by(PayrollRecord.year.desc(), PayrollRecord.month.desc())
        .limit(24)
    )
    records = result.scalars().all()
    return [PayrollResponse.model_validate(r) for r in records]


@router.get('', response_model=list[PayrollResponse])
async def get_all_payroll(
    year: int = Query(None),
    month: int = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_hr)
):
    from sqlalchemy import and_
    query = select(PayrollRecord)
    filters = []
    if year:
        filters.append(PayrollRecord.year == year)
    if month:
        filters.append(PayrollRecord.month == month)
    if filters:
        query = query.where(and_(*filters))
    query = query.order_by(PayrollRecord.year.desc(), PayrollRecord.month.desc()).limit(500)
    result = await db.execute(query)
    records = result.scalars().all()
    return [PayrollResponse.model_validate(r) for r in records]


@router.post('/generate', status_code=201)
async def generate_payroll(
    month: int = Query(..., ge=1, le=12),
    year: int = Query(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_hr)
):
    # Get all active employees
    result = await db.execute(select(Employee).where(Employee.status == 'active'))
    employees = result.scalars().all()
    generated = 0
    for emp in employees:
        # Check if already generated
        existing = await db.execute(
            select(PayrollRecord).where(
                PayrollRecord.employee_id == emp.id,
                PayrollRecord.month == month,
                PayrollRecord.year == year
            )
        )
        if existing.scalar_one_or_none():
            continue
        basic = Decimal(str(emp.salary or 50000))
        hra = basic * Decimal('0.4')
        other_allowances = basic * Decimal('0.1')
        pf = basic * Decimal('0.12')
        gross = basic + hra + other_allowances
        tax = gross * Decimal('0.1') if gross > Decimal('50000') else Decimal('0')
        net = gross - pf - tax
        record = PayrollRecord(
            employee_id=emp.id, month=month, year=year,
            basic_salary=basic, hra=hra, other_allowances=other_allowances,
            pf_deduction=pf, tax_deduction=tax, other_deductions=Decimal('0'),
            gross_salary=gross, net_salary=net, status=PayrollStatus.processed
        )
        db.add(record)
        generated += 1
    await db.commit()
    return {'message': f'Generated payroll for {generated} employees', 'month': month, 'year': year}


@router.get('/{payroll_id}', response_model=PayrollResponse)
async def get_payslip(
    payroll_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from fastapi import HTTPException
    result = await db.execute(select(PayrollRecord).where(PayrollRecord.id == payroll_id))
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=404, detail='Payslip not found')
    # Employees can only see their own
    if current_user.role == 'employee' and record.employee_id != current_user.employee_id:
        raise HTTPException(status_code=403, detail='Access denied')
    return PayrollResponse.model_validate(record)
