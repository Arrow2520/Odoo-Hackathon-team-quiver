# TransitOps — Smart Transport Operations Platform

A centralized platform for managing the complete lifecycle of transport operations — vehicle registration, driver management, trip dispatching, maintenance, fuel/expense tracking, and operational analytics.

Built for the Odoo Hackathon by Team Quiver.

---

## Tech Stack

**Backend:** FastAPI, SQLAlchemy, SQLite (default) / PostgreSQL (optional), JWT auth
**Frontend:** React 19, Vite, React Router, Chart.js

---

## Project Structure

```
Odoo-Hackathon-team-quiver/
├── backend/
│   ├── main.py            # FastAPI app entrypoint
│   ├── config.py          # env / database URL config
│   ├── database.py        # SQLAlchemy engine & session
│   ├── models.py          # ORM models
│   ├── schemas.py         # Pydantic request/response schemas
│   ├── auth.py             # JWT auth helpers
│   ├── enums.py            # Status/role enums
│   └── routers/            # auth, vehicles, drivers, trips, maintenance, fuel, expenses, reports
├── frontend/
│   ├── src/
│   │   ├── pages/           # FleetPage, DriversPage, TripsPage, MaintenancePage, FuelExpensesPage, DashboardPage, AnalyticsPage
│   │   ├── components/      # forms, common UI (Modal, StatusBadge, KPICard)
│   │   ├── contexts/        # AuthContext (JWT-based login)
│   │   ├── services/        # api.js — API client
│   │   └── utils/           # constants.js, csvExport.js
└── requirements.txt
```

---

## Getting Started

### 1. Backend Setup

```bash
# from the repo root
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

> **Note:** `psycopg2-binary` in `requirements.txt` is only needed if you're using PostgreSQL. The app defaults to SQLite and works fine without it — if it fails to install on your machine, skip it, you don't need it for local dev.

Run the server:
```bash
uvicorn backend.main:app --reload --port 8000
```

- API base URL: `http://localhost:8000`
- Interactive API docs (Swagger UI): `http://localhost:8000/docs`
- By default, data is stored in a local SQLite file at `backend/transitops.db` (created automatically on first run).

#### Register your first users

The backend starts with no users. Register one per role via `/docs` or curl before logging in from the frontend:

```bash
curl -X POST http://localhost:8000/auth/register -H "Content-Type: application/json" \
  -d '{"email":"fleet@transitops.in","password":"password123","role":"fleet_manager","full_name":"Fleet Manager"}'
```

Valid `role` values: `fleet_manager`, `driver`, `safety_officer`, `financial_analyst`.

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

- App runs at: `http://localhost:5173`
- The frontend expects the backend to be running at `http://localhost:8000` (configured in `frontend/src/services/api.js`).

### 3. Run Both Together

Open two terminals:
```bash
# Terminal 1
uvicorn backend.main:app --reload --port 8000

# Terminal 2
cd frontend && npm run dev
```

---

## User Roles

| Role | Description |
|---|---|
| Fleet Manager | Oversees fleet assets, maintenance, vehicle lifecycle |
| Driver / Dispatcher | Creates trips, assigns vehicles and drivers, monitors deliveries |
| Safety Officer | Ensures driver compliance, tracks license validity and safety scores |
| Financial Analyst | Reviews expenses, fuel consumption, maintenance costs, profitability |

---

## Core Features

- ✅ JWT authentication with role-based access control (RBAC)
- ✅ Vehicle registry (CRUD, unique registration number, status tracking)
- ✅ Driver management (license tracking, safety score, status)
- ✅ Trip lifecycle: Draft → Dispatched → Completed / Cancelled
- ✅ Automatic status transitions (dispatch/complete/cancel a trip flips vehicle & driver status)
- ✅ Business rule validation: cargo weight vs. vehicle capacity, license expiry checks, no double-booking
- ✅ Maintenance workflow — active maintenance automatically pulls a vehicle out of the dispatch pool
- ✅ Fuel logs and expense tracking with automatic operational cost aggregation
- ✅ Dashboard KPIs (active/available vehicles, in-maintenance, active/pending trips, drivers on duty, fleet utilization)
- ✅ Reports & Analytics: fuel efficiency, fleet utilization, operational cost, vehicle ROI
- ✅ CSV export of vehicle reports

---

## Key Business Rules

- Vehicle registration number must be unique.
- Retired or In Shop vehicles never appear in the dispatch pool.
- Drivers with expired licenses or Suspended status cannot be assigned to trips.
- A vehicle or driver already On Trip cannot be assigned to another trip.
- Cargo weight must not exceed the vehicle's maximum load capacity.
- Dispatching a trip sets both vehicle and driver to On Trip.
- Completing or cancelling a trip restores both to Available.
- Creating an active maintenance record sets the vehicle to In Shop; closing it restores Available (unless Retired).

---

## API Overview

Full interactive reference available at `/docs` once the backend is running. Key endpoint groups:

| Group | Base path |
|---|---|
| Auth | `/auth/register`, `/auth/login` |
| Vehicles | `/vehicles`, `/vehicles/dispatch-pool` |
| Drivers | `/drivers`, `/drivers/dispatch-pool` |
| Trips | `/trips`, `/trips/{id}/dispatch`, `/trips/{id}/complete`, `/trips/{id}/cancel` |
| Maintenance | `/maintenance`, `/maintenance/{id}/close` |
| Fuel & Expenses | `/fuel-logs`, `/expenses` |
| Reports | `/dashboard`, `/reports/vehicles`, `/reports/vehicles/export` |

---

## Team

Team Quiver — Odoo Hackathon
