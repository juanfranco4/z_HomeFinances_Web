from fastapi import APIRouter, HTTPException
from app.schemas.auth import LoginRequestIn, LoginResponseOut

router = APIRouter()

@router.get("/health")
def health():
    return {"module": "auth", "status": "ok"}

@router.post("/login", response_model=LoginResponseOut)
def login(payload: LoginRequestIn):
    if not payload.username.strip() or not payload.password.strip():
        raise HTTPException(status_code=400, detail="Usuario y clave requeridos.")
    return LoginResponseOut(ok=True, username=payload.username, token="mock-token-finanzas-home", message="Login mock correcto.")
