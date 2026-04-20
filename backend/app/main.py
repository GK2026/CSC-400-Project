from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import auth, users, gapminder

from app.db.session import engine, Base
from app.models.user import User
from app.models.gapminder_data import GapminderData
from app.models.exercise import Exercise
from app.models.submission import Submission
from app.models.announcement import Announcement

Base.metadata.create_all(bind=engine)

app = FastAPI(title="GapMinders API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "http://127.0.0.1:5501",
        "http://localhost:5501",
        "http://127.0.0.1:3000",
        "http://localhost:3000",
        "https://gapminder.scsu.southernct.edu",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(gapminder.router, prefix="/gapminder", tags=["gapminder"])


@app.get("/")
def root():
    return {"status": "ok"}