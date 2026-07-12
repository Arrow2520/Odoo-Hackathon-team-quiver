import { VEHICLE_STATUS, DRIVER_STATUS, TRIP_STATUS, MAINTENANCE_STATUS } from '../utils/constants';

export const initialUsers = [
  { id: 1, email: 'raven.k@transitops.in', password: 'password123', name: 'Raven K.', role: 'Dispatcher' },
  { id: 2, email: 'fleet@transitops.in', password: 'password123', name: 'Arjun M.', role: 'Fleet Manager' },
  { id: 3, email: 'safety@transitops.in', password: 'password123', name: 'Meera S.', role: 'Safety Officer' },
  { id: 4, email: 'finance@transitops.in', password: 'password123', name: 'Tanya D.', role: 'Financial Analyst' },
];

export const initialVehicles = [
  { id: 'GJ01AB4521', name: 'VAN-05', type: 'Van', capacity: 500, odometer: 74000, acqCost: 620000, status: VEHICLE_STATUS.AVAILABLE },
  { id: 'GJ01AB9981', name: 'TRUCK-11', type: 'Truck', capacity: 5000, odometer: 182000, acqCost: 2450000, status: VEHICLE_STATUS.ON_TRIP },
  { id: 'GJ01AB1120', name: 'MINI-03', type: 'Mini', capacity: 1000, odometer: 66000, acqCost: 410000, status: VEHICLE_STATUS.IN_SHOP },
  { id: 'GJ01AB008', name: 'VAN-09', type: 'Van', capacity: 750, odometer: 241900, acqCost: 590000, status: VEHICLE_STATUS.RETIRED },
];

export const initialDrivers = [
  { id: 'D1', name: 'Alex', license: 'DL-88213', category: 'LMV', expiry: '2028-12-01', contact: '98765xxxxx', safety: 96, status: DRIVER_STATUS.AVAILABLE },
  { id: 'D2', name: 'John', license: 'DL-44120', category: 'HMV', expiry: '2025-03-01', contact: '98220xxxxx', safety: 81, status: DRIVER_STATUS.SUSPENDED },
  { id: 'D3', name: 'Priya', license: 'DL-77031', category: 'LMV', expiry: '2027-08-01', contact: '99110xxxxx', safety: 99, status: DRIVER_STATUS.ON_TRIP },
  { id: 'D4', name: 'Suresh', license: 'DL-90045', category: 'HMV', expiry: '2027-01-01', contact: '97440xxxxx', safety: 88, status: DRIVER_STATUS.OFF_DUTY },
];

export const initialTrips = [
  { id: 'TR001', source: 'Gandhinagar Depot', destination: 'Ahmedabad Hub', vehicleId: 'GJ01AB4521', driverId: 'D1', cargo: 450, distance: 38, status: TRIP_STATUS.DISPATCHED, eta: '45 min' },
  { id: 'TR002', source: 'Surat', destination: 'Mumbai', vehicleId: 'GJ01AB9981', driverId: 'D2', cargo: 4000, distance: 280, status: TRIP_STATUS.COMPLETED, eta: '-' },
  { id: 'TR003', source: 'Rajkot', destination: 'Jamnagar', vehicleId: 'GJ01AB1120', driverId: 'D3', cargo: 800, distance: 90, status: TRIP_STATUS.DISPATCHED, eta: '1h 10m' },
  { id: 'TR004', source: 'Vatva Industrial Area', destination: 'Sanand Warehouse', vehicleId: 'GJ01AB9981', driverId: 'D4', cargo: 4000, distance: 45, status: TRIP_STATUS.DRAFT, eta: 'Awaiting vehicle' },
  { id: 'TR006', source: 'Mansa', destination: 'Kalol Depot', vehicleId: '', driverId: '', cargo: 200, distance: 25, status: TRIP_STATUS.CANCELLED, eta: 'Vehicle went to shop' },
];

export const initialMaintenance = [
  { id: 'M1', vehicleId: 'GJ01AB4521', serviceType: 'Oil Change', cost: 2500, date: '2026-07-07', status: MAINTENANCE_STATUS.ACTIVE },
  { id: 'M2', vehicleId: 'GJ01AB9981', serviceType: 'Engine Repair', cost: 18000, date: '2026-06-15', status: MAINTENANCE_STATUS.COMPLETED },
  { id: 'M3', vehicleId: 'GJ01AB1120', serviceType: 'Tyre Replace', cost: 6200, date: '2026-07-10', status: MAINTENANCE_STATUS.ACTIVE },
];

export const initialFuelLogs = [
  { id: 'F1', vehicleId: 'GJ01AB4521', date: '2026-07-05', liters: 42, cost: 4200 },
  { id: 'F2', vehicleId: 'GJ01AB9981', date: '2026-07-06', liters: 110, cost: 11000 },
  { id: 'F3', vehicleId: 'GJ01AB1120', date: '2026-07-06', liters: 28, cost: 2800 },
];

export const initialExpenses = [
  { id: 'E1', tripId: 'TR001', vehicleId: 'GJ01AB4521', toll: 120, other: 0 },
  { id: 'E2', tripId: 'TR002', vehicleId: 'GJ01AB9981', toll: 340, other: 150 },
];

export const initializeStorage = () => {
  if (!localStorage.getItem('users')) localStorage.setItem('users', JSON.stringify(initialUsers));
  if (!localStorage.getItem('vehicles')) localStorage.setItem('vehicles', JSON.stringify(initialVehicles));
  if (!localStorage.getItem('drivers')) localStorage.setItem('drivers', JSON.stringify(initialDrivers));
  if (!localStorage.getItem('trips')) localStorage.setItem('trips', JSON.stringify(initialTrips));
  if (!localStorage.getItem('maintenance')) localStorage.setItem('maintenance', JSON.stringify(initialMaintenance));
  if (!localStorage.getItem('fuelLogs')) localStorage.setItem('fuelLogs', JSON.stringify(initialFuelLogs));
  if (!localStorage.getItem('expenses')) localStorage.setItem('expenses', JSON.stringify(initialExpenses));
};
