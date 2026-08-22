"""
Workforce Intelligence API — Powers the WOW demo workflow.
DATA → DETECT → EXPLAIN → SIMULATE → RECOMMEND → EXECUTE
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.intelligence_service import WorkforceIntelligenceEngine
from app.services.auth_service import get_current_user, require_hr
from app.models.user import User

router = APIRouter(prefix="/intelligence", tags=["Workforce Intelligence"])


# ─── WORKFORCE HEALTH ─────────────────────────────────────────────────────────

@router.get("/workforce-health")
async def get_workforce_health(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_hr),
):
    """Overall workforce health score with team breakdown."""
    engine = WorkforceIntelligenceEngine(db)
    return await engine.get_workforce_health()


@router.get("/health-score")
async def get_health_score(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_hr),
):
    engine = WorkforceIntelligenceEngine(db)
    return await engine.get_workforce_health()


# ─── RISKS ────────────────────────────────────────────────────────────────────

@router.get("/risks")
async def get_risks(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_hr),
):
    """All team risk scores."""
    engine = WorkforceIntelligenceEngine(db)
    caps = await engine.get_team_capacities()
    risks = []
    for team in caps.keys():
        risk = await engine.calculate_team_risk(team)
        risks.append(risk)
    return sorted(risks, key=lambda x: x["risk_score"], reverse=True)


@router.get("/risks/{team}")
async def get_team_risk(
    team: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_hr),
):
    """Risk score for a specific team."""
    engine = WorkforceIntelligenceEngine(db)
    return await engine.calculate_team_risk(team)


@router.get("/risk-alerts")
async def get_risk_alerts(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_hr),
):
    engine = WorkforceIntelligenceEngine(db)
    risks = []
    caps = await engine.get_team_capacities()
    for team in caps.keys():
        risk = await engine.calculate_team_risk(team)
        if risk["risk_level"] in ("critical", "high", "medium"):
            risks.append(risk)
    return sorted(risks, key=lambda x: x["risk_score"], reverse=True)


# ─── EVIDENCE / WHY? ─────────────────────────────────────────────────────────

@router.get("/evidence/{team}")
async def get_risk_evidence(
    team: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_hr),
):
    """Get detailed evidence for why a team is at risk — powers the WHY? panel."""
    engine = WorkforceIntelligenceEngine(db)
    return await engine.get_risk_evidence(team)


# ─── ACTION CENTER ────────────────────────────────────────────────────────────

@router.get("/action-center")
async def get_action_center(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_hr),
):
    """All pending actions requiring HR attention."""
    engine = WorkforceIntelligenceEngine(db)
    return await engine.get_action_center()


# ─── WHAT-IF SIMULATION ───────────────────────────────────────────────────────

@router.post("/simulate")
async def simulate_leave(
    body: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_hr),
):
    """Simulate what happens if a leave request is approved."""
    leave_request_id = body.get("leave_request_id")
    if not leave_request_id:
        raise HTTPException(status_code=400, detail="leave_request_id required")
    engine = WorkforceIntelligenceEngine(db)
    return await engine.simulate_leave_approval(leave_request_id)


@router.get("/simulate/{leave_request_id}")
async def simulate_leave_get(
    leave_request_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_hr),
):
    """Simulate leave approval (GET version for direct linking)."""
    engine = WorkforceIntelligenceEngine(db)
    return await engine.simulate_leave_approval(leave_request_id)


# ─── APPLY RECOMMENDATION ─────────────────────────────────────────────────────

class ApplyRecommendationRequest(BaseModel):
    leave_request_id: str
    option_id: str  # approve_only | approve_with_reassign | suggest_alternate
    backup_employee_id: Optional[str] = None


@router.post("/recommendation/apply")
async def apply_recommendation(
    body: ApplyRecommendationRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_hr),
):
    """Apply the chosen recommendation — the final EXECUTE step."""
    engine = WorkforceIntelligenceEngine(db)
    result = await engine.apply_recommendation(
        leave_request_id=body.leave_request_id,
        option_id=body.option_id,
        applied_by_user_id=current_user.id,
        backup_employee_id=body.backup_employee_id if body.backup_employee_id else None,
    )
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@router.post("/recommendation")
async def get_recommendation(
    body: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_hr),
):
    """Get AI recommendation for a leave request."""
    leave_request_id = body.get("leave_request_id")
    if not leave_request_id:
        raise HTTPException(status_code=400, detail="leave_request_id required")
    engine = WorkforceIntelligenceEngine(db)
    sim = await engine.simulate_leave_approval(leave_request_id)
    return sim.get("ai_recommendation", {})


# ─── ANOMALIES ────────────────────────────────────────────────────────────────

@router.get("/anomalies")
async def get_anomalies(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_hr),
):
    from app.models.attendance import Attendance
    from sqlalchemy import select
    from datetime import date, timedelta
    import statistics

    since = date.today() - timedelta(days=7)
    result = await db.execute(
        select(Attendance).where(
            Attendance.date >= since,
            Attendance.hours_worked.isnot(None)
        )
    )
    records = result.scalars().all()
    if not records:
        return []
    hours = [float(r.hours_worked) for r in records]
    if len(hours) < 3:
        return []
    mean_h = statistics.mean(hours)
    std_h = statistics.stdev(hours) if len(hours) > 1 else 1.0

    from app.models.employee import Employee
    emp_result = await db.execute(select(Employee))
    emp_map = {str(e.id): f"{e.first_name} {e.last_name}" for e in emp_result.scalars().all()}

    anomalies = []
    for r in records:
        h = float(r.hours_worked)
        z = abs(h - mean_h) / max(std_h, 0.1)
        if z > 2.0:
            anomalies.append({
                "employee_id": str(r.employee_id),
                "employee_name": emp_map.get(str(r.employee_id), "Unknown"),
                "anomaly_type": "extended_hours" if h > mean_h else "insufficient_hours",
                "confidence_score": round(min(z / 3.0, 1.0), 2),
                "date": str(r.date),
                "details": {"hours_worked": h, "expected": round(mean_h, 2), "z_score": round(z, 2)},
            })
    return anomalies[:20]


@router.get("/insights")
async def get_insights(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_hr),
):
    engine = WorkforceIntelligenceEngine(db)
    health = await engine.get_workforce_health()
    insights = []
    if health["stats"]["pending_leave_requests"] > 0:
        insights.append(f"{health['stats']['pending_leave_requests']} leave request(s) pending HR approval")
    for team in health["teams"]:
        if team["risk_level"] == "critical":
            insights.append(f"{team['name']} is CRITICAL at {team['capacity_pct']}% capacity")
        elif team["risk_level"] == "high":
            insights.append(f"{team['name']} is at HIGH RISK — {team['employees_on_leave']} members on leave")
    if health["overall_health_score"] >= 85:
        insights.append("Overall workforce is healthy — keep up current engagement strategies")
    return {"insights": insights, "health_score": health["overall_health_score"]}


@router.get("/predictions")
async def get_predictions(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_hr),
):
    engine = WorkforceIntelligenceEngine(db)
    risks = []
    caps = await engine.get_team_capacities()
    for team in caps.keys():
        risk = await engine.calculate_team_risk(team)
        if risk["risk_score"] > 30:
            risks.append({
                "team": team,
                "attrition_probability": round(min(risk["risk_score"] / 100, 0.9), 2),
                "risk_factors": [f["factor"] for f in risk["factors"]],
            })
    return {"predictions": risks}

