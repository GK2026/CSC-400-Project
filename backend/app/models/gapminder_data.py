from sqlalchemy import Column, Integer, String, Float
from app.db.session import Base

class GapminderData(Base):
    __tablename__ = "gapminder_data"

    id = Column(Integer, primary_key=True, index=True)
    country = Column(String(255), nullable=False)
    country_code = Column(String(50), nullable=False)
    indicator = Column(String(255), nullable=False)
    indicator_code = Column(String(255), nullable=False)
    year = Column(Integer, nullable=False)
    value = Column(Float, nullable=True)