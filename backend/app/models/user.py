import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, Enum, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum


class UserRole(str, enum.Enum):
    admin = 'admin'
    hr = 'hr'
    manager = 'manager'
    employee = 'employee'


class User(Base):
    __tablename__ = 'users'
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(200), nullable=False)
    role = Column(String(20), default='employee')
    is_active = Column(Boolean, default=True)
    employee_id = Column(String(36), ForeignKey('employees.id', ondelete='SET NULL'), nullable=True)
    last_login = Column(DateTime, nullable=True)
    refresh_token = Column(String(512), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    employee = relationship('Employee', back_populates='user', foreign_keys=[employee_id])
