import uuid
from datetime import datetime

from sqlalchemy import String, Integer, Float, Text, ForeignKey, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Profile(Base):
    __tablename__ = "profiles"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), unique=True, nullable=False)

    # Personal
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    age: Mapped[int | None] = mapped_column(Integer)
    weight: Mapped[float | None] = mapped_column(Float)   # kg
    height: Mapped[float | None] = mapped_column(Float)   # cm

    # Sport
    sport: Mapped[str] = mapped_column(String(100), nullable=False)
    skill_level: Mapped[int] = mapped_column(Integer, nullable=False)   # 1–10
    experience_years: Mapped[int | None] = mapped_column(Integer)

    # Preferences
    goals: Mapped[str | None] = mapped_column(Text)
    training_intensity: Mapped[str | None] = mapped_column(String(50))  # light/medium/hard
    city: Mapped[str | None] = mapped_column(String(100))

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="profile")  # noqa: F821
