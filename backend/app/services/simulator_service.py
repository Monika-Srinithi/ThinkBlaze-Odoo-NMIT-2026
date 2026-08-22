from datetime import date, timedelta
from typing import List, Dict, Any
from uuid import UUID, uuid4
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from app.models.employee import Employee
from app.models.leave import LeaveRequest, LeaveStatus

_scenarios_store: Dict[str, dict] = {}  # In-memory store for demo

class SimulatorService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_scenario(self, data: dict) -> dict:
        scenario_id = str(uuid4())
        _scenarios_store[scenario_id] = {
            "id": scenario_id,
            "status": "created",
            "parameters": data
        }
        return _scenarios_store[scenario_id]

    async def run_scenario(self, scenario_id: str) -> dict:
        if scenario_id not in _scenarios_store:
            raise Exception("Scenario not found")
        scenario = _scenarios_store[scenario_id]
        scenario["status"] = "running"
        # Dummy simulation logic
        scenario["results"] = {
            "impact": "Low impact expected.",
            "recommendation": "Proceed with caution."
        }
        scenario["status"] = "completed"
        return scenario
