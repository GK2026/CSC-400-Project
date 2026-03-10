from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    first_name: str
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    first_name: str
    email: EmailStr
    role: str

    class Config:
        from_attributes = True