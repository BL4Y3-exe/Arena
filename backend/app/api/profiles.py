from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.profile import Profile
from app.models.user import User
from app.schemas.profile import ProfileCreate, ProfileOut, ProfileUpdate

router = APIRouter(prefix="/profiles", tags=["profiles"])


@router.post("", response_model=ProfileOut, status_code=status.HTTP_201_CREATED)
def create_profile(
    data: ProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if db.query(Profile).filter(Profile.user_id == current_user.id).first():
        raise HTTPException(status_code=400, detail="Profile already exists. Use PATCH to update.")
    profile = Profile(**data.model_dump(), user_id=current_user.id)
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


@router.get("/me", response_model=ProfileOut)
def get_my_profile(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


@router.patch("/me", response_model=ProfileOut)
def update_my_profile(
    data: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(profile, field, value)
    db.commit()
    db.refresh(profile)
    return profile


@router.get("/{user_id}", response_model=ProfileOut)
def get_profile(user_id: str, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    profile = db.query(Profile).filter(Profile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile
