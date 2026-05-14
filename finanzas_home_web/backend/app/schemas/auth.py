from pydantic import BaseModel

class LoginRequestIn(BaseModel):
    username: str
    password: str

class LoginResponseOut(BaseModel):
    ok: bool
    username: str | None = None
    token: str | None = None
    message: str | None = None
