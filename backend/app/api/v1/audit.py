from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.audit import AuditLog
from app.services.auth_service import get_current_user, require_hr
from app.models.user import User
import csv
import io
from fastapi.responses import StreamingResponse

router = APIRouter(prefix='/audit', tags=['Audit'])


@router.get('/logs')
async def get_audit_logs(
    page: int = Query(1, ge=1),
    size: int = Query(50, ge=1, le=200),
    severity: str = Query(None),
    resource_type: str = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_hr)
):
    from sqlalchemy import and_, func
    query = select(AuditLog)
    filters = []
    if severity:
        filters.append(AuditLog.severity == severity)
    if resource_type:
        filters.append(AuditLog.resource_type == resource_type)
    if filters:
        query = query.where(and_(*filters))
    count_q = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_q)
    total = total_result.scalar() or 0
    query = query.order_by(AuditLog.created_at.desc()).offset((page - 1) * size).limit(size)
    result = await db.execute(query)
    logs = result.scalars().all()
    return {
        'items': [
            {
                'id': str(log.id),
                'user_id': str(log.user_id) if log.user_id else None,
                'action': log.action,
                'resource_type': log.resource_type,
                'resource_id': log.resource_id,
                'details': log.details,
                'severity': log.severity.value,
                'created_at': str(log.created_at)
            }
            for log in logs
        ],
        'total': total,
        'page': page,
        'size': size
    }


@router.get('/logs/export')
async def export_audit_logs(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_hr)
):
    result = await db.execute(
        select(AuditLog).order_by(AuditLog.created_at.desc()).limit(1000)
    )
    logs = result.scalars().all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['ID', 'User ID', 'Action', 'Resource Type', 'Resource ID', 'Severity', 'Timestamp'])
    for log in logs:
        writer.writerow([str(log.id), str(log.user_id) if log.user_id else '', log.action,
                         log.resource_type or '', log.resource_id or '', log.severity.value, str(log.created_at)])
    output.seek(0)
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode()),
        media_type='text/csv',
        headers={'Content-Disposition': 'attachment; filename=audit_logs.csv'}
    )


@router.get('/me')
async def get_my_activity(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(AuditLog)
        .where(AuditLog.user_id == current_user.id)
        .order_by(AuditLog.created_at.desc())
        .limit(50)
    )
    logs = result.scalars().all()
    return [
        {'id': str(l.id), 'action': l.action, 'resource_type': l.resource_type, 'created_at': str(l.created_at)}
        for l in logs
    ]
