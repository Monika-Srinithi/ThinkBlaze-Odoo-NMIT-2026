from datetime import datetime, date, timedelta
from typing import Optional, List
from uuid import UUID
import statistics
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from app.models.attendance import Attendance, AttendanceStatus
from app.models.employee import Employee
from fastapi import HTTPException

class AttendanceService:
    STANDARD_HOURS = 8.0
    LATE_THRESHOLD_MINUTES = 15  # minutes after 9:00 AM

    def __init__(self, db: AsyncSession):
        self.db = db

    async def record_checkin(self, employee_id: UUID, notes: Optional[str] = None) -> Attendance:
        today = date.today()
        # Check if already checked in today
        existing = await self.db.execute(
            select(Attendance).where(and_(Attendance.employee_id == employee_id, Attendance.date == today))
        )
        record = existing.scalar_one_or_none()
        if record and record.check_in:
            raise HTTPException(status_code=400, detail='Already checked in today')
        now = datetime.utcnow()
        # Determine if late (after 9:15 AM IST ~ 3:45 AM UTC)
        late_threshold = now.replace(hour=3, minute=45, second=0) if now.hour < 12 else now.replace(hour=3, minute=45, second=0)
        status = AttendanceStatus.late if now.hour > 3 and now.minute > 45 else AttendanceStatus.present
        if record:
            record.check_in = now
            record.status = status
            record.notes = notes
        else:
            record = Attendance(
                employee_id=employee_id, date=today, check_in=now,
                status=status, notes=notes
            )
            self.db.add(record)
        await self.db.commit()
        await self.db.refresh(record)
        return record

    async def record_checkout(self, employee_id: UUID, notes: Optional[str] = None) -> Attendance:
        today = date.today()
        result = await self.db.execute(
            select(Attendance).where(and_(Attendance.employee_id == employee_id, Attendance.date == today))
        )
        record = result.scalar_one_or_none()
        if not record or not record.check_in:
            raise HTTPException(status_code=400, detail='No check-in found for today')
        if record.check_out:
            raise HTTPException(status_code=400, detail='Already checked out today')
        now = datetime.utcnow()
        record.check_out = now
        hours = (now - record.check_in).total_seconds() / 3600
        record.hours_worked = round(hours, 2)
        # Half-day if less than 5 hours
        if hours < 5:
            record.status = AttendanceStatus.half_day
        if notes:
            record.notes = notes
        await self.db.commit()
        await self.db.refresh(record)
        return record

    async def get_monthly_summary(self, employee_id: UUID, year: int, month: int) -> dict:
        first_day = date(year, month, 1)
        if month == 12:
            last_day = date(year + 1, 1, 1) - timedelta(days=1)
        else:
            last_day = date(year, month + 1, 1) - timedelta(days=1)
        result = await self.db.execute(
            select(Attendance).where(
                and_(Attendance.employee_id == employee_id,
                     Attendance.date >= first_day, Attendance.date <= last_day)
            )
        )
        records = result.scalars().all()
        present_days = sum(1 for r in records if r.status.value in ('present', 'late'))
        half_days = sum(1 for r in records if r.status.value == 'half_day')
        absent_days = sum(1 for r in records if r.status.value == 'absent')
        late_days = sum(1 for r in records if r.status.value == 'late')
        total_hours = sum(float(r.hours_worked or 0) for r in records)
        total_working_days = present_days + half_days + absent_days
        return {
            'year': year, 'month': month,
            'total_working_days': total_working_days,
            'present_days': present_days,
            'absent_days': absent_days,
            'late_days': late_days,
            'half_days': half_days,
            'total_hours': round(total_hours, 2),
            'average_hours': round(total_hours / max(present_days, 1), 2),
            'attendance_rate': round((present_days + half_days * 0.5) / max(total_working_days, 1) * 100, 1)
        }

    async def detect_anomalies(self, employee_id: UUID, records: List[Attendance]) -> List[dict]:
        anomalies = []
        hours_list = [float(r.hours_worked) for r in records if r.hours_worked]
        if len(hours_list) < 5:
            return anomalies
        mean_hours = statistics.mean(hours_list)
        std_hours = statistics.stdev(hours_list) if len(hours_list) > 1 else 0
        for r in records:
            if not r.hours_worked:
                continue
            hours = float(r.hours_worked)
            z_score = abs(hours - mean_hours) / max(std_hours, 0.1)
            if z_score > 2.5:
                anomaly_type = 'very_long_hours' if hours > mean_hours else 'very_short_hours'
                anomalies.append({
                    'attendance_id': str(r.id),
                    'date': str(r.date),
                    'anomaly_type': anomaly_type,
                    'hours_worked': hours,
                    'z_score': round(z_score, 2),
                    'confidence': min(z_score / 3.0, 1.0)
                })
        return anomalies
