import { useState, useEffect } from 'react';
import { TripForm } from '../components/forms/TripForm';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { VEHICLE_STATUS, DRIVER_STATUS, TRIP_STATUS } from '../utils/constants';
import './TripsPage.css';

export const TripsPage = () => {
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  
  // For completing a trip
  const [completingTrip, setCompletingTrip] = useState(null);
  const [endOdometer, setEndOdometer] = useState('');
  const [fuelConsumed, setFuelConsumed] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setTrips(JSON.parse(localStorage.getItem('trips') || '[]'));
    setVehicles(JSON.parse(localStorage.getItem('vehicles') || '[]'));
    setDrivers(JSON.parse(localStorage.getItem('drivers') || '[]'));
  };

  const saveData = (newTrips, newVehicles, newDrivers) => {
    localStorage.setItem('trips', JSON.stringify(newTrips));
    localStorage.setItem('vehicles', JSON.stringify(newVehicles));
    localStorage.setItem('drivers', JSON.stringify(newDrivers));
    setTrips(newTrips);
    setVehicles(newVehicles);
    setDrivers(newDrivers);
  };

  // Helper to check if driver has valid license
  const isLicenseValid = (expiryDate) => {
    return new Date(expiryDate) > new Date();
  };

  const availableVehicles = vehicles.filter(v => v.status === VEHICLE_STATUS.AVAILABLE);
  const availableDrivers = drivers.filter(d => d.status === DRIVER_STATUS.AVAILABLE && isLicenseValid(d.expiry));

  const handleDispatch = (newTrip) => {
    // 1. Add new trip
    const updatedTrips = [newTrip, ...trips];
    
    // 2. Update Vehicle Status -> On Trip
    const updatedVehicles = vehicles.map(v => 
      v.id === newTrip.vehicleId ? { ...v, status: VEHICLE_STATUS.ON_TRIP } : v
    );
    
    // 3. Update Driver Status -> On Trip
    const updatedDrivers = drivers.map(d => 
      d.id === newTrip.driverId ? { ...d, status: DRIVER_STATUS.ON_TRIP } : d
    );
    
    saveData(updatedTrips, updatedVehicles, updatedDrivers);
  };

  const handleCancelTrip = (tripId) => {
    const tripToCancel = trips.find(t => t.id === tripId);
    if (!tripToCancel) return;
    
    // 1. Update trip status
    const updatedTrips = trips.map(t => 
      t.id === tripId ? { ...t, status: TRIP_STATUS.CANCELLED, eta: '-' } : t
    );
    
    // 2. Restore vehicle status
    const updatedVehicles = vehicles.map(v => 
      v.id === tripToCancel.vehicleId ? { ...v, status: VEHICLE_STATUS.AVAILABLE } : v
    );
    
    // 3. Restore driver status
    const updatedDrivers = drivers.map(d => 
      d.id === tripToCancel.driverId ? { ...d, status: DRIVER_STATUS.AVAILABLE } : d
    );
    
    saveData(updatedTrips, updatedVehicles, updatedDrivers);
  };

  const handleCompleteTripSubmit = (e) => {
    e.preventDefault();
    if (!completingTrip) return;
    
    // 1. Update trip status
    const updatedTrips = trips.map(t => 
      t.id === completingTrip.id ? { ...t, status: TRIP_STATUS.COMPLETED, eta: '-' } : t
    );
    
    // 2. Restore and update vehicle (odometer)
    const updatedVehicles = vehicles.map(v => 
      v.id === completingTrip.vehicleId ? { 
        ...v, 
        status: VEHICLE_STATUS.AVAILABLE,
        odometer: Number(endOdometer) // Update odometer
      } : v
    );
    
    // 3. Restore driver
    const updatedDrivers = drivers.map(d => 
      d.id === completingTrip.driverId ? { ...d, status: DRIVER_STATUS.AVAILABLE } : d
    );
    
    // 4. Optionally: Auto-generate fuel log (we'll do this simply)
    if (fuelConsumed && Number(fuelConsumed) > 0) {
      const fuelLogs = JSON.parse(localStorage.getItem('fuelLogs') || '[]');
      const newFuelLog = {
        id: `F${Date.now()}`,
        vehicleId: completingTrip.vehicleId,
        date: new Date().toISOString().split('T')[0],
        liters: Number(fuelConsumed),
        cost: Number(fuelConsumed) * 100 // Mock cost
      };
      localStorage.setItem('fuelLogs', JSON.stringify([...fuelLogs, newFuelLog]));
    }
    
    saveData(updatedTrips, updatedVehicles, updatedDrivers);
    setCompletingTrip(null);
  };

  return (
    <div className="trips-page-layout">
      {/* Left Column: Form */}
      <div className="trips-left-panel">
        <h2 className="mb-4">Create Trip</h2>
        <TripForm 
          availableVehicles={availableVehicles}
          availableDrivers={availableDrivers}
          onSubmit={handleDispatch}
          onCancel={() => {}}
        />
        
        <div className="rule-note mt-6" style={{ color: 'var(--text-muted)' }}>
          On Complete: odometer → fuel log → expenses → Vehicle & Driver Available
        </div>
      </div>
      
      {/* Right Column: Live Board */}
      <div className="trips-right-panel">
        <h2 className="mb-4">Live Board</h2>
        
        <div className="trip-cards-container">
          {trips.map(trip => {
            const vehicle = vehicles.find(v => v.id === trip.vehicleId);
            const driver = drivers.find(d => d.id === trip.driverId);
            
            return (
              <div key={trip.id} className="trip-card card">
                <div className="trip-card-header">
                  <span className="trip-id">{trip.id}</span>
                  <StatusBadge status={trip.status} />
                </div>
                
                <div className="trip-route">
                  <span className="route-point">{trip.source || '—'}</span>
                  <span className="route-arrow">→</span>
                  <span className="route-point">{trip.destination || '—'}</span>
                </div>
                
                <div className="trip-details">
                  <div className="trip-asset">
                    {vehicle ? vehicle.name : 'Unassigned'} / {driver ? driver.name : 'Unassigned'}
                  </div>
                  <div className="trip-eta">
                    {trip.eta}
                  </div>
                </div>
                
                {trip.status === TRIP_STATUS.DISPATCHED && (
                  <div className="trip-actions mt-4 flex gap-2">
                    <button 
                      className="btn-primary flex-1" 
                      style={{ padding: '6px', fontSize: '0.85rem' }}
                      onClick={() => {
                        setCompletingTrip(trip);
                        setEndOdometer(vehicle?.odometer ? vehicle.odometer + trip.distance : '');
                        setFuelConsumed('');
                      }}
                    >
                      Complete
                    </button>
                    <button 
                      className="btn-secondary flex-1"
                      style={{ padding: '6px', fontSize: '0.85rem', color: 'var(--error)' }}
                      onClick={() => handleCancelTrip(trip.id)}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          
          {trips.length === 0 && (
            <div className="text-center text-muted p-6 card">No trips available.</div>
          )}
        </div>
      </div>

      {/* Completion Modal */}
      <Modal 
        isOpen={!!completingTrip} 
        onClose={() => setCompletingTrip(null)}
        title="Complete Trip"
      >
        <form onSubmit={handleCompleteTripSubmit} className="form-container">
          <p className="mb-4 text-muted">Please provide closing details for {completingTrip?.id}</p>
          
          <div className="input-group">
            <label>Closing Odometer (km)</label>
            <input
              type="number"
              className="input"
              value={endOdometer}
              onChange={e => setEndOdometer(e.target.value)}
              required
              min="0"
            />
          </div>
          
          <div className="input-group">
            <label>Fuel Consumed on Trip (Liters) - Optional</label>
            <input
              type="number"
              className="input"
              value={fuelConsumed}
              onChange={e => setFuelConsumed(e.target.value)}
              min="0"
            />
          </div>
          
          <div className="flex justify-between mt-6">
            <button type="button" className="btn-secondary" onClick={() => setCompletingTrip(null)}>Cancel</button>
            <button type="submit" className="btn-primary">Complete Trip</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
