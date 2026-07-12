// src/utils/constants.js
export const PERMISSIONS = {
  'fleet_manager':     { fleet: 'full', drivers: 'full', trips: 'none', fuelExp: 'none', analytics: 'full' },
  'driver':            { fleet: 'view', drivers: 'none', trips: 'full', fuelExp: 'none', analytics: 'none' },
  'safety_officer':    { fleet: 'none', drivers: 'full', trips: 'view', fuelExp: 'none', analytics: 'none' },
  'financial_analyst': { fleet: 'view', drivers: 'none', trips: 'none', fuelExp: 'full', analytics: 'full' },
};

// Status Enums -- values MUST match the backend's enums.py exactly (all-caps),
// since these are used both as API payload values AND for equality checks
// against API responses (e.g. `vehicle.status === VEHICLE_STATUS.AVAILABLE`).
// Do NOT put display text here -- use STATUS_LABELS below for that.
export const VEHICLE_STATUS = {
  AVAILABLE: 'AVAILABLE',
  ON_TRIP: 'ON_TRIP',
  IN_SHOP: 'IN_SHOP',
  RETIRED: 'RETIRED',
};

export const DRIVER_STATUS = {
  AVAILABLE: 'AVAILABLE',
  ON_TRIP: 'ON_TRIP',
  OFF_DUTY: 'OFF_DUTY',
  SUSPENDED: 'SUSPENDED',
};

export const TRIP_STATUS = {
  DRAFT: 'DRAFT',
  DISPATCHED: 'DISPATCHED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

export const MAINTENANCE_STATUS = {
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
};

// Human-readable labels for display only (dropdown option text, etc).
// Use STATUS_LABELS[status] to render; never use these for comparisons.
export const STATUS_LABELS = {
  AVAILABLE: 'Available',
  ON_TRIP: 'On Trip',
  IN_SHOP: 'In Shop',
  RETIRED: 'Retired',
  OFF_DUTY: 'Off Duty',
  SUSPENDED: 'Suspended',
  DRAFT: 'Draft',
  DISPATCHED: 'Dispatched',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  ACTIVE: 'Active',
};
