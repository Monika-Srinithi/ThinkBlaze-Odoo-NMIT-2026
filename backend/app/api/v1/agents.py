from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.agents.orchestrator import HRCopilot
from app.models.audit import AgentTrace
from app.services.auth_service import get_current_user
from app.models.user import User
from uuid import UUID

router = APIRouter(prefix='/agents', tags=['Multi-Agent AI'])


class QueryRequest:
    def __init__(self, message: str, context: dict = None):
        self.message = message
        self.context = context or {}

from pydantic import BaseModel
from typing import Optional, Dict, Any

class AgentQueryRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None


@router.post('/query')
async def query_copilot(
    request: AgentQueryRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    copilot = HRCopilot()
    response = await copilot.query(request.message, db, request.context)
    return response


@router.get('/traces')
async def get_traces(
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(AgentTrace).order_by(AgentTrace.started_at.desc()).limit(limit)
    )
    traces = result.scalars().all()
    return [
        {
            'id': str(t.id),
            'trace_id': str(t.trace_id),
            'agent_name': t.agent_name,
            'task_description': t.task_description,
            'status': t.status.value,
            'started_at': str(t.started_at),
            'completed_at': str(t.completed_at) if t.completed_at else None,
            'reasoning_steps': t.reasoning_steps
        }
        for t in traces
    ]


@router.get('/traces/{trace_id}')
async def get_trace(
    trace_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from fastapi import HTTPException
    result = await db.execute(select(AgentTrace).where(AgentTrace.id == trace_id))
    trace = result.scalar_one_or_none()
    if not trace:
        raise HTTPException(status_code=404, detail='Trace not found')
    return {
        'id': str(trace.id),
        'agent_name': trace.agent_name,
        'task_description': trace.task_description,
        'input_data': trace.input_data,
        'output_data': trace.output_data,
        'reasoning_steps': trace.reasoning_steps,
        'status': trace.status.value,
        'started_at': str(trace.started_at),
        'completed_at': str(trace.completed_at) if trace.completed_at else None
    }


@router.post('/attendance')
async def trigger_attendance_agent(
    request: AgentQueryRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from app.agents.attendance_agent import AttendanceAgent
    agent = AttendanceAgent(db)
    return await agent.analyze(request.message)


@router.post('/leave')
async def trigger_leave_agent(
    request: AgentQueryRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from app.agents.leave_agent import LeaveAgent
    agent = LeaveAgent(db)
    return await agent.analyze(request.message)


@router.post('/workforce')
async def trigger_workforce_agent(
    request: AgentQueryRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from app.agents.workforce_agent import WorkforceAgent
    agent = WorkforceAgent(db)
    return await agent.analyze(request.message)
