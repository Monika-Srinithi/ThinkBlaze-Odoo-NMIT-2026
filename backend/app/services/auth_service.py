from datetime import timedelta
from typing import Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from app.models.user import User
from app.core.security import verify_password, create_access_token, create_refresh_token, decode_token
from app.core.database import get_db
from app.core.config import settings
from datetime import datetime

oauth2_scheme = OAuth2PasswordBearer(tokenUrl='/api/v1/auth/login')

class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def authenticate_user(self, email: str, password: str) -> Optional[User]:
        result = await self.db.execute(select(User).where(User.email == email, User.is_active == True))
        user = result.scalar_one_or_none()
        if not user or not verify_password(password, user.hashed_password):
            return None
        user.last_login = datetime.utcnow()
        await self.db.commit()
        return user

    async def create_user_tokens(self, user: User) -> dict:
        access_token = create_access_token({'sub': str(user.id), 'email': user.email, 'role': user.role})
        refresh_token = create_refresh_token({'sub': str(user.id)})
        user.refresh_token = refresh_token
        await self.db.commit()
        return {'access_token': access_token, 'refresh_token': refresh_token}

    async def refresh_tokens(self, refresh_token: str) -> dict:
        payload = decode_token(refresh_token)
        if not payload or payload.get('type') != 'refresh':
            raise HTTPException(status_code=401, detail='Invalid refresh token')
        user_id = payload.get('sub')
        result = await self.db.execute(select(User).where(User.id == UUID(user_id)))
        user = result.scalar_one_or_none()
        if not user or user.refresh_token != refresh_token:
            raise HTTPException(status_code=401, detail='Refresh token revoked')
        return await self.create_user_tokens(user)

    async def logout(self, user: User):
        user.refresh_token = None
        await self.db.commit()

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail='Could not validate credentials',
        headers={'WWW-Authenticate': 'Bearer'},
    )
    payload = decode_token(token)
    if not payload:
        raise credentials_exception
    user_id = payload.get('sub')
    if not user_id:
        raise credentials_exception
    result = await db.execute(select(User).where(User.id == UUID(user_id), User.is_active == True))
    user = result.scalar_one_or_none()
    if not user:
        raise credentials_exception
    return user

async def require_hr(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in ('admin', 'hr'):
        raise HTTPException(status_code=403, detail='HR or Admin access required')
    return current_user
