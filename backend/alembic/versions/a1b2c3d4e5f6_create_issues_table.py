from alembic import op
import sqlalchemy as sa

revision = 'a1b2c3d4e5f6'
down_revision = '1fb8772f4392'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'issues',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('description', sa.String(length=5000), nullable=False),
        sa.Column('status', sa.Enum('open', 'closed', name='issue_status', native_enum=True), nullable=False, server_default='open'),
        sa.Column('created_at', sa.Integer(), nullable=False, server_default=sa.text("EXTRACT(EPOCH FROM NOW())::INTEGER")),
        sa.Column('updated_at', sa.Integer(), nullable=False, server_default=sa.text("EXTRACT(EPOCH FROM NOW())::INTEGER")),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_index('ix_issues_status', 'issues', ['status'])
    op.create_index('ix_issues_created_at', 'issues', ['created_at'])
    
    # Create trigger function to auto-update updated_at column
    op.execute("""
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = EXTRACT(EPOCH FROM NOW())::INTEGER;
            RETURN NEW;
        END;
        $$ language 'plpgsql';
    """)
    
    # Create trigger on issues table
    op.execute("""
        CREATE TRIGGER update_issues_updated_at
            BEFORE UPDATE ON issues
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    """)


def downgrade() -> None:
    op.execute("DROP TRIGGER IF EXISTS update_issues_updated_at ON issues")
    op.execute("DROP FUNCTION IF EXISTS update_updated_at_column()")
    
    op.drop_index('ix_issues_created_at', table_name='issues')
    op.drop_index('ix_issues_status', table_name='issues')

    op.drop_table('issues')
    
    op.execute("DROP TYPE IF EXISTS issue_status")
