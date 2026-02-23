import uuid

from sqlalchemy import String, Integer, Time, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Availability(Base):
    __tablename__ = "availabilities"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    day_of_week: Mapped[int] = mapped_column(Integer, nullable=False)   # 0=Mon … 6=Sun
    start_time: Mapped[str] = mapped_column(String(5), nullable=False)  # "HH:MM"
    end_time: Mapped[str] = mapped_column(String(5), nullable=False)    # "HH:MM"

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="availabilities")  # noqa: F821
