// src/utils/constants.js
export const PERMISSIONS = {
  'fleet_manager':     { fleet: 'full', drivers: 'full', trips: 'none', fuelExp: 'none', analytics: 'full' },
  'driver':            { fleet: 'view', drivers: 'none', trips: 'full', fuelExp: 'none', analytics: 'none' },
  'safety_officer':    { fleet: 'none', drivers: 'full', trips: 'view', fuelExp: 'none', analytics: 'none' },
  'financial_analyst': { fleet: 'view', drivers: 'none', trips: 'none', fuelExp: 'full', analytics: 'full' },
};
// Keep your existing VEHICLE_STATUS, DRIVER_STATUS, etc. below this
// Status Enums
export const VEHICLE_STATUS = {
  AVAILABLE: 'Available',
  ON_TRIP: 'On Trip',
  IN_SHOP: 'In Shop',
  RETIRED: 'Retired',
};

export const DRIVER_STATUS = {
  AVAILABLE: 'Available',
  ON_TRIP: 'On Trip',
  OFF_DUTY: 'Off Duty',
  SUSPENDED: 'Suspended',
};

export const TRIP_STATUS = {
  DRAFT: 'Draft',
  DISPATCHED: 'Dispatched',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export const MAINTENANCE_STATUS = {
  ACTIVE: 'Active',
  COMPLETED: 'Completed',
};
