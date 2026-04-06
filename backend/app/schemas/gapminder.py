from pydantic import BaseModel, Field
from typing import List


class DatasetRequest(BaseModel):
    indicator_1: str = Field(..., min_length=1)
    indicator_2: str = Field(..., min_length=1)
    countries: List[str] = Field(default_factory=list)
    start_year: int
    end_year: int


class MergedRow(BaseModel):
    country_code: str
    year: int
    indicator_1_value: float
    indicator_2_value: float


class CorrelationRequest(BaseModel):
    rows: List[MergedRow]