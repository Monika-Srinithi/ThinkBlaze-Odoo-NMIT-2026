"""
HR Copilot — Minimal but real. Data-grounded responses to natural language HR queries.
"""
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.intelligence_service import WorkforceIntelligenceEngine
from app.services.auth_service import get_current_user
from app.models.user import User
from app.models.audit import AgentTrace, AgentStatus
from datetime import datetime
from uuid import uuid4

router = APIRouter(prefix="/copilot", tags=["HR Copilot"])

INTENT_KEYWORDS = {
    "health": ["worry", "today", "status", "overview", "health", "summary", "critical", "urgent"],
    "team_risk": ["team", "beta", "alpha", "gamma", "delta", "epsilon", "high risk", "why", "reason", "risk"],
    "leave_impact": ["approve", "leave", "what if", "what happens", "impact", "capacity", "absent"],
    "availability": ["available", "availability", "lowest", "coverage", "backup", "who"],
    "pending": ["pending", "approval", "waiting", "queue", "review"],
}


class CopilotRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None


async def detect_intent(message: str) -> str:
    msg_lower = message.lower()
    scores = {intent: 0 for intent in INTENT_KEYWORDS}
    for intent, keywords in INTENT_KEYWORDS.items():
        scores[intent] = sum(1 for kw in keywords if kw in msg_lower)
    best = max(scores, key=scores.get)
    return best if scores[best] > 0 else "health"


async def build_response(intent: str, engine: WorkforceIntelligenceEngine, message: str) -> Dict[str, Any]:
    if intent == "health":
        health = await engine.get_workforce_health()
        ac = await engine.get_action_center()
        critical_teams = [t for t in health["teams"] if t["risk_level"] == "critical"]
        high_teams = [t for t in health["teams"] if t["risk_level"] == "high"]
        response_text = f"**Workforce Status: {health['overall_health_score']}/100**\n\n"
        if critical_teams:
            response_text += f"🔴 **Critical attention needed:** {', '.join(t['name'] for t in critical_teams)}\n"
            for t in critical_teams:
                response_text += f"   • {t['name']} is at {t['capacity_pct']}% capacity with {t['employees_on_leave']} members on leave\n"
        if high_teams:
            response_text += f"\n🟠 **High risk teams:** {', '.join(t['name'] for t in high_teams)}\n"
        if ac["pending_count"] > 0:
            response_text += f"\n⏳ **{ac['pending_count']} leave request(s) pending approval:**\n"
            for req in ac["pending_leave_requests"][:3]:
                response_text += f"   • {req['employee_name']} ({req['team']}) — {req['total_days']:.0f} days starting {req['start_date']} → team capacity would drop to {req['simulated_capacity']}%\n"
        return {
            "response": response_text,
            "data": {"health_score": health["overall_health_score"], "pending_actions": ac["pending_count"]},
            "intent": "health",
            "suggestions": ["Why is Team Beta high risk?", "Show pending leave requests", "What if I approve Ravi's leave?"],
        }

    elif intent == "team_risk":
        # Detect which team
        health = await engine.get_workforce_health()
        # Find highest risk team or specifically mentioned team
        target_team = None
        for team_data in health["teams"]:
            if any(kw in message.lower() for kw in team_data["name"].lower().split()):
                target_team = team_data["name"]
                break
        if not target_team:
            target_team = health["teams"][0]["name"] if health["teams"] else "Team Beta"

        evidence = await engine.get_risk_evidence(target_team)
        risk = await engine.calculate_team_risk(target_team)

        response_text = f"**{target_team} is {risk['risk_level'].upper()} RISK (Score: {risk['risk_score']}/100)**\n\n"
        response_text += "**Evidence:**\n"
        for factor in risk["factors"]:
            response_text += f"• {factor['factor']}: +{factor['score']} points\n  ↳ {factor['detail']}\n"
        if evidence["leave_evidence"]:
            on_leave = [l for l in evidence["leave_evidence"] if l["is_active"] or l["status"] == "pending"]
            if on_leave:
                response_text += f"\n**Leave situation:**\n"
                for l in on_leave[:4]:
                    status_emoji = "🟡 Pending" if l["status"] == "pending" else "🔴 On leave"
                    response_text += f"• {l['employee']}: {status_emoji} ({l['start_date']} → {l['end_date']})\n"

        pending_count = evidence["summary"]["pending_leaves"]
        if pending_count > 0:
            response_text += f"\n⚠️ {pending_count} pending leave request(s) could further reduce capacity.\n"
            response_text += f"\n**Recommendation:** Review pending leaves and run 'What if?' simulation before approving."

        return {
            "response": response_text,
            "data": {"team": target_team, "risk_score": risk["risk_score"], "evidence": evidence["risk_factors"]},
            "intent": "team_risk",
            "suggestions": ["Show pending leave requests", f"What if I approve Ravi's leave?", "Show team attendance breakdown"],
        }

    elif intent == "leave_impact":
        ac = await engine.get_action_center()
        if not ac["pending_leave_requests"]:
            return {
                "response": "There are no pending leave requests at the moment. All leave requests have been processed.",
                "data": {},
                "intent": "leave_impact",
                "suggestions": ["Show workforce health", "Show team risk scores"],
            }

        # Use the most urgent pending leave
        pending = sorted(ac["pending_leave_requests"], key=lambda x: x.get("simulated_capacity", 100))
        most_urgent = pending[0]
        sim = await engine.simulate_leave_approval(
            __import__("uuid").UUID(most_urgent["id"])
        )
        response_text = f"**What if you approve {sim['leave_request']['employee_name']}'s leave?**\n\n"
        response_text += f"**Team:** {sim['current_state']['team']}\n"
        response_text += f"**Before approval:** {sim['current_state']['capacity_pct']}% capacity\n"
        response_text += f"**After approval:** {sim['simulated_state']['capacity_pct']}% capacity "
        if sim["simulated_state"]["capacity_pct"] < 60:
            response_text += "🔴 CRITICAL\n"
        elif sim["simulated_state"]["capacity_pct"] < 75:
            response_text += "🟠 WARNING\n"
        else:
            response_text += "🟢\n"

        rec = sim["ai_recommendation"]
        response_text += f"\n**AI Recommendation:**\n{rec['reasoning']}\n"
        response_text += f"\n**Capacity impact:** {rec['capacity_impact']}"

        return {
            "response": response_text,
            "data": {"simulation": sim, "leave_request_id": most_urgent["id"]},
            "intent": "leave_impact",
            "suggestions": ["Apply recommendation", "Show all options", "Reject and suggest alternate date"],
        }

    elif intent == "availability":
        health = await engine.get_workforce_health()
        teams_sorted = sorted(health["teams"], key=lambda x: x["capacity_pct"])
        lowest = teams_sorted[0] if teams_sorted else None
        highest = teams_sorted[-1] if teams_sorted else None
        response_text = "**Team Availability Overview:**\n\n"
        for team in health["teams"]:
            emoji = "🔴" if team["capacity_pct"] < 60 else "🟠" if team["capacity_pct"] < 75 else "🟢"
            response_text += f"{emoji} **{team['name']}:** {team['capacity_pct']}% ({team['total'] - team['employees_on_leave']}/{team['total']} available)\n"
        if lowest:
            response_text += f"\n**Lowest availability:** {lowest['name']} at {lowest['capacity_pct']}%"
        return {
            "response": response_text,
            "data": {"teams": health["teams"]},
            "intent": "availability",
            "suggestions": [f"Why is {teams_sorted[0]['name']} low?" if teams_sorted else "Show risks", "Show pending leaves"],
        }

    elif intent == "pending":
        ac = await engine.get_action_center()
        if not ac["pending_leave_requests"]:
            return {
                "response": "✅ No pending leave requests. All requests have been processed.",
                "data": {"pending_count": 0},
                "intent": "pending",
                "suggestions": ["Show workforce health", "Show team risk scores"],
            }
        response_text = f"**{ac['pending_count']} Leave Request(s) Pending Approval:**\n\n"
        for req in ac["pending_leave_requests"]:
            urgency_emoji = "🔴" if req["urgency"] == "critical" else "🟠" if req["urgency"] == "high" else "🟡"
            response_text += f"{urgency_emoji} **{req['employee_name']}** ({req['designation']}, {req['team']})\n"
            response_text += f"   {req['total_days']:.0f} days · {req['start_date']} → {req['end_date']}\n"
            response_text += f"   Team capacity if approved: **{req['simulated_capacity']}%**\n\n"
        response_text += "Use 'What if I approve [name]'s leave?' to simulate the impact."
        return {
            "response": response_text,
            "data": {"pending": ac["pending_leave_requests"]},
            "intent": "pending",
            "suggestions": [f"What if I approve {ac['pending_leave_requests'][0]['employee_name'].split()[0]}'s leave?" if ac["pending_leave_requests"] else "Show risks"],
        }

    return {
        "response": "I can help with workforce health, team risk analysis, leave impact simulation, and availability. Try asking: 'What should I worry about today?' or 'Why is Team Beta high risk?'",
        "data": {},
        "intent": "general",
        "suggestions": ["What should I worry about today?", "Why is Team Beta high risk?", "Show pending leave requests"],
    }


@router.post("/chat")
async def copilot_chat(
    request: CopilotRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """HR Copilot — data-grounded answers to HR questions."""
    trace_id = str(uuid4())
    engine = WorkforceIntelligenceEngine(db)
    intent = await detect_intent(request.message)
    response = await build_response(intent, engine, request.message)

    # Save agent trace
    trace = AgentTrace(
        trace_id=trace_id,
        agent_name="HRCopilot",
        task_description=request.message,
        input_data={"message": request.message, "context": request.context},
        output_data=response,
        reasoning_steps=[
            f"Detected intent: {intent}",
            f"Queried relevant data for intent: {intent}",
            "Generated grounded response from HRMS data",
        ],
        completed_at=datetime.utcnow(),
        status=AgentStatus.completed,
    )
    db.add(trace)
    await db.commit()

    return {
        "trace_id": trace_id,
        "intent": intent,
        "response": response["response"],
        "data": response.get("data", {}),
        "suggestions": response.get("suggestions", []),
    }


@router.get("/traces")
async def get_traces(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get HR Copilot decision traces."""
    from sqlalchemy import select
    result = await db.execute(
        select(AgentTrace)
        .order_by(AgentTrace.started_at.desc())
        .limit(20)
    )
    traces = result.scalars().all()
    return [
        {
            "id": str(t.id),
            "trace_id": str(t.trace_id),
            "agent_name": t.agent_name,
            "question": t.task_description,
            "status": t.status.value if hasattr(t.status, "value") else str(t.status),
            "started_at": str(t.started_at),
            "completed_at": str(t.completed_at) if t.completed_at else None,
            "reasoning_steps": t.reasoning_steps or [],
            "result_summary": t.output_data.get("response", "")[:200] + "..." if t.output_data and len(t.output_data.get("response", "")) > 200 else (t.output_data or {}).get("response", ""),
        }
        for t in traces
    ]
