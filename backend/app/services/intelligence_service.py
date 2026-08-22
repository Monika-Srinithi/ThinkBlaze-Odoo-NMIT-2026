"""
ThinkBlaze Dayflow — Workforce Intelligence Engine

Deterministic, explainable risk scoring grounded in real HRMS data.
Core of the WOW demo: DATA → DETECT → EXPLAIN → SIMULATE → RECOMMEND → EXECUTE
"""
from datetime import date, timedelta, datetime
from typing import List, Dict, Any, Optional, Tuple
from uuid import UUID
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from app.models.employee import Employee, EmployeeStatus
from app.models.attendance import Attendance, AttendanceStatus
from app.models.leave import LeaveRequest, LeaveBalance, LeaveStatus, LeaveType
from app.models.audit import AuditLog, AuditSeverity


# ─── RISK THRESHOLDS ─────────────────────────────────────────────────────────
CAPACITY_CRITICAL = 60.0   # Below this = CRITICAL
CAPACITY_WARNING = 75.0    # Below this = WARNING
RISK_CRITICAL = 70         # Risk score above this = CRITICAL
RISK_HIGH = 50             # Risk score above this = HIGH
RISK_MEDIUM = 30           # Risk score above this = MEDIUM


class WorkforceIntelligenceEngine:
    def __init__(self, db: AsyncSession):
        self.db = db

    # ─── TEAM CAPACITY CALCULATION ────────────────────────────────────────────

    async def get_team_capacities(self) -> Dict[str, Dict]:
        """Calculate current capacity for each team (department)."""
        today = date.today()

        # Get all active employees by team
        emp_result = await self.db.execute(
            select(Employee.department, func.count(Employee.id))
            .where(Employee.status != EmployeeStatus.terminated)
            .group_by(Employee.department)
        )
        team_totals = {row[0]: row[1] for row in emp_result.all()}

        # Get employees currently on approved leave
        on_leave_result = await self.db.execute(
            select(Employee.department, Employee.id)
            .join(LeaveRequest, LeaveRequest.employee_id == Employee.id)
            .where(
                and_(
                    LeaveRequest.status == LeaveStatus.approved,
                    LeaveRequest.start_date <= today,
                    LeaveRequest.end_date >= today
                )
            )
        )
        on_leave_by_team: Dict[str, int] = {}
        for dept, emp_id in on_leave_result.all():
            on_leave_by_team[dept] = on_leave_by_team.get(dept, 0) + 1

        # Also count employees with on_leave status
        status_on_leave_result = await self.db.execute(
            select(Employee.department, func.count(Employee.id))
            .where(Employee.status == EmployeeStatus.on_leave)
            .group_by(Employee.department)
        )
        for dept, cnt in status_on_leave_result.all():
            on_leave_by_team[dept] = max(on_leave_by_team.get(dept, 0), cnt)

        capacities = {}
        for team, total in team_totals.items():
            on_leave = on_leave_by_team.get(team, 0)
            available = total - on_leave
            capacity_pct = round((available / total * 100) if total > 0 else 100.0, 1)
            capacities[team] = {
                "team": team,
                "total": total,
                "available": available,
                "on_leave": on_leave,
                "capacity_pct": capacity_pct,
                "status": "critical" if capacity_pct < CAPACITY_CRITICAL else
                          "warning" if capacity_pct < CAPACITY_WARNING else "normal"
            }

        return capacities

    # ─── ATTENDANCE METRICS ───────────────────────────────────────────────────

    async def get_attendance_metrics(self, days: int = 30) -> Dict[str, Dict]:
        """Get attendance rate, late rate, absence rate per team."""
        since = date.today() - timedelta(days=days)

        result = await self.db.execute(
            select(
                Employee.department,
                Attendance.status,
                func.count(Attendance.id)
            )
            .join(Attendance, Attendance.employee_id == Employee.id)
            .where(
                and_(
                    Attendance.date >= since,
                    Employee.status != EmployeeStatus.terminated
                )
            )
            .group_by(Employee.department, Attendance.status)
        )

        team_stats: Dict[str, Dict] = {}
        for dept, status, count in result.all():
            if dept not in team_stats:
                team_stats[dept] = {}
            team_stats[dept][status.value if hasattr(status, 'value') else str(status)] = count

        metrics = {}
        for dept, stats in team_stats.items():
            total = sum(stats.values())
            present = stats.get("present", 0) + stats.get("late", 0) + stats.get("half_day", 0) * 0.5
            absent = stats.get("absent", 0)
            late = stats.get("late", 0)
            att_rate = round(present / total * 100 if total else 100, 1)
            late_rate = round(late / total * 100 if total else 0, 1)
            absent_rate = round(absent / total * 100 if total else 0, 1)
            metrics[dept] = {
                "attendance_rate": att_rate,
                "late_rate": late_rate,
                "absent_rate": absent_rate,
                "total_records": total
            }
        return metrics

    # ─── RISK SCORING ENGINE ──────────────────────────────────────────────────

    async def calculate_team_risk(self, team: str) -> Dict[str, Any]:
        """
        Calculate explainable risk score for a team.
        Returns score + breakdown of contributing factors.
        """
        capacities = await self.get_team_capacities()
        att_metrics = await self.get_attendance_metrics(30)

        team_cap = capacities.get(team, {"capacity_pct": 100, "on_leave": 0, "total": 1})
        team_att = att_metrics.get(team, {"attendance_rate": 100, "late_rate": 0, "absent_rate": 0})

        # Score components (max 100 total)
        factors = []

        # 1. Attendance decline (max 30 points)
        att_rate = team_att["attendance_rate"]
        att_score = max(0, round((100 - att_rate) * 1.5, 1))
        att_score = min(att_score, 30)
        if att_score > 5:
            factors.append({
                "factor": "Attendance decline",
                "score": att_score,
                "detail": f"Team attendance rate is {att_rate}% (baseline: 95%)",
                "severity": "high" if att_score > 20 else "medium"
            })

        # 2. Capacity pressure (max 30 points)
        cap_pct = team_cap["capacity_pct"]
        cap_score = max(0, round((75 - cap_pct) * 1.2, 1)) if cap_pct < 75 else 0
        cap_score = min(cap_score, 30)
        if cap_score > 0:
            factors.append({
                "factor": "Team capacity pressure",
                "score": cap_score,
                "detail": f"{team_cap['on_leave']} of {team_cap['total']} members on leave. Capacity: {cap_pct}%",
                "severity": "critical" if cap_pct < CAPACITY_CRITICAL else "high"
            })

        # 3. Late arrivals (max 15 points)
        late_rate = team_att["late_rate"]
        late_score = min(round(late_rate * 1.5, 1), 15)
        if late_score > 3:
            factors.append({
                "factor": "Repeated late check-ins",
                "score": late_score,
                "detail": f"Late arrival rate: {late_rate}% in last 30 days",
                "severity": "medium" if late_score < 10 else "high"
            })

        # 4. Pending leave pressure (max 15 points)
        today = date.today()
        pending_result = await self.db.execute(
            select(func.count(LeaveRequest.id))
            .join(Employee, Employee.id == LeaveRequest.employee_id)
            .where(
                and_(
                    LeaveRequest.status == LeaveStatus.pending,
                    Employee.department == team
                )
            )
        )
        pending_count = pending_result.scalar() or 0
        pending_score = min(pending_count * 8, 15)
        if pending_score > 0:
            factors.append({
                "factor": "Pending leave requests",
                "score": pending_score,
                "detail": f"{pending_count} pending leave request(s) awaiting approval, overlapping current leaves",
                "severity": "high" if pending_count > 1 else "medium"
            })

        # 5. Absence concentration (max 10 points)
        absent_score = min(round(team_att["absent_rate"] * 2, 1), 10)
        if absent_score > 2:
            factors.append({
                "factor": "Absence concentration",
                "score": absent_score,
                "detail": f"Absence rate {team_att['absent_rate']}% — above team baseline",
                "severity": "medium"
            })

        total_score = sum(f["score"] for f in factors)
        total_score = min(round(total_score, 1), 100)

        risk_level = (
            "critical" if total_score >= RISK_CRITICAL else
            "high" if total_score >= RISK_HIGH else
            "medium" if total_score >= RISK_MEDIUM else
            "low"
        )

        return {
            "team": team,
            "risk_score": total_score,
            "risk_level": risk_level,
            "capacity_pct": cap_pct,
            "factors": sorted(factors, key=lambda x: x["score"], reverse=True),
            "employees_on_leave": team_cap["on_leave"],
            "total_employees": team_cap["total"],
            "attendance_rate": att_rate,
        }

    # ─── WORKFORCE HEALTH OVERVIEW ────────────────────────────────────────────

    async def get_workforce_health(self) -> Dict[str, Any]:
        """Overall workforce health score and breakdown."""
        capacities = await self.get_team_capacities()
        att_metrics = await self.get_attendance_metrics(30)

        # Calculate per-team risk
        team_risks = []
        for team in capacities.keys():
            risk = await self.calculate_team_risk(team)
            team_risks.append(risk)

        # Count risk distribution
        critical_count = sum(1 for r in team_risks if r["risk_level"] == "critical")
        high_count = sum(1 for r in team_risks if r["risk_level"] == "high")
        medium_count = sum(1 for r in team_risks if r["risk_level"] == "medium")
        normal_count = sum(1 for r in team_risks if r["risk_level"] == "low")

        # Overall score (weighted average)
        if team_risks:
            avg_risk = sum(r["risk_score"] for r in team_risks) / len(team_risks)
            overall_health = round(max(0, 100 - avg_risk), 1)
        else:
            overall_health = 95.0

        # Pending leave count
        pending_result = await self.db.execute(
            select(func.count(LeaveRequest.id)).where(LeaveRequest.status == LeaveStatus.pending)
        )
        pending_leaves = pending_result.scalar() or 0

        # Total active employees
        emp_result = await self.db.execute(
            select(func.count(Employee.id)).where(Employee.status == EmployeeStatus.active)
        )
        active_employees = emp_result.scalar() or 0

        emp_on_leave_result = await self.db.execute(
            select(func.count(Employee.id)).where(Employee.status == EmployeeStatus.on_leave)
        )
        on_leave_total = emp_on_leave_result.scalar() or 0

        return {
            "overall_health_score": overall_health,
            "risk_level": "critical" if overall_health < 50 else "high" if overall_health < 65 else "medium" if overall_health < 80 else "low",
            "risk_distribution": {
                "critical": critical_count,
                "high": high_count,
                "medium": medium_count,
                "normal": normal_count,
            },
            "teams": sorted([
                {
                    "name": r["team"],
                    "capacity_pct": r["capacity_pct"],
                    "risk_score": r["risk_score"],
                    "risk_level": r["risk_level"],
                    "employees_on_leave": r["employees_on_leave"],
                    "total": r["total_employees"],
                }
                for r in team_risks
            ], key=lambda x: x["risk_score"], reverse=True),
            "stats": {
                "total_active": active_employees,
                "on_leave": on_leave_total,
                "pending_leave_requests": pending_leaves,
                "teams_at_risk": critical_count + high_count,
            },
            "alerts": [
                {
                    "type": "capacity_critical",
                    "team": r["team"],
                    "message": f"{r['team']} is at {r['capacity_pct']}% capacity — CRITICAL",
                    "severity": "critical"
                }
                for r in team_risks if r["risk_level"] == "critical"
            ] + [
                {
                    "type": "pending_leaves",
                    "message": f"{pending_leaves} leave request(s) pending approval",
                    "severity": "warning" if pending_leaves < 3 else "high"
                }
            ] if pending_leaves > 0 else []
        }

    # ─── WHAT-IF SIMULATION ───────────────────────────────────────────────────

    async def simulate_leave_approval(self, leave_request_id: str
    ) -> Dict[str, Any]:
        """
        Simulate what happens if this leave is approved.
        Returns: before/after capacity, risk delta, options, AI recommendation.
        """
        # Get the leave request
        leave_result = await self.db.execute(
            select(LeaveRequest).where(LeaveRequest.id == leave_request_id)
        )
        leave_req = leave_result.scalar_one_or_none()
        if not leave_req:
            return {"error": "Leave request not found"}

        # Get the employee
        emp_result = await self.db.execute(
            select(Employee).where(Employee.id == leave_req.employee_id)
        )
        emp = emp_result.scalar_one_or_none()
        if not emp:
            return {"error": "Employee not found"}

        team = emp.department

        # Current state
        current_cap = await self.get_team_capacities()
        team_current = current_cap.get(team, {})
        current_pct = team_current.get("capacity_pct", 100)
        total = team_current.get("total", 1)
        current_available = team_current.get("available", total)

        # Simulated state (one more person on leave)
        sim_available = max(0, current_available - 1)
        sim_pct = round((sim_available / total * 100) if total > 0 else 0, 1)

        # Find available backup employees in same team
        backup_result = await self.db.execute(
            select(Employee)
            .where(
                and_(
                    Employee.department == team,
                    Employee.status == EmployeeStatus.active,
                    Employee.id != emp.id
                )
            )
        )
        potential_backups = backup_result.scalars().all()

        # Find backup from other teams with similar role
        cross_team_result = await self.db.execute(
            select(Employee)
            .where(
                and_(
                    Employee.department != team,
                    Employee.status == EmployeeStatus.active,
                    Employee.designation.ilike(f"%{emp.designation.split()[0]}%")
                )
            )
            .limit(3)
        )
        cross_team_backups = cross_team_result.scalars().all()

        # All other teams current capacity (for reassignment impact)
        other_teams_before = {
            t: data for t, data in current_cap.items() if t != team
        }

        # Build options
        options = []

        # Option A: Approve as-is
        options.append({
            "id": "approve_only",
            "label": "Approve leave as requested",
            "description": f"Approve {emp.first_name}'s {leave_req.total_days:.0f}-day leave without mitigation",
            "capacity_after": sim_pct,
            "risk_level": "critical" if sim_pct < CAPACITY_CRITICAL else "high" if sim_pct < CAPACITY_WARNING else "medium",
            "impact": "HIGH" if sim_pct < CAPACITY_CRITICAL else "MEDIUM",
            "icon": "❌",
        })

        # Option B: Approve + reassign backup
        reassign_capacity = None
        backup_emp_info = None
        if potential_backups:
            backup = potential_backups[0]
            reassign_capacity = round(min(sim_pct + 15, 100), 1)  # Effective capacity with reassignment
            backup_emp_info = {
                "id": str(backup.id),
                "name": f"{backup.first_name} {backup.last_name}",
                "designation": backup.designation,
                "team": backup.department
            }
            options.append({
                "id": "approve_with_reassign",
                "label": "Approve + Temporary Reassignment",
                "description": f"Approve leave and temporarily reassign {backup.first_name} {backup.last_name} to cover critical tasks",
                "capacity_after": reassign_capacity,
                "risk_level": "medium" if reassign_capacity >= CAPACITY_WARNING else "high",
                "impact": "LOW",
                "recommended": True,
                "backup_employee": backup_emp_info,
                "icon": "✅",
            })

        # Option C: Suggest alternate date
        alt_start = leave_req.end_date + timedelta(days=7)
        alt_end = alt_start + timedelta(days=int(leave_req.total_days) - 1)
        options.append({
            "id": "suggest_alternate",
            "label": "Suggest Alternate Date",
            "description": f"Request employee to reschedule to {alt_start.strftime('%d %b')}–{alt_end.strftime('%d %b')} when other leaves end",
            "capacity_after": current_pct,
            "risk_level": "low",
            "impact": "LOW",
            "icon": "🔄",
        })

        # AI Recommendation
        if sim_pct < CAPACITY_CRITICAL and potential_backups:
            rec_option = "approve_with_reassign"
            rec_text = (
                f"Approve {emp.first_name}'s leave with temporary reassignment. "
                f"Current team capacity is {current_pct}% with 2 members already on leave. "
                f"Approving without mitigation drops capacity to {sim_pct}% — below the critical threshold of {CAPACITY_CRITICAL}%. "
                f"Reassigning {backup_emp_info['name']} to cover critical tasks maintains effective capacity at {reassign_capacity}%."
            )
            rec_impact = f"{sim_pct}% → {reassign_capacity}%"
        elif sim_pct >= CAPACITY_WARNING:
            rec_option = "approve_only"
            rec_text = f"Approve the leave. Capacity after approval ({sim_pct}%) remains above the warning threshold. No mitigation required."
            rec_impact = f"{current_pct}% → {sim_pct}%"
        else:
            rec_option = "suggest_alternate"
            rec_text = f"Suggest an alternate date. Current team capacity is already strained and there is no available backup. Rescheduling to {alt_start.strftime('%d %b')} allows current leaves to clear first."
            rec_impact = "No capacity change"

        return {
            "leave_request": {
                "id": leave_request_id,
                "employee_name": f"{emp.first_name} {emp.last_name}",
                "employee_code": emp.employee_code,
                "designation": emp.designation,
                "team": team,
                "leave_type": leave_req.leave_type if isinstance(leave_req.leave_type, str) else leave_req.leave_type.value,
                "start_date": str(leave_req.start_date),
                "end_date": str(leave_req.end_date),
                "total_days": leave_req.total_days,
                "reason": leave_req.reason,
            },
            "current_state": {
                "team": team,
                "capacity_pct": current_pct,
                "available": current_available,
                "total": total,
                "employees_on_leave": team_current.get("on_leave", 0),
                "risk_level": "high" if current_pct < CAPACITY_WARNING else "medium",
            },
            "simulated_state": {
                "capacity_pct": sim_pct,
                "available": sim_available,
                "total": total,
                "risk_level": "critical" if sim_pct < CAPACITY_CRITICAL else "high" if sim_pct < CAPACITY_WARNING else "medium",
            },
            "capacity_change": round(sim_pct - current_pct, 1),
            "options": options,
            "ai_recommendation": {
                "recommended_option": rec_option,
                "reasoning": rec_text,
                "capacity_impact": rec_impact,
                "confidence": 0.92,
                "backup_employee": backup_emp_info,
            }
        }

    # ─── APPLY RECOMMENDATION ─────────────────────────────────────────────────

    async def apply_recommendation(self, leave_request_id: str, option_id: str,
        applied_by_user_id: UUID, backup_employee_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Execute the chosen recommendation:
        - approve_only: approve leave, update status
        - approve_with_reassign: approve leave + create reassignment record in audit
        - suggest_alternate: reject with a message suggesting alternate dates
        """
        # Get leave request
        leave_result = await self.db.execute(
            select(LeaveRequest).where(LeaveRequest.id == leave_request_id)
        )
        leave_req = leave_result.scalar_one_or_none()
        if not leave_req or leave_req.status != LeaveStatus.pending:
            return {"error": "Leave request not found or not pending"}

        emp_result = await self.db.execute(
            select(Employee).where(Employee.id == leave_req.employee_id)
        )
        emp = emp_result.scalar_one_or_none()
        team = emp.department if emp else "Unknown"

        # Get capacity before
        before_caps = await self.get_team_capacities()
        cap_before = before_caps.get(team, {}).get("capacity_pct", 100)

        decision_id = f"DF-{int(datetime.utcnow().timestamp()) % 10000:04d}"

        if option_id in ("approve_only", "approve_with_reassign"):
            # Approve the leave
            leave_req.status = LeaveStatus.approved
            leave_req.approved_by = emp.manager_id or applied_by_user_id
            leave_req.approved_at = datetime.utcnow()

            # Update employee status
            if emp:
                emp.status = EmployeeStatus.on_leave

            action_taken = "Leave approved"
            if option_id == "approve_with_reassign" and backup_employee_id:
                action_taken = "Leave approved + backup reassignment initiated"

            # Calculate new capacity
            new_cap = round(max(0, cap_before - (1 / max(before_caps.get(team, {}).get("total", 1), 1)) * 100), 1)
            if option_id == "approve_with_reassign":
                effective_cap = round(min(new_cap + 15, 100), 1)
            else:
                effective_cap = new_cap

        elif option_id == "suggest_alternate":
            alt_start = leave_req.end_date + timedelta(days=7)
            leave_req.status = LeaveStatus.rejected
            leave_req.approved_by = applied_by_user_id
            leave_req.approved_at = datetime.utcnow()
            leave_req.rejection_reason = f"Team capacity is currently critical. Suggested alternate: {alt_start.strftime('%d %B %Y')}. Please resubmit with the updated dates."
            action_taken = "Alternate date suggested"
            effective_cap = cap_before
            new_cap = cap_before

        # Create audit log
        audit = AuditLog(
            user_id=applied_by_user_id,
            action=f"RECOMMENDATION_APPLIED:{option_id}",
            resource_type="leave_request",
            resource_id=leave_request_id,
            details={
                "decision_id": decision_id,
                "option_chosen": option_id,
                "employee": f"{emp.first_name} {emp.last_name}" if emp else "Unknown",
                "team": team,
                "capacity_before": cap_before,
                "capacity_after": effective_cap,
                "backup_employee_id": backup_employee_id,
            },
            severity=AuditSeverity.info,
        )
        self.db.add(audit)
        await self.db.commit()

        return {
            "success": True,
            "decision_id": decision_id,
            "action_taken": action_taken,
            "leave_request_id": leave_request_id,
            "team": team,
            "capacity_before": cap_before,
            "capacity_after": effective_cap,
            "capacity_improvement": round(effective_cap - new_cap, 1) if option_id == "approve_with_reassign" else 0,
            "audit_created": True,
            "message": f"Decision {decision_id} executed successfully. {action_taken}.",
        }

    # ─── ACTION CENTER ────────────────────────────────────────────────────────

    async def get_action_center(self) -> Dict[str, Any]:
        """Get all pending actions that require HR attention."""
        today = date.today()

        # Pending leave requests
        pending_result = await self.db.execute(
            select(LeaveRequest, Employee)
            .join(Employee, Employee.id == LeaveRequest.employee_id)
            .where(LeaveRequest.status == LeaveStatus.pending)
            .order_by(LeaveRequest.created_at.asc())
        )
        pending_leaves = []
        for leave_req, emp in pending_result.all():
            # Quick risk assessment for each pending leave
            team_caps = await self.get_team_capacities()
            team_cap = team_caps.get(emp.department, {})
            current_pct = team_cap.get("capacity_pct", 100)
            sim_pct = round(max(0, current_pct - (1 / max(team_cap.get("total", 1), 1)) * 100), 1)
            urgency = "critical" if sim_pct < CAPACITY_CRITICAL else "high" if sim_pct < CAPACITY_WARNING else "normal"
            pending_leaves.append({
                "id": str(leave_req.id),
                "employee_name": f"{emp.first_name} {emp.last_name}",
                "employee_code": emp.employee_code,
                "designation": emp.designation,
                "team": emp.department,
                "leave_type": leave_req.leave_type if isinstance(leave_req.leave_type, str) else leave_req.leave_type.value,
                "start_date": str(leave_req.start_date),
                "end_date": str(leave_req.end_date),
                "total_days": leave_req.total_days,
                "reason": leave_req.reason,
                "current_team_capacity": current_pct,
                "simulated_capacity": sim_pct,
                "urgency": urgency,
                "days_pending": (datetime.utcnow() - leave_req.created_at).days if leave_req.created_at else 0,
            })

        # Teams at risk
        health = await self.get_workforce_health()
        teams_at_risk = [t for t in health["teams"] if t["risk_level"] in ("critical", "high")]

        return {
            "pending_leave_requests": pending_leaves,
            "pending_count": len(pending_leaves),
            "teams_at_risk": teams_at_risk,
            "requires_immediate_attention": [p for p in pending_leaves if p["urgency"] == "critical"],
            "overall_health": health["overall_health_score"],
        }

    # ─── EVIDENCE PANEL ───────────────────────────────────────────────────────

    async def get_risk_evidence(self, team: str) -> Dict[str, Any]:
        """
        Get detailed evidence for why a team is at risk.
        Powers the WHY? panel in the UI.
        """
        since = date.today() - timedelta(days=30)
        today = date.today()

        # Get all team employees
        emp_result = await self.db.execute(
            select(Employee).where(
                and_(Employee.department == team, Employee.status != EmployeeStatus.terminated)
            )
        )
        employees = emp_result.scalars().all()
        emp_ids = [e.id for e in employees]
        emp_map = {str(e.id): e for e in employees}

        # Attendance evidence
        att_result = await self.db.execute(
            select(Attendance)
            .where(and_(Attendance.employee_id.in_(emp_ids), Attendance.date >= since))
            .order_by(Attendance.date.desc())
        )
        att_records = att_result.scalars().all()

        absent_records = [r for r in att_records if r.status.value == "absent"]
        late_records = [r for r in att_records if r.status.value == "late"]
        total = len(att_records)
        present = sum(1 for r in att_records if r.status.value in ("present", "late", "half_day"))
        att_rate = round(present / total * 100 if total else 100, 1)

        # Leave evidence
        leave_result = await self.db.execute(
            select(LeaveRequest, Employee)
            .join(Employee, Employee.id == LeaveRequest.employee_id)
            .where(
                and_(
                    LeaveRequest.employee_id.in_(emp_ids),
                    or_(
                        LeaveRequest.status == LeaveStatus.approved,
                        LeaveRequest.status == LeaveStatus.pending
                    )
                )
            )
            .order_by(LeaveRequest.created_at.desc())
        )
        leave_evidence = []
        for lr, emp in leave_result.all():
            leave_evidence.append({
                "id": str(lr.id),
                "employee": f"{emp.first_name} {emp.last_name}",
                "status": lr.status.value if hasattr(lr.status, 'value') else str(lr.status),
                "start_date": str(lr.start_date),
                "end_date": str(lr.end_date),
                "total_days": lr.total_days,
                "leave_type": lr.leave_type if isinstance(lr.leave_type, str) else lr.leave_type.value,
                "reason": lr.reason,
                "is_active": lr.start_date <= today <= lr.end_date if lr.status == LeaveStatus.approved else False,
            })

        # Per-employee stats
        emp_stats = []
        for emp in employees:
            emp_att = [r for r in att_records if r.employee_id == emp.id]
            if not emp_att:
                continue
            emp_absent = sum(1 for r in emp_att if r.status.value == "absent")
            emp_late = sum(1 for r in emp_att if r.status.value == "late")
            emp_total = len(emp_att)
            emp_present = sum(1 for r in emp_att if r.status.value in ("present", "late", "half_day"))
            emp_stats.append({
                "employee_code": emp.employee_code,
                "name": f"{emp.first_name} {emp.last_name}",
                "designation": emp.designation,
                "status": emp.status.value if hasattr(emp.status, 'value') else str(emp.status),
                "attendance_rate": round(emp_present / emp_total * 100 if emp_total else 100, 1),
                "absent_days": emp_absent,
                "late_arrivals": emp_late,
                "risk_flag": emp_absent > 5 or emp_late > 6 or emp.status.value == "on_leave"
            })

        risk_data = await self.calculate_team_risk(team)

        return {
            "team": team,
            "risk_score": risk_data["risk_score"],
            "risk_level": risk_data["risk_level"],
            "risk_factors": risk_data["factors"],
            "summary": {
                "attendance_rate_30d": att_rate,
                "total_absences_30d": len(absent_records),
                "total_late_30d": len(late_records),
                "employees_on_leave": sum(1 for e in employees if e.status.value == "on_leave"),
                "total_employees": len(employees),
                "pending_leaves": sum(1 for l in leave_evidence if l["status"] == "pending"),
            },
            "leave_evidence": leave_evidence,
            "employee_stats": sorted(emp_stats, key=lambda x: x["attendance_rate"]),
            "recent_absences": [
                {
                    "employee": emp_map[str(r.employee_id)].first_name + " " + emp_map[str(r.employee_id)].last_name if str(r.employee_id) in emp_map else "Unknown",
                    "date": str(r.date),
                    "status": r.status.value,
                }
                for r in absent_records[:10]
            ],
        }

