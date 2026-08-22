from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, and_
from app.core.database import get_db
from app.services.auth_service import get_current_user, require_hr
from app.models.user import User
from app.models.audit import AuditLog
import math

router = APIRouter(prefix='/audit', tags=['Audit'])

@router.get('/logs')
async def get_audit_logs(
    page: int = 1,
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_hr)
):
    query = select(AuditLog, User).outerjoin(User, AuditLog.user_id == User.id).order_by(AuditLog.created_at.desc())
    
    total_query = select(func.count()).select_from(AuditLog)
    total = await db.scalar(total_query)
    
    offset = (page - 1) * limit
    query = query.offset(offset).limit(limit)
    
    result = await db.execute(query)
    rows = result.all()
    
    items = []
    for log, user in rows:
        items.append({
            "id": log.id,
            "user_id": log.user_id,
            "user_email": user.email if user else None,
            "action": log.action,
            "entity": log.entity,
            "entity_id": log.entity_id,
            "details": log.details,
            "created_at": str(log.created_at) if log.created_at else None,
            "ip_address": log.ip_address
        })
        
    return {
        "items": items,
        "total": total,
        "page": page,
        "pages": math.ceil(total / limit) if total else 0
    }

@router.get('/me')
async def get_my_audit_logs(
    page: int = 1,
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(AuditLog).where(AuditLog.user_id == current_user.id).order_by(AuditLog.created_at.desc())
    
    total_query = select(func.count()).select_from(AuditLog).where(AuditLog.user_id == current_user.id)
    total = await db.scalar(total_query)
    
    offset = (page - 1) * limit
    query = query.offset(offset).limit(limit)
    
    result = await db.execute(query)
    logs = result.scalars().all()
    
    return {
        "items": [{
            "id": log.id,
            "user_id": log.user_id,
            "action": log.action,
            "entity": log.entity,
            "entity_id": log.entity_id,
            "details": log.details,
            "created_at": str(log.created_at) if log.created_at else None,
            "ip_address": log.ip_address
        } for log in logs],
        "total": total,
        "page": page,
        "pages": math.ceil(total / limit) if total else 0
    }
