from pydantic import BaseModel, Field
from datetime import datetime


class SubmitExerciseRequest(BaseModel):
    exercise_id: int
    student_selected_label: str = Field(..., min_length=1)
    student_explanation: str = Field(..., min_length=1)
    student_pearson_r: float | None = None


class SubmissionFeedbackRequest(BaseModel):
    teacher_feedback: str = Field(..., min_length=1)
    teacher_grade: str | None = None


class SubmissionSummary(BaseModel):
    id: int
    exercise_id: int
    student_selected_label: str
    computed_relationship_label: str
    computed_pearson_r: float
    is_correct_label: bool
    teacher_feedback: str | None
    teacher_grade: str | None
    submitted_at: datetime


class SubmissionDetail(SubmissionSummary):
    user_id: int
    student_explanation: str
