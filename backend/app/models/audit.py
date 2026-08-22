import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Enum, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum

class AuditSeverity(str, enum.Enum):
    info = 'info'
    warning = 'warning'
    critical = 'critical'

class AgentStatus(str, enum.Enum):
    running = 'running'
    completed = 'completed'
    failed = 'failed'

class AuditLog(Base):
    __tablename__ = 'audit_logs'
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    action = Column(String(100), nullable=False)
    resource_type = Column(String(100), nullable=True)
    resource_id = Column(String(255), nullable=True)
    details = Column(JSON, nullable=True)
    ip_address = Column(String(50), nullable=True)
    severity = Column(Enum(AuditSeverity), default=AuditSeverity.info)
    created_at = Column(DateTime, default=datetime.utcnow)

class AgentTrace(Base):
    __tablename__ = 'agent_traces'
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    trace_id = Column(String(36), default=lambda: str(uuid.uuid4()))
    agent_name = Column(String(100), nullable=False)
    task_description = Column(Text, nullable=True)
    input_data = Column(JSON, nullable=True)
    output_data = Column(JSON, nullable=True)
    reasoning_steps = Column(JSON, default=list)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    status = Column(Enum(AgentStatus), default=AgentStatus.running)
    error_message = Column(Text, nullable=True)
