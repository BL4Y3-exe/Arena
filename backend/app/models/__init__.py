from app.core.database import Base  # noqa: F401 — import all models so Alembic sees them
from app.models.user import User  # noqa: F401
from app.models.profile import Profile  # noqa: F401
from app.models.availability import Availability  # noqa: F401
from app.models.match import Match  # noqa: F401
