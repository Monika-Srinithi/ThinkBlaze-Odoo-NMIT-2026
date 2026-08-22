from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from uuid import UUID

class WorkforceHealthScore(BaseModel):
    overall_score: float
    risk_level: str  # low/medium/high/critical
    department_scores: Dict[str, float]
    trend: str  # up/down/stable
    insights: List[str] = []

class RiskAlert(BaseModel):
    employee_id: str
    employee_name: str
    risk_type: str
    severity: str  # low/medium/high/critical
    description: str
    recommended_action: str
    score: float

class AnomalyDetection(BaseModel):
    employee_id: str
    employee_name: str
    anomaly_type: str
    confidence_score: float
    details: Dict[str, Any]
    date: Optional[str] = None

class WhatIfScenario(BaseModel):
    scenario_type: str
    parameters: Dict[str, Any]
    impact_analysis: Optional[Dict[str, Any]] = None
    recommendations: Optional[List[str]] = None

class AgentResponse(BaseModel):
    agent_name: str
    task: str
    result: Dict[str, Any]
    reasoning: List[str]
    trace_id: Optional[str] = None
    confidence: float = 1.0
