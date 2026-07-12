import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend.database import Base, get_db
from backend.main import app

# Use an in-memory SQLite database for blazing fast, isolated tests
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def db_session():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture
def client(db_session):
    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()

@pytest.fixture
def auth_headers(client):
    """Registers a fleet manager and returns their auth token header."""
    user_data = {
        "email": "manager@transitops.com",
        "password": "securepassword",
        "role": "fleet_manager",
        "full_name": "Test Manager"
    }
    client.post("/auth/register", json=user_data)
    
    login_response = client.post(
        "/auth/login", 
        data={"username": user_data["email"], "password": user_data["password"]}
    )
    token = login_response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}