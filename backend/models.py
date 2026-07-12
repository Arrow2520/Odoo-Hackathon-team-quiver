from __future__ import annotations

from datetime import UTC, date, datetime

from sqlalchemy import Date, DateTime, Enum as SAEnum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.database import Base
from backend.enums import DriverStatus, ExpenseType, MaintenanceStatus, TripStatus, UserRole, VehicleStatus
#

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(120), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(200), nullable=False)
    role: Mapped[UserRole] = mapped_column(SAEnum(UserRole), nullable=False)
    full_name: Mapped[str] = mapped_column(String(100), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC)
    )


class Vehicle(Base):
    __tablename__ = "vehicles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    registration_number: Mapped[str] = mapped_column(String(30), unique=True, index=True, nullable=False)
    model: Mapped[str] = mapped_column(String(100), nullable=False)
    vehicle_type: Mapped[str] = mapped_column(String(50), nullable=False)
    max_load_capacity: Mapped[float] = mapped_column(nullable=False)
    odometer: Mapped[float] = mapped_column(default=0.0, server_default="0")
    acquisition_cost: Mapped[float] = mapped_column(nullable=False)
    region: Mapped[str | None] = mapped_column(String(100), nullable=True, default=None)
    status: Mapped[VehicleStatus] = mapped_column(
        SAEnum(VehicleStatus), default=VehicleStatus.AVAILABLE, server_default=VehicleStatus.AVAILABLE.value, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
    )

    trips: Mapped[list[Trip]] = relationship(back_populates="vehicle")
    maintenance_logs: Mapped[list[Maintenance]] = relationship(back_populates="vehicle")
    fuel_logs: Mapped[list[FuelLog]] = relationship(back_populates="vehicle")
    expenses: Mapped[list[Expense]] = relationship(back_populates="vehicle")


class Driver(Base):
    __tablename__ = "drivers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    license_number: Mapped[str] = mapped_column(String(30), unique=True, index=True, nullable=False)
    license_category: Mapped[str] = mapped_column(String(20), nullable=False)
    license_expiry: Mapped[date] = mapped_column(Date, nullable=False)
    phone: Mapped[str] = mapped_column(String(20), nullable=False)
    safety_score: Mapped[float] = mapped_column(default=100.0, server_default="100")
    status: Mapped[DriverStatus] = mapped_column(
        SAEnum(DriverStatus), default=DriverStatus.AVAILABLE, server_default=DriverStatus.AVAILABLE.value, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
    )

    trips: Mapped[list[Trip]] = relationship(back_populates="driver")


class Trip(Base):
    __tablename__ = "trips"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    trip_code: Mapped[str] = mapped_column(String(30), unique=True, index=True, nullable=False)
    source: Mapped[str] = mapped_column(String(150), nullable=False)
    destination: Mapped[str] = mapped_column(String(150), nullable=False)

    vehicle_id: Mapped[int] = mapped_column(ForeignKey("vehicles.id"), nullable=False, index=True)
    driver_id: Mapped[int] = mapped_column(ForeignKey("drivers.id"), nullable=False, index=True)

    cargo_weight: Mapped[float] = mapped_column(nullable=False)
    planned_distance: Mapped[float] = mapped_column(nullable=False)
    actual_distance: Mapped[float | None] = mapped_column(nullable=True, default=None)

    dispatch_time: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True, default=None)
    completion_time: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True, default=None)

    fuel_consumed: Mapped[float | None] = mapped_column(nullable=True, default=None)
    revenue: Mapped[float] = mapped_column(default=0.0, server_default="0")

    status: Mapped[TripStatus] = mapped_column(
        SAEnum(TripStatus), default=TripStatus.DRAFT, server_default=TripStatus.DRAFT.value, nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
    )

    vehicle: Mapped[Vehicle] = relationship(back_populates="trips")
    driver: Mapped[Driver] = relationship(back_populates="trips")
    fuel_logs: Mapped[list[FuelLog]] = relationship(back_populates="trip")
    expenses: Mapped[list[Expense]] = relationship(back_populates="trip")


class Maintenance(Base):
    __tablename__ = "maintenance_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    vehicle_id: Mapped[int] = mapped_column(ForeignKey("vehicles.id"), nullable=False, index=True)

    service_type: Mapped[str] = mapped_column(String(50), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True, default=None)

    cost: Mapped[float] = mapped_column(default=0.0, server_default="0")

    status: Mapped[MaintenanceStatus] = mapped_column(
        SAEnum(MaintenanceStatus), default=MaintenanceStatus.ACTIVE, server_default=MaintenanceStatus.ACTIVE.value, nullable=False
    )

    opened_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC)
    )
    closed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True, default=None)

    vehicle: Mapped[Vehicle] = relationship(back_populates="maintenance_logs")


class FuelLog(Base):
    __tablename__ = "fuel_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    vehicle_id: Mapped[int] = mapped_column(ForeignKey("vehicles.id"), nullable=False, index=True)
    trip_id: Mapped[int | None] = mapped_column(ForeignKey("trips.id"), nullable=True, index=True, default=None)

    liters: Mapped[float] = mapped_column(nullable=False)
    cost: Mapped[float] = mapped_column(nullable=False)
    odometer: Mapped[float] = mapped_column(nullable=False)

    fuel_date: Mapped[date] = mapped_column(Date, nullable=False)

    vehicle: Mapped[Vehicle] = relationship(back_populates="fuel_logs")
    trip: Mapped[Trip | None] = relationship(back_populates="fuel_logs")


class Expense(Base):
    __tablename__ = "expenses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    vehicle_id: Mapped[int] = mapped_column(ForeignKey("vehicles.id"), nullable=False, index=True)
    trip_id: Mapped[int | None] = mapped_column(ForeignKey("trips.id"), nullable=True, index=True, default=None)

    expense_type: Mapped[ExpenseType] = mapped_column(SAEnum(ExpenseType), nullable=False)
    amount: Mapped[float] = mapped_column(nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True, default=None)

    expense_date: Mapped[date] = mapped_column(Date, nullable=False)

    vehicle: Mapped[Vehicle] = relationship(back_populates="expenses")
    trip: Mapped[Trip | None] = relationship(back_populates="expenses")