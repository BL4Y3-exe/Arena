from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.availability import Availability
from app.models.user import User
from app.schemas.availability import AvailabilityCreate, AvailabilityOut

router = APIRouter(prefix="/availability", tags=["availability"])


@router.get("", response_model=list[AvailabilityOut])
def get_my_availability(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    return db.query(Availability).filter(Availability.user_id == current_user.id).all()


@router.post("", response_model=AvailabilityOut, status_code=status.HTTP_201_CREATED)
def add_availability(
    data: AvailabilityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    slot = Availability(**data.model_dump(), user_id=current_user.id)
    db.add(slot)
    db.commit()
    db.refresh(slot)
    return slot


@router.delete("/{slot_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_availability(
    slot_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    slot = (
        db.query(Availability)
        .filter(Availability.id == slot_id, Availability.user_id == current_user.id)
        .first()
    )
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")
    db.delete(slot)
    db.commit()
