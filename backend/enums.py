from enum import Enum

class UserRole(str, Enum):
    FLEET_MANAGER = "fleet_manager"
    DRIVER = "driver"
    SAFETY_OFFICER = "safety_officer"
    FINANCIAL_ANALYST = "financial_analyst"

class VehicleStatus(str, Enum):
    AVAILABLE = "AVAILABLE"
    ON_TRIP = "ON_TRIP"
    IN_SHOP = "IN_SHOP"
    RETIRED = "RETIRED"


class DriverStatus(str, Enum):
    AVAILABLE = "AVAILABLE"
    ON_TRIP = "ON_TRIP"
    OFF_DUTY = "OFF_DUTY"
    SUSPENDED = "SUSPENDED"


class TripStatus(str, Enum):
    DRAFT = "DRAFT"
    DISPATCHED = "DISPATCHED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class MaintenanceStatus(str, Enum):
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"


class ExpenseType(str, Enum):
    FUEL = "FUEL"
    MAINTENANCE = "MAINTENANCE"
    TOLL = "TOLL"
    OTHER = "OTHER"