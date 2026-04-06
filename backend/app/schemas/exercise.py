from pydantic import BaseModel, Field
from typing import List
from datetime import datetime


class ExerciseRow(BaseModel):
    country_code: str
    year: int
    indicator_1_value: float
    indicator_2_value: float


class SaveExerciseRequest(BaseModel):
    name: str | None = None

    indicator_1_code: str = Field(..., min_length=1)
    indicator_1_name: str = Field(..., min_length=1)
    indicator_2_code: str = Field(..., min_length=1)
    indicator_2_name: str = Field(..., min_length=1)

    countries: List[str] = Field(default_factory=list)
    start_year: int
    end_year: int

    rows: List[ExerciseRow] = Field(default_factory=list)

    pearson_r: float | None = None
    relationship_label: str | None = None
    points_used: int | None = None
    points_skipped: int | None = 0


class ExerciseSummary(BaseModel):
    id: int

    name: str

    indicator_1_code: str
    indicator_1_name: str
    indicator_2_code: str
    indicator_2_name: str
    countries: List[str]
    start_year: int
    end_year: int
    pearson_r: float | None
    relationship_label: str | None
    points_used: int
    points_skipped: int
    created_at: datetime


class ExerciseDetail(ExerciseSummary):
    rows: List[ExerciseRow]