from fastapi import APIRouter
from app.api.v1 import auth, employees, attendance, leave, payroll, intelligence, simulator, agents, audit

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(employees.router)
api_router.include_router(attendance.router)
api_router.include_router(leave.router)
api_router.include_router(payroll.router)
api_router.include_router(intelligence.router)
api_router.include_router(simulator.router)
api_router.include_router(agents.router)
api_router.include_router(audit.router)
