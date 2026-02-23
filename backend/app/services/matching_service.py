"""
Rule-based compatibility scoring before AI refinement.

Score breakdown:
  30% skill similarity
  20% goal similarity       (binary: same goal keywords)
  20% schedule overlap
  15% weight proximity
  15% experience similarity
"""

from app.models.profile import Profile
from app.models.availability import Availability


def _skill_score(a: Profile, b: Profile) -> float:
    diff = abs(a.skill_level - b.skill_level)
    # diff=0 → 100, diff=2 → 0 (hard filter already ensures diff ≤ 2)
    return max(0.0, 1.0 - diff / 2.0) * 100


def _goal_score(a: Profile, b: Profile) -> float:
    if not a.goals or not b.goals:
        return 50.0
    a_words = set(a.goals.lower().split())
    b_words = set(b.goals.lower().split())
    if not a_words or not b_words:
        return 50.0
    overlap = len(a_words & b_words) / max(len(a_words | b_words), 1)
    return overlap * 100


def _schedule_score(a_slots: list[Availability], b_slots: list[Availability]) -> float:
    if not a_slots or not b_slots:
        return 0.0
    a_set = {(s.day_of_week, s.start_time, s.end_time) for s in a_slots}
    b_set = {(s.day_of_week, s.start_time, s.end_time) for s in b_slots}
    overlap = len(a_set & b_set)
    union = len(a_set | b_set)
    return (overlap / union) * 100 if union else 0.0


def _weight_score(a: Profile, b: Profile) -> float:
    if a.weight is None or b.weight is None:
        return 50.0
    diff = abs(a.weight - b.weight)
    # ≤5 kg → 100, ≥25 kg → 0
    return max(0.0, 1.0 - diff / 25.0) * 100


def _experience_score(a: Profile, b: Profile) -> float:
    if a.experience_years is None or b.experience_years is None:
        return 50.0
    diff = abs(a.experience_years - b.experience_years)
    return max(0.0, 1.0 - diff / 10.0) * 100


def compute_rule_score(
    a: Profile,
    b: Profile,
    a_slots: list[Availability],
    b_slots: list[Availability],
) -> float:
    return (
        0.30 * _skill_score(a, b)
        + 0.20 * _goal_score(a, b)
        + 0.20 * _schedule_score(a_slots, b_slots)
        + 0.15 * _weight_score(a, b)
        + 0.15 * _experience_score(a, b)
    )


def passes_hard_filters(a: Profile, b: Profile) -> bool:
    """Return True if two profiles should even be considered for matching."""
    if a.sport.lower() != b.sport.lower():
        return False
    if abs(a.skill_level - b.skill_level) > 2:
        return False
    if a.city and b.city and a.city.lower() != b.city.lower():
        return False
    return True
