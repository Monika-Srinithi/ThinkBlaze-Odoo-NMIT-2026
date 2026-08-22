from fastapi import APIRouter
router = APIRouter()
@router.post("/login")
async def login(): pass
@router.post("/refresh")
async def refresh(): pass
@router.post("/logout")
async def logout(): pass
@router.get("/me")
async def me(): pass
@router.post("/change-password")
async def change_password(): pass
