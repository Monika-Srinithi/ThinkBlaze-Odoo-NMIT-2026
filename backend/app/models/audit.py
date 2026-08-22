import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Enum, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB, INET
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
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    action = Column(String(100), nullable=False)
    resource_type = Column(String(100), nullable=True)
    resource_id = Column(String(255), nullable=True)
    details = Column(JSONB, nullable=True)
    ip_address = Column(String(50), nullable=True)
    severity = Column(Enum(AuditSeverity), default=AuditSeverity.info)
    created_at = Column(DateTime, default=datetime.utcnow)

class AgentTrace(Base):
    __tablename__ = 'agent_traces'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    trace_id = Column(UUID(as_uuid=True), default=uuid.uuid4)
    agent_name = Column(String(100), nullable=False)
    task_description = Column(Text, nullable=True)
    input_data = Column(JSONB, nullable=True)
    output_data = Column(JSONB, nullable=True)
    reasoning_steps = Column(JSONB, default=list)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    status = Column(Enum(AgentStatus), default=AgentStatus.running)
    error_message = Column(Text, nullable=True)
