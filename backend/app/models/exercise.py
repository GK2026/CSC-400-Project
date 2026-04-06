from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.db.session import Base


class Exercise(Base):
    __tablename__ = "exercises"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)


    name = Column(String(255), nullable=False)

    indicator_1_code = Column(String(255), nullable=False)
    indicator_1_name = Column(String(255), nullable=False)

    indicator_2_code = Column(String(255), nullable=False)
    indicator_2_name = Column(String(255), nullable=False)

    countries_json = Column(Text, nullable=False)
    start_year = Column(Integer, nullable=False)
    end_year = Column(Integer, nullable=False)

    merged_rows_json = Column(Text, nullable=False)

    pearson_r = Column(Float, nullable=True)
    relationship_label = Column(String(50), nullable=True)

    points_used = Column(Integer, nullable=False, default=0)
    points_skipped = Column(Integer, nullable=False, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )