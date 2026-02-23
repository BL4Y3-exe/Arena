from pydantic import BaseModel
from app.models.match import MatchStatus


class MatchOut(BaseModel):
    id: str
    user_a_id: str
    user_b_id: str
    compatibility_score: float | None
    ai_reasoning: str | None
    risks: str | None
    strengths: str | None
    status: MatchStatus

    model_config = {"from_attributes": True}


class MatchActionRequest(BaseModel):
    status: MatchStatus  # accepted / rejected
