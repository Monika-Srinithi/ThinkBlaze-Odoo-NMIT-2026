from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.intelligence_service import IntelligenceService
from app.services.auth_service import get_current_user, require_hr
from app.models.user import User

router = APIRouter(prefix='/intelligence', tags=['Workforce Intelligence'])


@router.get('/health-score')
async def get_health_score(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_hr)
):
    svc = IntelligenceService(db)
    return await svc.calculate_workforce_health_score()


@router.get('/risk-alerts')
async def get_risk_alerts(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_hr)
):
    svc = IntelligenceService(db)
    return await svc.detect_risk_alerts()


@router.get('/anomalies')
async def get_anomalies(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_hr)
):
    svc = IntelligenceService(db)
    return await svc.detect_attendance_anomalies()


@router.get('/insights')
async def get_insights(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_hr)
):
    svc = IntelligenceService(db)
    return {'insights': await svc.generate_insights()}


@router.get('/predictions')
async def get_predictions(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_hr)
):
    svc = IntelligenceService(db)
    return {'predictions': await svc.predict_attrition()}
