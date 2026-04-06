from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.user import UserCreate, UserOut
from app.schemas.auth import LoginRequest, Token
from app.crud.user import get_user_by_email, create_user
from app.core.security import verify_password, create_access_token

# router
router = APIRouter()

@router.post("/register", response_model=UserOut)
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing = get_user_by_email(db, user.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    return create_user(db, user.first_name, user.email, user.password)

# config
TEACHER_INVITE_CODE = "CAteacher2024"

@router.post("/register-teacher", response_model=UserOut)
def register_teacher(
    user: UserCreate,
    invite_code: str,
    db: Session = Depends(get_db)
):
    if invite_code != TEACHER_INVITE_CODE:
        raise HTTPException(status_code=403, detail="Invalid invite code.")

    existing = get_user_by_email(db, user.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered.")

    new_user = create_user(db, user.first_name, user.email, user.password)
    new_user.role = "teacher"
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=Token)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = get_user_by_email(db, data.email)
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({
        "sub": str(user.id),
        "email": user.email,
        "role": user.role,
        "first_name": user.first_name
    })

    return {
        "access_token": token,
        "token_type": "bearer"
    }