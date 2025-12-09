"""
The script reads seed_issues.sql and executes it.
"""

import os
import sys

from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy import create_engine, text


class SeedSettings(BaseSettings):
    DATABASE_URL: str
    
    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"),
        case_sensitive=True,
        extra='ignore'
    )

settings = SeedSettings()

def seed_issues() -> None:
    print("Starting seed process...")

    script_dir = os.path.dirname(__file__)
    sql_file_path = os.path.join(script_dir, 'seed_issues.sql')
    
    if not os.path.exists(sql_file_path):
        print(f"❌ Error: SQL file not found at {sql_file_path}", file=sys.stderr)
        sys.exit(1)

    try:
        with open(sql_file_path, 'r') as f:
            sql_content = f.read()
    except Exception as e:
        print(f"❌ Error reading SQL file: {e}", file=sys.stderr)
        sys.exit(1)
    
    # Create engine
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,
    )
    
    connection = engine.connect()
    trans = connection.begin()
    
    try:
        print("Executing seed SQL...")
        connection.execute(text(sql_content))
        
        trans.commit()
        print("✅ Successfully seeded issues!")
        
        # Show summary
        result = connection.execute(text("SELECT status, COUNT(*) FROM issues GROUP BY status"))
        print("\nSummary:")
        for row in result:
            print(f"  {row[0]}: {row[1]} issues")
        
    except Exception as e:
        trans.rollback()
        print(f"❌ Error seeding issues: {e}", file=sys.stderr)
        raise
    finally:
        connection.close()
        engine.dispose()


def main():
    try:
        seed_issues()
    except Exception as e:
        print(f"Fatal error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()
