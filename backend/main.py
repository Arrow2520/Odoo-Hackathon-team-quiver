from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.database import Base, engine
from backend.routers import vehicles, drivers, trips, maintenance, fuel, expenses, reports, auth_router

# Creates tables on startup. Fine for hackathon speed;
# swap to Alembic migrations if you have time later.
Base.metadata.create_all(bind=engine)

app = FastAPI(title="TransitOps API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten for prod; wide open for hackathon frontend speed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(vehicles.router)
app.include_router(drivers.router)
app.include_router(trips.router)
app.include_router(maintenance.router)
app.include_router(fuel.router)
app.include_router(expenses.router)
app.include_router(reports.router)


@app.get("/")
def root():
    return {"status": "TransitOps API is running"}


@app.get("/health")
def health():
    return {"status": "ok"}
