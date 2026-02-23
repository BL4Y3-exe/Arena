from pydantic import BaseModel, Field


class ProfileCreate(BaseModel):
    name: str
    age: int | None = None
    weight: float | None = None
    height: float | None = None
    sport: str
    skill_level: int = Field(..., ge=1, le=10)
    experience_years: int | None = None
    goals: str | None = None
    training_intensity: str | None = None  # light / medium / hard
    city: str | None = None


class ProfileUpdate(ProfileCreate):
    name: str | None = None
    sport: str | None = None
    skill_level: int | None = Field(None, ge=1, le=10)


class ProfileOut(ProfileCreate):
    id: str
    user_id: str

    model_config = {"from_attributes": True}
