import uuid
from datetime import datetime

from sqlalchemy import String, Float, Text, ForeignKey, DateTime, func, Enum
from sqlalchemy.orm import Mapped, mapped_column
import enum

from app.core.database import Base


class MatchStatus(str, enum.Enum):
    pending = "pending"
    accepted = "accepted"
    rejected = "rejected"


class Match(Base):
    __tablename__ = "matches"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_a_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    user_b_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)

    compatibility_score: Mapped[float | None] = mapped_column(Float)
    ai_reasoning: Mapped[str | None] = mapped_column(Text)
    risks: Mapped[str | None] = mapped_column(Text)
    strengths: Mapped[str | None] = mapped_column(Text)

    status: Mapped[MatchStatus] = mapped_column(
        Enum(MatchStatus), default=MatchStatus.pending, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
