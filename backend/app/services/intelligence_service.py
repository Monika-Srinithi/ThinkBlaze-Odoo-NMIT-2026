from datetime import date, timedelta
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from app.models.employee import Employee, EmployeeStatus
from app.models.attendance import Attendance, AttendanceStatus
from app.models.leave import LeaveRequest, LeaveStatus
from app.schemas.intelligence import WorkforceHealthScore, RiskAlert, AnomalyDetection
import statistics
import math

class IntelligenceService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def calculate_workforce_health_score(self) -> WorkforceHealthScore:
        today = date.today()
        thirty_ago = today - timedelta(days=30)
        # Get active employees
        emp_result = await self.db.execute(select(Employee).where(Employee.status == EmployeeStatus.active))
        employees = emp_result.scalars().all()
        total_employees = len(employees)
        if total_employees == 0:
            return WorkforceHealthScore(overall_score=100, risk_level='low', department_scores={}, trend='stable')
        # Attendance rate last 30 days
        att_result = await self.db.execute(
            select(Attendance).where(and_(Attendance.date >= thirty_ago, Attendance.date <= today))
        )
        attendance_records = att_result.scalars().all()
        if attendance_records:
            present = sum(1 for a in attendance_records if a.status.value in ('present', 'late', 'half_day'))
            attendance_rate = present / len(attendance_records)
        else:
            attendance_rate = 1.0
        # Pending leave requests
        leave_result = await self.db.execute(
            select(func.count(LeaveRequest.id)).where(LeaveRequest.status == LeaveStatus.pending)
        )
        pending_leaves = leave_result.scalar() or 0
        pending_ratio = min(pending_leaves / max(total_employees, 1), 1.0)
        # Department scores
        dept_scores: Dict[str, float] = {}
        departments = list(set(e.department for e in employees))
        for dept in departments:
            dept_emp_ids = [e.id for e in employees if e.department == dept]
            dept_att = [a for a in attendance_records if a.employee_id in dept_emp_ids]
            if dept_att:
                dept_present = sum(1 for a in dept_att if a.status.value in ('present', 'late', 'half_day'))
                dept_scores[dept] = round(dept_present / len(dept_att) * 100, 1)
            else:
                dept_scores[dept] = 100.0
        # Calculate overall score (0-100)
        score = (attendance_rate * 0.6 + (1 - pending_ratio) * 0.4) * 100
        score = max(0, min(100, score))
        risk_level = 'low' if score >= 80 else 'medium' if score >= 60 else 'high' if score >= 40 else 'critical'
        insights = []
        if attendance_rate < 0.8:
            insights.append(f'Attendance rate is below 80% — consider wellness check-ins')
        if pending_leaves > 5:
            insights.append(f'{pending_leaves} leave requests pending approval — review urgently')
        if dept_scores:
            min_dept = min(dept_scores, key=dept_scores.get)
            if dept_scores[min_dept] < 75:
                insights.append(f'{min_dept} department has lowest attendance at {dept_scores[min_dept]}%')
        return WorkforceHealthScore(
            overall_score=round(score, 1),
            risk_level=risk_level,
            department_scores=dept_scores,
            trend='stable',
            insights=insights
        )

    async def detect_risk_alerts(self) -> List[RiskAlert]:
        today = date.today()
        thirty_ago = today - timedelta(days=30)
        emp_result = await self.db.execute(select(Employee).where(Employee.status == EmployeeStatus.active))
        employees = emp_result.scalars().all()
        alerts = []
        for emp in employees[:20]:  # Limit for performance
            att_result = await self.db.execute(
                select(Attendance).where(
                    and_(Attendance.employee_id == emp.id, Attendance.date >= thirty_ago)
                )
            )
            records = att_result.scalars().all()
            if not records:
                continue
            absent = sum(1 for r in records if r.status.value == 'absent')
            late = sum(1 for r in records if r.status.value == 'late')
            risk_score = (absent / len(records)) * 60 + (late / len(records)) * 40
            if risk_score > 30:
                severity = 'critical' if risk_score > 60 else 'high' if risk_score > 45 else 'medium'
                alerts.append(RiskAlert(
                    employee_id=str(emp.id),
                    employee_name=f'{emp.first_name} {emp.last_name}',
                    risk_type='attendance_risk',
                    severity=severity,
                    description=f'{absent} absences and {late} late arrivals in the last 30 days',
                    recommended_action='Schedule 1:1 meeting to understand concerns. Consider flexible work arrangements.',
                    score=round(risk_score, 1)
                ))
        alerts.sort(key=lambda x: x.score, reverse=True)
        return alerts[:10]

    async def detect_attendance_anomalies(self) -> List[AnomalyDetection]:
        today = date.today()
        seven_ago = today - timedelta(days=7)
        att_result = await self.db.execute(
            select(Attendance).where(
                and_(Attendance.date >= seven_ago, Attendance.hours_worked.isnot(None))
            )
        )
        records = att_result.scalars().all()
        emp_result = await self.db.execute(select(Employee))
        emp_map = {str(e.id): f'{e.first_name} {e.last_name}' for e in emp_result.scalars().all()}
        if not records:
            return []
        hours_list = [float(r.hours_worked) for r in records]
        if len(hours_list) < 3:
            return []
        mean_h = statistics.mean(hours_list)
        std_h = statistics.stdev(hours_list) if len(hours_list) > 1 else 1.0
        anomalies = []
        for r in records:
            hours = float(r.hours_worked)
            z_score = abs(hours - mean_h) / max(std_h, 0.1)
            if z_score > 2.0:
                anomaly_type = 'extended_hours' if hours > mean_h else 'insufficient_hours'
                anomalies.append(AnomalyDetection(
                    employee_id=str(r.employee_id),
                    employee_name=emp_map.get(str(r.employee_id), 'Unknown'),
                    anomaly_type=anomaly_type,
                    confidence_score=round(min(z_score / 3.0, 1.0), 2),
                    details={'hours_worked': hours, 'expected': round(mean_h, 2), 'z_score': round(z_score, 2)},
                    date=str(r.date)
                ))
        return anomalies[:20]

    async def generate_insights(self) -> List[str]:
        health = await self.calculate_workforce_health_score()
        alerts = await self.detect_risk_alerts()
        insights = list(health.insights)
        if alerts:
            insights.append(f'{len(alerts)} employees are flagged as high-risk — immediate attention recommended')
        if health.overall_score >= 85:
            insights.append('Workforce is performing well — maintain current engagement strategies')
        return insights

    async def predict_attrition(self) -> List[dict]:
        alerts = await self.detect_risk_alerts()
        predictions = []
        for alert in alerts:
            attrition_prob = min(alert.score / 100.0, 0.95)
            predictions.append({
                'employee_id': alert.employee_id,
                'employee_name': alert.employee_name,
                'attrition_probability': round(attrition_prob, 2),
                'risk_factors': [alert.risk_type],
                'recommended_actions': [alert.recommended_action]
            })
        return predictions
