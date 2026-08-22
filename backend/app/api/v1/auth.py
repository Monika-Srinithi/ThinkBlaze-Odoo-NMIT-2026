from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_password_hash
from app.schemas.auth import LoginRequest, TokenResponse, RefreshRequest, ChangePasswordRequest
from app.schemas.user import UserResponse
from app.services.auth_service import AuthService, get_current_user
from app.models.user import User

router = APIRouter(prefix='/auth', tags=['Authentication'])


@router.post('/login', response_model=TokenResponse)
async def login(request_data: LoginRequest, db: AsyncSession = Depends(get_db)):
    svc = AuthService(db)
    user = await svc.authenticate_user(request_data.email, request_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Invalid email or password'
        )
    tokens = await svc.create_user_tokens(user)
    return TokenResponse(**tokens, user=UserResponse.model_validate(user))


@router.post('/refresh')
async def refresh(request_data: RefreshRequest, db: AsyncSession = Depends(get_db)):
    svc = AuthService(db)
    return await svc.refresh_tokens(request_data.refresh_token)


@router.post('/logout')
async def logout(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    svc = AuthService(db)
    await svc.logout(current_user)
    return {'message': 'Logged out successfully'}


@router.get('/me', response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)


@router.post('/change-password')
async def change_password(
    request_data: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    from app.core.security import verify_password
    if not verify_password(request_data.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail='Current password is incorrect')
    current_user.hashed_password = get_password_hash(request_data.new_password)
    await db.commit()
    return {'message': 'Password changed successfully'}
