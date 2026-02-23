"""initial schema

Revision ID: 0001
Revises:
Create Date: 2026-02-23

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("email", sa.String(255), nullable=False, unique=True),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "profiles",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id"), nullable=False, unique=True),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("age", sa.Integer()),
        sa.Column("weight", sa.Float()),
        sa.Column("height", sa.Float()),
        sa.Column("sport", sa.String(100), nullable=False),
        sa.Column("skill_level", sa.Integer(), nullable=False),
        sa.Column("experience_years", sa.Integer()),
        sa.Column("goals", sa.Text()),
        sa.Column("training_intensity", sa.String(50)),
        sa.Column("city", sa.String(100)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "availabilities",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("day_of_week", sa.Integer(), nullable=False),
        sa.Column("start_time", sa.String(5), nullable=False),
        sa.Column("end_time", sa.String(5), nullable=False),
    )

    op.create_table(
        "matches",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("user_a_id", sa.String(36), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("user_b_id", sa.String(36), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("compatibility_score", sa.Float()),
        sa.Column("ai_reasoning", sa.Text()),
        sa.Column("risks", sa.Text()),
        sa.Column("strengths", sa.Text()),
        sa.Column(
            "status",
            sa.Enum("pending", "accepted", "rejected", name="matchstatus"),
            nullable=False,
            server_default="pending",
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table("matches")
    op.drop_table("availabilities")
    op.drop_table("profiles")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
