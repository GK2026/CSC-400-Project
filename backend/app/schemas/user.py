from pydantic import BaseModel, EmailStr
from typing import Optional


class UserCreate(BaseModel):
    first_name: str
    email: EmailStr
    password: str
    section: Optional[str] = None


class UserOut(BaseModel):
    id: int
    first_name: str
    email: EmailStr
    role: str
    section: Optional[str] = None

    class Config:
        from_attributes = True