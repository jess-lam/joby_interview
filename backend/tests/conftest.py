import pytest
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, get_db
from app.config import settings

# Determine test database URL
def get_test_database_url():
    if hasattr(settings, 'TEST_DATABASE_URL') and settings.TEST_DATABASE_URL:
        return settings.TEST_DATABASE_URL
    
    db_url = settings.DATABASE_URL
    if '/joby_db' in db_url:
        return db_url.replace('/joby_db', '/joby_test_db')
    elif db_url.endswith('/'):
        return db_url + 'joby_test_db'
    else:
        return db_url.rsplit('/', 1)[0] + '/joby_test_db'

TEST_DATABASE_URL = get_test_database_url()

# Create test engine (session scope - created once for all tests)
@pytest.fixture(scope="session")
def test_engine():
    admin_url = TEST_DATABASE_URL.rsplit('/', 1)[0] + '/postgres'
    admin_engine = create_engine(admin_url, isolation_level="AUTOCOMMIT")
    
    test_db_name = TEST_DATABASE_URL.rsplit('/', 1)[1]
    
    with admin_engine.connect() as conn:
        # Check if database exists
        result = conn.execute(
            text("SELECT 1 FROM pg_database WHERE datname = :dbname"),
            {"dbname": test_db_name}
        )
        exists = result.fetchone()
        
        if not exists:
            conn.execute(text(f'CREATE DATABASE {test_db_name}'))
    
    admin_engine.dispose()

    engine = create_engine(TEST_DATABASE_URL, pool_pre_ping=True)
    
    Base.metadata.create_all(bind=engine)
    
    yield engine

    Base.metadata.drop_all(bind=engine)
    engine.dispose()

@pytest.fixture(scope="session")
def test_session_factory(test_engine):
    return sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

@pytest.fixture(scope="function")
def db_connection(test_engine):
    connection = test_engine.connect()
    transaction = connection.begin()
    
    yield connection
    
    transaction.rollback()
    connection.close()

@pytest.fixture(scope="function")
def db_session(db_connection, test_session_factory):
    session = test_session_factory(bind=db_connection)
    
    yield session
    
    session.close()

@pytest.fixture(scope="function", autouse=True)
def override_get_db(db_session):
    def _get_test_db():
        try:
            yield db_session
        finally:
            pass  # Session cleanup handled by db_session fixture
    
    app.dependency_overrides[get_db] = _get_test_db
    yield
    app.dependency_overrides.clear()

@pytest.fixture(scope="function")
def client():
    with TestClient(app) as test_client:
        yield test_client

# ==================== DOMAIN FIXTURES ====================
from tests.fixtures.issues import create_issue, create_multiple_issues
