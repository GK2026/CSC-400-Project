from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.sql import func
from app.db.session import Base


class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    exercise_id = Column(Integer, ForeignKey("exercises.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    student_selected_label = Column(String(50), nullable=False)
    student_explanation = Column(Text, nullable=False)

    computed_pearson_r = Column(Float, nullable=False)
    computed_relationship_label = Column(String(50), nullable=False)

    is_correct_label = Column(Boolean, nullable=False, default=False)

    teacher_feedback = Column(Text, nullable=True)

    submitted_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )