from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.simulator_service import SimulatorService
from app.services.auth_service import get_current_user, require_hr
from app.models.user import User
from app.schemas.intelligence import WhatIfScenario

router = APIRouter(prefix='/simulator', tags=['What-If Simulator'])


@router.post('/scenario')
async def create_scenario(
    data: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_hr)
):
    svc = SimulatorService(db)
    return await svc.create_scenario(data)


@router.get('/scenarios')
async def get_scenarios(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_hr)
):
    svc = SimulatorService(db)
    return await svc.get_scenarios()


@router.post('/run')
async def run_simulation(
    scenario: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_hr)
):
    svc = SimulatorService(db)
    return await svc.run_simulation(scenario)


@router.get('/bottlenecks')
async def get_bottlenecks(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_hr)
):
    svc = SimulatorService(db)
    return await svc.detect_bottlenecks()


@router.post('/apply')
async def apply_recommendation(
    data: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_hr)
):
    return {'message': 'Recommendation applied', 'recommendation': data.get('recommendation'), 'status': 'applied'}
