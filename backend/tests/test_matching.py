"""Basic tests for the matching service."""

import pytest
from unittest.mock import MagicMock

from app.services.matching_service import compute_rule_score, passes_hard_filters


def _make_profile(**kwargs):
    p = MagicMock()
    defaults = dict(
        sport="boxing",
        skill_level=5,
        experience_years=3,
        weight=70.0,
        goals="improve cardio",
        training_intensity="medium",
        city="paris",
    )
    defaults.update(kwargs)
    for k, v in defaults.items():
        setattr(p, k, v)
    return p


def test_passes_hard_filters_same_sport():
    a = _make_profile()
    b = _make_profile()
    assert passes_hard_filters(a, b) is True


def test_fails_hard_filter_different_sport():
    a = _make_profile(sport="boxing")
    b = _make_profile(sport="judo")
    assert passes_hard_filters(a, b) is False


def test_fails_hard_filter_skill_gap():
    a = _make_profile(skill_level=1)
    b = _make_profile(skill_level=5)
    assert passes_hard_filters(a, b) is False


def test_rule_score_perfect_match():
    a = _make_profile()
    b = _make_profile()
    score = compute_rule_score(a, b, [], [])
    assert score >= 50  # schedule score 0 because no slots, others are high


def test_rule_score_range():
    a = _make_profile(skill_level=3, weight=65, experience_years=2)
    b = _make_profile(skill_level=5, weight=80, experience_years=5)
    score = compute_rule_score(a, b, [], [])
    assert 0 <= score <= 100
