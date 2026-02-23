from pydantic import BaseModel, Field


class AvailabilityCreate(BaseModel):
    day_of_week: int = Field(..., ge=0, le=6)  # 0=Mon, 6=Sun
    start_time: str  # "HH:MM"
    end_time: str    # "HH:MM"


class AvailabilityOut(AvailabilityCreate):
    id: str
    user_id: str

    model_config = {"from_attributes": True}
