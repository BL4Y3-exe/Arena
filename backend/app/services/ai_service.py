"""OpenAI-based AI refinement for match compatibility."""

import json
import logging

from openai import OpenAI, OpenAIError

from app.core.config import settings
from app.models.profile import Profile

logger = logging.getLogger(__name__)

_client: OpenAI | None = None


def _get_client() -> OpenAI:
    global _client
    if _client is None:
        _client = OpenAI(api_key=settings.OPENAI_API_KEY)
    return _client


def _build_prompt(a: Profile, b: Profile, rule_score: float) -> str:
    return f"""You are a professional combat sports coach analyzing compatibility between two athletes.

Athlete A:
- Name: {a.name}
- Sport: {a.sport}
- Skill level: {a.skill_level}/10
- Experience: {a.experience_years or "unknown"} years
- Weight: {a.weight or "unknown"} kg
- Goals: {a.goals or "not specified"}
- Training intensity: {a.training_intensity or "not specified"}

Athlete B:
- Name: {b.name}
- Sport: {b.sport}
- Skill level: {b.skill_level}/10
- Experience: {b.experience_years or "unknown"} years
- Weight: {b.weight or "unknown"} kg
- Goals: {b.goals or "not specified"}
- Training intensity: {b.training_intensity or "not specified"}

Rule-based pre-score: {rule_score:.1f}/100

Respond ONLY with valid JSON (no markdown) in this exact structure:
{{
  "compatibility_score": <integer 0-100>,
  "risks": "<concise risk analysis>",
  "strengths": "<compatibility strengths>",
  "reasoning": "<final recommendation paragraph>"
}}"""


def refine_with_ai(a: Profile, b: Profile, rule_score: float) -> dict:
    """
    Call the LLM to refine the rule-based score.
    Returns a dict with keys: compatibility_score, risks, strengths, reasoning.
    Falls back to rule score on any error.
    """
    if not settings.OPENAI_API_KEY:
        return {
            "compatibility_score": round(rule_score),
            "risks": "AI unavailable — no API key configured.",
            "strengths": "Rule-based score only.",
            "reasoning": f"Compatibility estimated at {rule_score:.1f}/100 using rule-based scoring.",
        }

    prompt = _build_prompt(a, b, rule_score)
    try:
        response = _get_client().chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=400,
        )
        content = response.choices[0].message.content.strip()
        return json.loads(content)
    except (OpenAIError, json.JSONDecodeError, KeyError) as exc:
        logger.warning("AI refinement failed: %s", exc)
        return {
            "compatibility_score": round(rule_score),
            "risks": "AI analysis unavailable.",
            "strengths": "Based on rule scoring.",
            "reasoning": f"Estimated compatibility: {rule_score:.1f}/100.",
        }
