import { useState, useEffect } from 'react';
import { TripForm } from '../components/forms/TripForm';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { VEHICLE_STATUS, DRIVER_STATUS, TRIP_STATUS } from '../utils/constants';
import { apiService } from '../services/api'; // Integrated centralized API client
import './TripsPage.css';

export const TripsPage = () => {
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // For completing a trip
  const [completingTrip, setCompletingTrip] = useState(null);
  const [endOdometer, setEndOdometer] = useState('');
  const [fuelConsumed, setFuelConsumed] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetches live database records concurrently via FastAPI endpoints
      const [tripsData, vehiclesData, driversData] = await Promise.all([
        apiService.trips.getAll(),
        apiService.vehicles.getAll(),
        apiService.drivers.getAll()
      ]);
      setTrips(tripsData);
      setVehicles(vehiclesData);
      setDrivers(driversData);
    } catch (error) {
      console.error("Failed to load operational sync data:", error);
    } finally {
      setLoading(false);
    }
  };

  const isLicenseValid = (expiryDate) => {
    return new Date(expiryDate) > new Date();
  };

  const availableVehicles = vehicles.filter(v => v.status === VEHICLE_STATUS.AVAILABLE);
  const availableDrivers = drivers.filter(d => d.status === DRIVER_STATUS.AVAILABLE && isLicenseValid(d.expiry));

  const handleDispatch = async (newTripData) => {
    try {
      // Dispatches state data mutation to server. Backend triggers automatic status shifts to 'On Trip'
      await apiService.trips.create(newTripData);
      await loadData(); // Atomically updates state lists
    } catch (error) {
      alert(`Dispatch failed: ${error.message}`);
    }
  };

  const handleCancelTrip = async (tripId) => {
    try {
      // API call execution returns asset status states to 'Available'
      await apiService.trips.cancel(tripId);
      await loadData();
    } catch (error) {
      alert(`Cancellation failed: ${error.message}`);
    }
  };

  const handleCompleteTripSubmit = async (e) => {
    e.preventDefault();
    if (!completingTrip) return;
    
    try {
      // Submits concluding criteria, completing lifecycles instantly
      await apiService.trips.complete(completingTrip.id, Number(endOdometer), Number(fuelConsumed) || 0);
      setCompletingTrip(null);
      await loadData();
    } catch (error) {
      alert(`Failed to complete trip cycle: ${error.message}`);
    }
  };

  if (loading) {
    return <div className="card text-center p-6">Syncing lifecycle streams...</div>;
  }

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
            const vehicle = vehicles.find(v => v.id === trip.vehicle_id);
            const driver = drivers.find(d => d.id === trip.driver_id);
            
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
                    {vehicle ? `${vehicle.registration_number} (${vehicle.model})` : 'Unassigned'} / {driver ? driver.name : 'Unassigned'}
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