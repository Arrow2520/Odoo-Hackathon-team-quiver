from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field

from backend.enums import UserRole, VehicleStatus, DriverStatus, TripStatus, MaintenanceStatus, ExpenseType


# ---------------- User / Auth ----------------
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    role: UserRole
    full_name: str


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    role: UserRole
    full_name: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# ---------------- Vehicle ----------------
class VehicleBase(BaseModel):
    registration_number: str
    model: str
    vehicle_type: str
    max_load_capacity: float = Field(gt=0)
    odometer: float = 0.0
    acquisition_cost: float = Field(gt=0)
    region: Optional[str] = None


class VehicleCreate(VehicleBase):
    pass


class VehicleUpdate(BaseModel):
    model: Optional[str] = None
    vehicle_type: Optional[str] = None
    max_load_capacity: Optional[float] = None
    odometer: Optional[float] = None
    acquisition_cost: Optional[float] = None
    region: Optional[str] = None
    status: Optional[VehicleStatus] = None


class VehicleResponse(VehicleBase):
    id: int
    status: VehicleStatus
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


# ---------------- Driver ----------------
class DriverBase(BaseModel):
    name: str
    license_number: str
    license_category: str
    license_expiry: date
    phone: str


class DriverCreate(DriverBase):
    pass


class DriverUpdate(BaseModel):
    name: Optional[str] = None
    license_category: Optional[str] = None
    license_expiry: Optional[date] = None
    phone: Optional[str] = None
    safety_score: Optional[float] = None
    status: Optional[DriverStatus] = None


class DriverResponse(DriverBase):
    id: int
    safety_score: float
    status: DriverStatus
    model_config = ConfigDict(from_attributes=True)


# ---------------- Trip ----------------
class TripCreate(BaseModel):
    source: str
    destination: str
    vehicle_id: int
    driver_id: int
    cargo_weight: float = Field(gt=0)
    planned_distance: float = Field(gt=0)
    revenue: float = 0.0


class TripComplete(BaseModel):
    actual_distance: float = Field(gt=0)
    fuel_consumed: float = Field(ge=0)


class TripResponse(BaseModel):
    id: int
    trip_code: str
    source: str
    destination: str
    vehicle_id: int
    driver_id: int
    cargo_weight: float
    planned_distance: float
    actual_distance: Optional[float]
    fuel_consumed: Optional[float]
    revenue: float
    status: TripStatus
    dispatch_time: Optional[datetime]
    completion_time: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class TripDetailResponse(TripResponse):
    vehicle: VehicleResponse
    driver: DriverResponse


# ---------------- Maintenance ----------------
class MaintenanceCreate(BaseModel):
    vehicle_id: int
    service_type: str
    description: Optional[str] = None
    cost: float = 0.0


class MaintenanceResponse(BaseModel):
    id: int
    vehicle_id: int
    service_type: str
    description: Optional[str]
    cost: float
    status: MaintenanceStatus
    opened_at: datetime
    closed_at: Optional[datetime]
    model_config = ConfigDict(from_attributes=True)


# ---------------- Fuel Log ----------------
class FuelLogCreate(BaseModel):
    vehicle_id: int
    trip_id: Optional[int] = None
    liters: float = Field(gt=0)
    cost: float = Field(gt=0)
    odometer: float = Field(gt=0)
    fuel_date: date


class FuelLogResponse(FuelLogCreate):
    id: int
    model_config = ConfigDict(from_attributes=True)


# ---------------- Expense ----------------
class ExpenseCreate(BaseModel):
    vehicle_id: int
    trip_id: Optional[int] = None
    expense_type: ExpenseType
    amount: float = Field(gt=0)
    description: Optional[str] = None
    expense_date: date


class ExpenseResponse(ExpenseCreate):
    id: int
    model_config = ConfigDict(from_attributes=True)


# ---------------- Reports ----------------
class VehicleReport(BaseModel):
    vehicle_id: int
    registration_number: str
    total_fuel_cost: float
    total_maintenance_cost: float
    total_expense_cost: float
    operational_cost: float
    fuel_efficiency: Optional[float]
    roi: Optional[float]


class DashboardKPIs(BaseModel):
    active_vehicles: int
    available_vehicles: int
    vehicles_in_maintenance: int
    active_trips: int
    pending_trips: int
    drivers_on_duty: int
    fleet_utilization_percent: float