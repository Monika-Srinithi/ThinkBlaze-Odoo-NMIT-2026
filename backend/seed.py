"""
ThinkBlaze Dayflow — Database Seeder
Creates deterministic demo data for hackathon demonstration.

Usage: python seed.py
Requires: DATABASE_URL in .env file
"""
import asyncio
import random
from datetime import date, datetime, timedelta
from decimal import Decimal
from uuid import uuid4

# Load env before importing app modules
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./dayflow_demo.db")
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

engine = create_async_engine(DATABASE_URL, echo=False)
Session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

# ─── Demo Data Constants ──────────────────────────────────────────
DEPARTMENTS = ["Engineering", "Marketing", "HR", "Finance", "Product"]
DESIGNATIONS = {
    "Engineering": ["Software Engineer", "Senior SWE", "Tech Lead", "DevOps Engineer", "QA Engineer"],
    "Marketing": ["Marketing Analyst", "Content Writer", "SEO Specialist", "Brand Manager", "Digital Marketer"],
    "HR": ["HR Executive", "HR Manager", "Recruiter", "L&D Specialist", "HRBP"],
    "Finance": ["Finance Analyst", "Accountant", "CFO", "Tax Specialist", "Auditor"],
    "Product": ["Product Manager", "UX Designer", "Product Analyst", "Business Analyst", "Scrum Master"],
}
FIRST_NAMES = ["Aarav", "Priya", "Rohit", "Kavya", "Arjun", "Sneha", "Vikram", "Ananya",
               "Kiran", "Pooja", "Rahul", "Meera", "Suresh", "Nisha", "Ramesh", "Divya",
               "Amit", "Sunita", "Vijay", "Rekha", "Ajay", "Sonal", "Deepak", "Neha",
               "Ravi", "Shweta", "Manoj", "Pallavi", "Sanjay", "Rani"]
LAST_NAMES = ["Kumar", "Sharma", "Patel", "Singh", "Gupta", "Nair", "Iyer", "Reddy",
              "Joshi", "Mehta", "Shah", "Bose", "Das", "Verma", "Tiwari", "Rao",
              "Pillai", "Menon", "Krishnan", "Agarwal"]

random.seed(42)  # Deterministic data


async def create_tables():
    from app.core.database import Base
    from app.models import user, employee, attendance, leave, payroll, audit
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✅ Tables created")


async def seed_employees(session: AsyncSession):
    from app.models.employee import Employee, EmploymentType, EmployeeStatus
    employees = []
    # Create department heads first (no manager)
    dept_heads = {}
    for i, dept in enumerate(DEPARTMENTS):
        emp = Employee(
            id=uuid4(),
            employee_code=f"EMP{100 + i:03d}",
            first_name=FIRST_NAMES[i],
            last_name=LAST_NAMES[i],
            email=f"{FIRST_NAMES[i].lower()}.{LAST_NAMES[i].lower()}@dayflow.com",
            phone=f"+91 98765 {43210 + i:05d}",
            department=dept,
            designation=DESIGNATIONS[dept][-1],  # Manager designation
            location="Bangalore",
            date_of_joining=date(2020, 1, 15),
            employment_type=EmploymentType.full_time,
            status=EmployeeStatus.active,
            salary=Decimal(str(random.randint(120000, 200000))),
        )
        session.add(emp)
        dept_heads[dept] = emp
        employees.append(emp)
    await session.flush()
    # Create 25 more employees
    for i in range(25):
        dept = DEPARTMENTS[i % len(DEPARTMENTS)]
        head = dept_heads[dept]
        fname = FIRST_NAMES[(i + 5) % len(FIRST_NAMES)]
        lname = LAST_NAMES[(i + 3) % len(LAST_NAMES)]
        emp = Employee(
            id=uuid4(),
            employee_code=f"EMP{200 + i:03d}",
            first_name=fname,
            last_name=lname,
            email=f"{fname.lower()}.{lname.lower()}{i}@dayflow.com",
            phone=f"+91 87654 {32100 + i:05d}",
            department=dept,
            designation=DESIGNATIONS[dept][i % len(DESIGNATIONS[dept])],
            location="Bangalore" if i % 3 != 0 else "Mumbai",
            date_of_joining=date(2021, (i % 12) + 1, 1),
            date_of_birth=date(1990 + (i % 10), (i % 12) + 1, 15),
            employment_type=EmploymentType.full_time if i % 5 != 0 else EmploymentType.contract,
            status=EmployeeStatus.active,
            manager_id=head.id,
            salary=Decimal(str(random.randint(50000, 150000))),
        )
        session.add(emp)
        employees.append(emp)
    await session.flush()
    print(f"✅ Created {len(employees)} employees")
    return employees


async def seed_users(session: AsyncSession, employees):
    from app.models.user import User, UserRole
    from app.core.security import get_password_hash
    password_hash = get_password_hash("Demo@1234")
    # Admin user
    admin = User(
        id=uuid4(), email="admin@dayflow.com", hashed_password=password_hash,
        full_name="Admin User", role=UserRole.admin, is_active=True
    )
    # HR user linked to HR department employee
    hr_emp = next((e for e in employees if e.department == "HR"), employees[0])
    hr_user = User(
        id=uuid4(), email="hr@dayflow.com", hashed_password=password_hash,
        full_name="HR Manager", role=UserRole.hr, is_active=True, employee_id=hr_emp.id
    )
    # Employee user
    emp = employees[5] if len(employees) > 5 else employees[0]
    emp_user = User(
        id=uuid4(), email="john.doe@dayflow.com", hashed_password=password_hash,
        full_name=f"{emp.first_name} {emp.last_name}", role=UserRole.employee,
        is_active=True, employee_id=emp.id
    )
    for user in [admin, hr_user, emp_user]:
        session.add(user)
    await session.flush()
    print(f"✅ Created 3 users (admin@dayflow.com, hr@dayflow.com, john.doe@dayflow.com | password: Demo@1234)")
    return [admin, hr_user, emp_user]


async def seed_attendance(session: AsyncSession, employees):
    from app.models.attendance import Attendance, AttendanceStatus
    records = []
    today = date.today()
    for emp in employees[:15]:  # Generate for first 15 employees
        for days_ago in range(90):
            record_date = today - timedelta(days=days_ago)
            if record_date.weekday() >= 5:  # Skip weekends
                continue
            rand = random.random()
            if rand < 0.05:
                status = AttendanceStatus.absent
                record = Attendance(
                    id=uuid4(), employee_id=emp.id, date=record_date,
                    status=status, is_anomaly=False
                )
            elif rand < 0.12:
                status = AttendanceStatus.late
                check_in = datetime.combine(record_date, datetime.min.time()).replace(hour=4, minute=random.randint(0, 59))
                hours = round(random.uniform(6, 9), 2)
                check_out = check_in + timedelta(hours=hours)
                record = Attendance(
                    id=uuid4(), employee_id=emp.id, date=record_date,
                    check_in=check_in, check_out=check_out,
                    status=status, hours_worked=Decimal(str(hours)), is_anomaly=False
                )
            elif rand < 0.97:
                status = AttendanceStatus.present
                check_in = datetime.combine(record_date, datetime.min.time()).replace(hour=3, minute=random.randint(20, 45))
                hours = round(random.uniform(7.5, 9.5), 2)
                check_out = check_in + timedelta(hours=hours)
                is_anomaly = hours > 10 or hours < 6
                record = Attendance(
                    id=uuid4(), employee_id=emp.id, date=record_date,
                    check_in=check_in, check_out=check_out,
                    status=status, hours_worked=Decimal(str(hours)),
                    is_anomaly=is_anomaly, anomaly_score=0.9 if is_anomaly else None
                )
            else:
                status = AttendanceStatus.half_day
                check_in = datetime.combine(record_date, datetime.min.time()).replace(hour=3, minute=30)
                check_out = check_in + timedelta(hours=4)
                record = Attendance(
                    id=uuid4(), employee_id=emp.id, date=record_date,
                    check_in=check_in, check_out=check_out,
                    status=status, hours_worked=Decimal('4.0'), is_anomaly=False
                )
            records.append(record)
            session.add(record)
    await session.flush()
    print(f"✅ Created {len(records)} attendance records")


async def seed_leaves(session: AsyncSession, employees):
    from app.models.leave import LeaveRequest, LeaveBalance, LeaveType, LeaveStatus
    today = date.today()
    year = today.year
    # Leave balances for all employees
    for emp in employees:
        for lt, total in [(LeaveType.casual, 12), (LeaveType.sick, 12), (LeaveType.earned, 15)]:
            balance = LeaveBalance(
                id=uuid4(), employee_id=emp.id, leave_type=lt,
                total_days=float(total), used_days=float(random.randint(0, total // 2)),
                pending_days=0.0, year=year
            )
            session.add(balance)
    await session.flush()
    # Leave requests
    statuses = [LeaveStatus.approved, LeaveStatus.approved, LeaveStatus.approved,
                LeaveStatus.pending, LeaveStatus.rejected]
    for i, emp in enumerate(employees[:10]):
        start = today - timedelta(days=random.randint(5, 60))
        end = start + timedelta(days=random.randint(1, 5))
        status = statuses[i % len(statuses)]
        req = LeaveRequest(
            id=uuid4(), employee_id=emp.id,
            leave_type=random.choice(list(LeaveType)),
            start_date=start, end_date=end,
            total_days=float((end - start).days + 1),
            reason="Personal reasons",
            status=status,
            created_at=datetime.utcnow() - timedelta(days=random.randint(1, 30))
        )
        session.add(req)
    await session.flush()
    print(f"✅ Created leave balances and requests")


async def seed_payroll(session: AsyncSession, employees):
    from app.models.payroll import PayrollRecord, PayrollStatus
    today = date.today()
    for emp in employees[:20]:
        for months_ago in range(3):
            month = (today.month - months_ago - 1) % 12 + 1
            year = today.year if today.month > months_ago else today.year - 1
            basic = Decimal(str(emp.salary or 60000))
            hra = (basic * Decimal('0.4')).quantize(Decimal('0.01'))
            allowances = (basic * Decimal('0.1')).quantize(Decimal('0.01'))
            pf = (basic * Decimal('0.12')).quantize(Decimal('0.01'))
            gross = basic + hra + allowances
            tax = (gross * Decimal('0.1')).quantize(Decimal('0.01')) if gross > 50000 else Decimal('0')
            net = gross - pf - tax
            record = PayrollRecord(
                id=uuid4(), employee_id=emp.id, month=month, year=year,
                basic_salary=basic, hra=hra, other_allowances=allowances,
                pf_deduction=pf, tax_deduction=tax, other_deductions=Decimal('0'),
                gross_salary=gross, net_salary=net, status=PayrollStatus.paid,
                payment_date=date(year, month, 28)
            )
            session.add(record)
    await session.flush()
    print(f"✅ Created payroll records")


async def main():
    print("\n🌱 ThinkBlaze Dayflow — Database Seeder")
    print("=" * 50)
    await create_tables()
    async with Session() as session:
        employees = await seed_employees(session)
        users = await seed_users(session, employees)
        await seed_attendance(session, employees)
        await seed_leaves(session, employees)
        await seed_payroll(session, employees)
        await session.commit()
    print("\n✅ Seeding complete!")
    print("\n📋 Demo Credentials:")
    print("  Admin:    admin@dayflow.com    / Demo@1234")
    print("  HR:       hr@dayflow.com       / Demo@1234")
    print("  Employee: john.doe@dayflow.com / Demo@1234")
    print("\n🚀 Run the server: uvicorn app.main:app --reload")
    print("📖 API Docs:       http://localhost:8000/docs\n")


if __name__ == "__main__":
    asyncio.run(main())
