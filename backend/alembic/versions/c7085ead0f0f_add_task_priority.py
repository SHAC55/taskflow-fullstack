from alembic import op
import sqlalchemy as sa

revision = "c7085ead0f0f"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "tasks",
        sa.Column(
            "priority",
            sa.String(length=10),
            server_default="medium",
            nullable=False
        )
    )


def downgrade() -> None:
    op.drop_column("tasks", "priority")