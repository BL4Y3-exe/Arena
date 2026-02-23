from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.availability import Availability
from app.models.match import Match, MatchStatus
from app.models.profile import Profile
from app.models.user import User
from app.schemas.match import MatchOut, MatchActionRequest
from app.services.matching_service import compute_rule_score, passes_hard_filters
from app.services.ai_service import refine_with_ai

router = APIRouter(prefix="/match", tags=["match"])


@router.post("/find", response_model=list[MatchOut])
def find_matches(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Run matching for the current user and persist new matches."""
    my_profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not my_profile:
        raise HTTPException(status_code=400, detail="Complete your profile before matchmaking")

    my_slots = db.query(Availability).filter(Availability.user_id == current_user.id).all()

    # Fetch all other profiles in same sport & city (hard-filter shortlist)
    candidates = (
        db.query(Profile).filter(Profile.user_id != current_user.id, Profile.sport == my_profile.sport).all()
    )

    results = []
    for candidate in candidates:
        if not passes_hard_filters(my_profile, candidate):
            continue

        # Skip if match already exists
        existing = (
            db.query(Match)
            .filter(
                or_(
                    (Match.user_a_id == current_user.id) & (Match.user_b_id == candidate.user_id),
                    (Match.user_a_id == candidate.user_id) & (Match.user_b_id == current_user.id),
                )
            )
            .first()
        )
        if existing:
            results.append(existing)
            continue

        their_slots = db.query(Availability).filter(Availability.user_id == candidate.user_id).all()
        rule_score = compute_rule_score(my_profile, candidate, my_slots, their_slots)
        ai_result = refine_with_ai(my_profile, candidate, rule_score)

        match = Match(
            user_a_id=current_user.id,
            user_b_id=candidate.user_id,
            compatibility_score=ai_result.get("compatibility_score", rule_score),
            ai_reasoning=ai_result.get("reasoning"),
            risks=ai_result.get("risks"),
            strengths=ai_result.get("strengths"),
            status=MatchStatus.pending,
        )
        db.add(match)
        db.commit()
        db.refresh(match)
        results.append(match)

    results.sort(key=lambda m: m.compatibility_score or 0, reverse=True)
    return results


@router.get("/recommended", response_model=list[MatchOut])
def get_recommended(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return existing pending matches sorted by score."""
    matches = (
        db.query(Match)
        .filter(
            or_(Match.user_a_id == current_user.id, Match.user_b_id == current_user.id),
            Match.status == MatchStatus.pending,
        )
        .order_by(Match.compatibility_score.desc())
        .all()
    )
    return matches


@router.patch("/{match_id}", response_model=MatchOut)
def respond_to_match(
    match_id: str,
    body: MatchActionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    match = (
        db.query(Match)
        .filter(
            Match.id == match_id,
            or_(Match.user_a_id == current_user.id, Match.user_b_id == current_user.id),
        )
        .first()
    )
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    match.status = body.status
    db.commit()
    db.refresh(match)
    return match
