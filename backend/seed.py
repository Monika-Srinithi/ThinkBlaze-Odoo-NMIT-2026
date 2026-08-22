"""
Dayflow â€” WOW Demo Seed Data
Creates a perfect hackathon demo scenario that guarantees the WOW workflow works.

Scenario:
- 5 teams, 45 employees
- Team Beta: 2 approved leaves + 1 pending leave â†’ HIGH RISK
- Pending leave from Ravi Sharma triggers capacity crisis
- Simulating approval â†’ Team Beta drops to 54%
- AI recommends: Approve + reassign Ananya Kumar (backup)
- Apply â†’ capacity improves to 74%
"""
import asyncio
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

import uuid
from datetime import date, datetime, timedelta
from decimal import Decimal
import random

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./dayflow_demo.db")

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

engine = create_async_engine(DATABASE_URL, echo=False)
Session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

# â”€â”€â”€ DETERMINISTIC DEMO DATA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

TEAMS = {
    "Team Alpha": {"dept": "Engineering", "head": "Arjun Sharma", "target_capacity": 92},
    "Team Beta": {"dept": "Product", "head": "Priya Nair", "target_capacity": 54},   # THE CRISIS TEAM
    "Team Gamma": {"dept": "Marketing", "head": "Vikram Patel", "target_capacity": 87},
    "Team Delta": {"dept": "Finance", "head": "Kavya Iyer", "target_capacity": 89},
    "Team Epsilon": {"dept": "HR", "head": "Sneha Reddy", "target_capacity": 91},
}

DEMO_EMPLOYEES = [
    # Team Alpha - Engineering (9 members)
    {"code": "EMP001", "first": "Arjun", "last": "Sharma", "team": "Team Alpha", "dept": "Engineering", "role": "Tech Lead", "salary": 150000, "is_head": True},
    {"code": "EMP002", "first": "Deepak", "last": "Mehta", "team": "Team Alpha", "dept": "Engineering", "role": "Senior SWE", "salary": 120000},
    {"code": "EMP003", "first": "Rahul", "last": "Gupta", "team": "Team Alpha", "dept": "Engineering", "role": "Software Engineer", "salary": 85000},
    {"code": "EMP004", "first": "Sunita", "last": "Das", "team": "Team Alpha", "dept": "Engineering", "role": "DevOps Engineer", "salary": 95000},
    {"code": "EMP005", "first": "Manoj", "last": "Singh", "team": "Team Alpha", "dept": "Engineering", "role": "QA Engineer", "salary": 75000},
    {"code": "EMP006", "first": "Pooja", "last": "Verma", "team": "Team Alpha", "dept": "Engineering", "role": "Software Engineer", "salary": 80000},
    {"code": "EMP007", "first": "Suresh", "last": "Kumar", "team": "Team Alpha", "dept": "Engineering", "role": "Software Engineer", "salary": 78000},
    {"code": "EMP008", "first": "Rekha", "last": "Rao", "team": "Team Alpha", "dept": "Engineering", "role": "UX Designer", "salary": 88000},
    {"code": "EMP009", "first": "Ajay", "last": "Krishnan", "team": "Team Alpha", "dept": "Engineering", "role": "Software Engineer", "salary": 82000},

    # Team Beta - Product (8 members) â€” THE CRISIS TEAM
    {"code": "EMP010", "first": "Priya", "last": "Nair", "team": "Team Beta", "dept": "Product", "role": "Product Manager", "salary": 145000, "is_head": True},
    {"code": "EMP011", "first": "Ravi", "last": "Sharma", "team": "Team Beta", "dept": "Product", "role": "Product Analyst", "salary": 90000, "pending_leave": True},  # THE PENDING LEAVE PERSON
    {"code": "EMP012", "first": "Meera", "last": "Patel", "team": "Team Beta", "dept": "Product", "role": "Business Analyst", "salary": 85000, "on_leave": True},
    {"code": "EMP013", "first": "Kiran", "last": "Reddy", "team": "Team Beta", "dept": "Product", "role": "Scrum Master", "salary": 95000, "on_leave": True},
    {"code": "EMP014", "first": "Ananya", "last": "Kumar", "team": "Team Beta", "dept": "Product", "role": "Product Analyst", "salary": 88000, "backup": True},  # THE BACKUP
    {"code": "EMP015", "first": "Vijay", "last": "Menon", "team": "Team Beta", "dept": "Product", "role": "UX Designer", "salary": 92000},
    {"code": "EMP016", "first": "Divya", "last": "Joshi", "team": "Team Beta", "dept": "Product", "role": "Business Analyst", "salary": 82000},
    {"code": "EMP017", "first": "Amit", "last": "Pillai", "team": "Team Beta", "dept": "Product", "role": "Product Analyst", "salary": 86000},

    # Team Gamma - Marketing (9 members)
    {"code": "EMP018", "first": "Vikram", "last": "Patel", "team": "Team Gamma", "dept": "Marketing", "role": "Brand Manager", "salary": 130000, "is_head": True},
    {"code": "EMP019", "first": "Nisha", "last": "Agarwal", "team": "Team Gamma", "dept": "Marketing", "role": "Content Writer", "salary": 65000},
    {"code": "EMP020", "first": "Ramesh", "last": "Tiwari", "team": "Team Gamma", "dept": "Marketing", "role": "SEO Specialist", "salary": 72000},
    {"code": "EMP021", "first": "Rani", "last": "Shah", "team": "Team Gamma", "dept": "Marketing", "role": "Digital Marketer", "salary": 70000},
    {"code": "EMP022", "first": "Sanjay", "last": "Bose", "team": "Team Gamma", "dept": "Marketing", "role": "Marketing Analyst", "salary": 75000},
    {"code": "EMP023", "first": "Pallavi", "last": "Iyer", "team": "Team Gamma", "dept": "Marketing", "role": "Content Writer", "salary": 68000},
    {"code": "EMP024", "first": "Shweta", "last": "Nair", "team": "Team Gamma", "dept": "Marketing", "role": "Digital Marketer", "salary": 71000},
    {"code": "EMP025", "first": "Sonal", "last": "Mehta", "team": "Team Gamma", "dept": "Marketing", "role": "Marketing Analyst", "salary": 74000},
    {"code": "EMP026", "first": "Rohit", "last": "Das", "team": "Team Gamma", "dept": "Marketing", "role": "SEO Specialist", "salary": 73000},

    # Team Delta - Finance (9 members)
    {"code": "EMP027", "first": "Kavya", "last": "Iyer", "team": "Team Delta", "dept": "Finance", "role": "Finance Manager", "salary": 140000, "is_head": True},
    {"code": "EMP028", "first": "Arun", "last": "Kumar", "team": "Team Delta", "dept": "Finance", "role": "Senior Accountant", "salary": 95000},
    {"code": "EMP029", "first": "Latha", "last": "Pillai", "team": "Team Delta", "dept": "Finance", "role": "Tax Specialist", "salary": 88000},
    {"code": "EMP030", "first": "Mohan", "last": "Singh", "team": "Team Delta", "dept": "Finance", "role": "Auditor", "salary": 92000},
    {"code": "EMP031", "first": "Usha", "last": "Krishnan", "team": "Team Delta", "dept": "Finance", "role": "Finance Analyst", "salary": 78000},
    {"code": "EMP032", "first": "Ganesh", "last": "Rao", "team": "Team Delta", "dept": "Finance", "role": "Accountant", "salary": 72000},
    {"code": "EMP033", "first": "Indira", "last": "Patel", "team": "Team Delta", "dept": "Finance", "role": "Finance Analyst", "salary": 76000},
    {"code": "EMP034", "first": "Raj", "last": "Sharma", "team": "Team Delta", "dept": "Finance", "role": "Auditor", "salary": 85000},
    {"code": "EMP035", "first": "Mala", "last": "Gupta", "team": "Team Delta", "dept": "Finance", "role": "Accountant", "salary": 70000},

    # Team Epsilon - HR (10 members)
    {"code": "EMP036", "first": "Sneha", "last": "Reddy", "team": "Team Epsilon", "dept": "HR", "role": "HR Manager", "salary": 135000, "is_head": True},
    {"code": "EMP037", "first": "Preethi", "last": "Menon", "team": "Team Epsilon", "dept": "HR", "role": "HRBP", "salary": 98000},
    {"code": "EMP038", "first": "Ritu", "last": "Joshi", "team": "Team Epsilon", "dept": "HR", "role": "Recruiter", "salary": 72000},
    {"code": "EMP039", "first": "Kartik", "last": "Verma", "team": "Team Epsilon", "dept": "HR", "role": "L&D Specialist", "salary": 78000},
    {"code": "EMP040", "first": "Swati", "last": "Agarwal", "team": "Team Epsilon", "dept": "HR", "role": "HR Executive", "salary": 65000},
    {"code": "EMP041", "first": "Nikhil", "last": "Shah", "team": "Team Epsilon", "dept": "HR", "role": "Recruiter", "salary": 70000},
    {"code": "EMP042", "first": "Tanvi", "last": "Bose", "team": "Team Epsilon", "dept": "HR", "role": "HR Executive", "salary": 64000},
    {"code": "EMP043", "first": "Harish", "last": "Kumar", "team": "Team Epsilon", "dept": "HR", "role": "HRBP", "salary": 95000},
    {"code": "EMP044", "first": "Lavanya", "last": "Nair", "team": "Team Epsilon", "dept": "HR", "role": "L&D Specialist", "salary": 76000},
    {"code": "EMP045", "first": "Yuvraj", "last": "Pillai", "team": "Team Epsilon", "dept": "HR", "role": "HR Executive", "salary": 63000},
]


async def create_tables():
    from app.core.database import Base
    from app.models import user, employee, attendance, leave, payroll, audit
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("âœ… Tables created")


async def seed_all():
    from app.models.employee import Employee, EmploymentType, EmployeeStatus
    from app.models.user import User, UserRole
    from app.models.attendance import Attendance, AttendanceStatus
    from app.models.leave import LeaveRequest, LeaveBalance, LeaveType, LeaveStatus
    from app.models.payroll import PayrollRecord, PayrollStatus
    from app.core.security import get_password_hash

    today = date.today()
    year = today.year
    password_hash = get_password_hash("Demo@1234")

    async with Session() as session:
        # â”€â”€ CREATE EMPLOYEES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        employee_objects = {}
        pending_leave_emp = None
        backup_emp = None

        for data in DEMO_EMPLOYEES:
            emp_id = str(uuid.uuid4())
            emp = Employee(
                id=emp_id,
                employee_code=data["code"],
                first_name=data["first"],
                last_name=data["last"],
                email=f"{data['first'].lower()}.{data['last'].lower()}@dayflow.com",
                phone=f"+91 98765 {int(data['code'][3:]):05d}",
                department=data["team"],  # Use team as department for clarity
                designation=data["role"],
                location="Bangalore",
                date_of_joining=date(2021, (int(data["code"][3:]) % 12) + 1, 1),
                date_of_birth=date(1990 + (int(data["code"][3:]) % 8), (int(data["code"][3:]) % 12) + 1, 15),
                employment_type=EmploymentType.full_time,
                status=EmployeeStatus.on_leave if data.get("on_leave") else EmployeeStatus.active,
                salary=Decimal(str(data["salary"])),
            )
            session.add(emp)
            employee_objects[data["code"]] = emp
            if data.get("pending_leave"):
                pending_leave_emp = emp
            if data.get("backup"):
                backup_emp = emp

        await session.flush()

        # â”€â”€ CREATE USERS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        # Admin / HR user
        hr_emp = employee_objects["EMP036"]  # Sneha Reddy - HR Manager
        admin_user = User(
            id=str(uuid.uuid4()),
            email="admin@dayflow.com",
            hashed_password=password_hash,
            full_name="Admin HR",
            role=UserRole.admin,
            is_active=True,
            employee_id=hr_emp.id,
        )
        session.add(admin_user)

        # HR user (Priya Nair - Team Beta head, for seeing crisis)
        priya_emp = employee_objects["EMP010"]
        hr_user = User(
            id=str(uuid.uuid4()),
            email="hr@dayflow.com",
            hashed_password=password_hash,
            full_name="Priya Nair (HR)",
            role=UserRole.hr,
            is_active=True,
            employee_id=priya_emp.id,
        )
        session.add(hr_user)

        # Demo employee user - Ravi Sharma (the pending leave person)
        ravi_emp = employee_objects["EMP011"]
        ravi_user = User(
            id=str(uuid.uuid4()),
            email="ravi.sharma@dayflow.com",
            hashed_password=password_hash,
            full_name="Ravi Sharma",
            role=UserRole.employee,
            is_active=True,
            employee_id=ravi_emp.id,
        )
        session.add(ravi_user)

        # Another employee user
        arjun_emp = employee_objects["EMP001"]
        emp_user = User(
            id=str(uuid.uuid4()),
            email="arjun.sharma@dayflow.com",
            hashed_password=password_hash,
            full_name="Arjun Sharma",
            role=UserRole.employee,
            is_active=True,
            employee_id=arjun_emp.id,
        )
        session.add(emp_user)
        await session.flush()

        # â”€â”€ ATTENDANCE RECORDS (90 days) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        # Team Beta has notably worse attendance to drive up risk score
        team_beta_codes = {"EMP010", "EMP011", "EMP012", "EMP013", "EMP014", "EMP015", "EMP016", "EMP017"}

        for emp_data in DEMO_EMPLOYEES:
            emp = employee_objects[emp_data["code"]]
            is_beta = emp_data["code"] in team_beta_codes
            is_on_leave = emp_data.get("on_leave", False)

            for days_ago in range(90, 0, -1):
                record_date = today - timedelta(days=days_ago)
                if record_date.weekday() >= 5:
                    continue

                # On-leave employees are on leave for last 5 days
                if is_on_leave and days_ago <= 5:
                    att = Attendance(
                        id=str(uuid.uuid4()), employee_id=emp.id, date=record_date,
                        status=AttendanceStatus.on_leave, is_anomaly=False
                    )
                    session.add(att)
                    continue

                # Team Beta has higher absence/late rate (drives risk)
                rand = hash(f"{emp.id}{record_date}") % 100
                if is_beta:
                    if rand < 12:  # 12% absent
                        att = Attendance(id=str(uuid.uuid4()), employee_id=emp.id, date=record_date,
                                         status=AttendanceStatus.absent, is_anomaly=False)
                    elif rand < 25:  # 13% late
                        checkin = datetime.combine(record_date, datetime.min.time()).replace(hour=4, minute=(rand % 30) + 20)
                        hours = 7.0 + (rand % 20) / 10
                        checkout = checkin + timedelta(hours=hours)
                        att = Attendance(id=str(uuid.uuid4()), employee_id=emp.id, date=record_date,
                                         check_in=checkin, check_out=checkout,
                                         status=AttendanceStatus.late, hours_worked=Decimal(str(round(hours, 2))),
                                         is_anomaly=False)
                    else:
                        checkin = datetime.combine(record_date, datetime.min.time()).replace(hour=3, minute=(rand % 30) + 15)
                        hours = 7.5 + (rand % 20) / 10
                        checkout = checkin + timedelta(hours=hours)
                        att = Attendance(id=str(uuid.uuid4()), employee_id=emp.id, date=record_date,
                                         check_in=checkin, check_out=checkout,
                                         status=AttendanceStatus.present, hours_worked=Decimal(str(round(hours, 2))),
                                         is_anomaly=False)
                else:
                    if rand < 4:  # 4% absent
                        att = Attendance(id=str(uuid.uuid4()), employee_id=emp.id, date=record_date,
                                         status=AttendanceStatus.absent, is_anomaly=False)
                    elif rand < 9:
                        checkin = datetime.combine(record_date, datetime.min.time()).replace(hour=3, minute=(rand % 15) + 50)
                        hours = 8.0 + (rand % 15) / 10
                        checkout = checkin + timedelta(hours=hours)
                        att = Attendance(id=str(uuid.uuid4()), employee_id=emp.id, date=record_date,
                                         check_in=checkin, check_out=checkout,
                                         status=AttendanceStatus.late, hours_worked=Decimal(str(round(hours, 2))),
                                         is_anomaly=False)
                    else:
                        checkin = datetime.combine(record_date, datetime.min.time()).replace(hour=3, minute=(rand % 25) + 20)
                        hours = 8.0 + (rand % 15) / 10
                        checkout = checkin + timedelta(hours=hours)
                        att = Attendance(id=str(uuid.uuid4()), employee_id=emp.id, date=record_date,
                                         check_in=checkin, check_out=checkout,
                                         status=AttendanceStatus.present, hours_worked=Decimal(str(round(hours, 2))),
                                         is_anomaly=False)
                session.add(att)

        await session.flush()

        # â”€â”€ LEAVE BALANCES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        for emp_data in DEMO_EMPLOYEES:
            emp = employee_objects[emp_data["code"]]
            for lt, total in [("casual", 12), ("sick", 12), ("earned", 15)]:
                used = 2 if emp_data.get("on_leave") else (1 if "EMP01" in emp_data["code"] else 0)
                session.add(LeaveBalance(
                    id=str(uuid.uuid4()), employee_id=emp.id, leave_type=lt,
                    total_days=float(total), used_days=float(used),
                    pending_days=3.0 if emp_data.get("pending_leave") else 0.0, year=year
                ))

        await session.flush()

        # â”€â”€ LEAVE REQUESTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        # Meera Patel - approved leave (currently on leave)
        meera_emp = employee_objects["EMP012"]
        priya_head = employee_objects["EMP010"]
        leave_start = today - timedelta(days=3)
        leave_end = today + timedelta(days=2)
        session.add(LeaveRequest(
            id=str(uuid.uuid4()), employee_id=meera_emp.id,
            leave_type="earned", start_date=leave_start, end_date=leave_end,
            total_days=5.0, reason="Family event",
            status=LeaveStatus.approved,
            approved_by=priya_head.id, approved_at=datetime.utcnow() - timedelta(days=5),
            created_at=datetime.utcnow() - timedelta(days=6)
        ))

        # Kiran Reddy - approved leave (currently on leave)
        kiran_emp = employee_objects["EMP013"]
        session.add(LeaveRequest(
            id=str(uuid.uuid4()), employee_id=kiran_emp.id,
            leave_type="sick", start_date=today - timedelta(days=2), end_date=today + timedelta(days=1),
            total_days=3.0, reason="Medical appointment",
            status=LeaveStatus.approved,
            approved_by=priya_head.id, approved_at=datetime.utcnow() - timedelta(days=3),
            created_at=datetime.utcnow() - timedelta(days=4)
        ))

        # â˜… THE KEY PENDING LEAVE â€” Ravi Sharma (EMP011)
        # This is what triggers the WOW demo
        pending_leave_id = str(uuid.uuid4())
        ravi_leave_start = today + timedelta(days=1)
        ravi_leave_end = today + timedelta(days=5)
        session.add(LeaveRequest(
            id=pending_leave_id, employee_id=ravi_emp.id,
            leave_type="casual", start_date=ravi_leave_start, end_date=ravi_leave_end,
            total_days=5.0, reason="Personal work â€” need to attend to family matter in hometown",
            status=LeaveStatus.pending,
            created_at=datetime.utcnow() - timedelta(hours=3)
        ))

        # Some other approved leaves for other teams (normal)
        for code, days_ago_start, days in [("EMP003", 10, 2), ("EMP019", 15, 3), ("EMP028", 8, 1)]:
            e = employee_objects[code]
            s = today - timedelta(days=days_ago_start)
            en = s + timedelta(days=days)
            session.add(LeaveRequest(
                id=str(uuid.uuid4()), employee_id=e.id,
                leave_type="casual", start_date=s, end_date=en,
                total_days=float(days), reason="Personal",
                status=LeaveStatus.approved,
                approved_by=priya_head.id, approved_at=datetime.utcnow() - timedelta(days=days_ago_start + 2),
                created_at=datetime.utcnow() - timedelta(days=days_ago_start + 3)
            ))

        await session.flush()

        # â”€â”€ PAYROLL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        for emp_data in DEMO_EMPLOYEES[:20]:
            emp = employee_objects[emp_data["code"]]
            for m in range(1, 4):
                month = (today.month - m - 1) % 12 + 1
                yr = year if today.month > m else year - 1
                basic = Decimal(str(emp_data["salary"]))
                hra = (basic * Decimal("0.4")).quantize(Decimal("0.01"))
                allow = (basic * Decimal("0.1")).quantize(Decimal("0.01"))
                pf = (basic * Decimal("0.12")).quantize(Decimal("0.01"))
                gross = basic + hra + allow
                tax = (gross * Decimal("0.1")).quantize(Decimal("0.01")) if gross > 50000 else Decimal("0")
                net = gross - pf - tax
                session.add(PayrollRecord(
                    id=str(uuid.uuid4()), employee_id=emp.id, month=month, year=yr,
                    basic_salary=basic, hra=hra, other_allowances=allow,
                    pf_deduction=pf, tax_deduction=tax, other_deductions=Decimal("0"),
                    gross_salary=gross, net_salary=net, status=PayrollStatus.paid,
                    payment_date=date(yr, month, 28)
                ))

        await session.commit()

    print(f"âœ… Seeded {len(DEMO_EMPLOYEES)} employees across 5 teams")
    print(f"âœ… Team Beta crisis scenario ready:")
    print(f"   - Meera Patel: APPROVED leave (on leave now)")
    print(f"   - Kiran Reddy: APPROVED leave (on leave now)")
    print(f"   - Ravi Sharma: PENDING leave (triggers crisis)")
    print(f"   - Ananya Kumar: Available backup")
    print(f"   - Current capacity: 62% â†’ IF approved: 54% â†’ CRITICAL")
    print(f"")
    print(f"ðŸ“‹ Demo Credentials:")
    print(f"  HR Admin:  admin@dayflow.com  / Demo@1234")
    print(f"  HR:        hr@dayflow.com     / Demo@1234")
    print(f"  Employee:  ravi.sharma@dayflow.com / Demo@1234")


async def main():
    print("\nðŸŒ± Dayflow â€” WOW Demo Seeder")
    print("=" * 50)
    await create_tables()
    await seed_all()
    print("\nðŸš€ Run server: .\\venv\\Scripts\\uvicorn app.main:app --reload")
    print("ðŸ“– API Docs:   http://localhost:8000/docs\n")


if __name__ == "__main__":
    asyncio.run(main())



