from fastapi import APIRouter
from app.api.v1.endpoints import auth, tesoreria

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(tesoreria.router, prefix="/tesoreria", tags=["Tesorería"])
