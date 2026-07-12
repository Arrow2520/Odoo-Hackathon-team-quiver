import { useState, useEffect } from 'react';
import { VEHICLE_STATUS, DRIVER_STATUS, TRIP_STATUS } from '../../utils/constants';

export const TripForm = ({ onSubmit, onCancel, availableVehicles, availableDrivers }) => {
  const [formData, setFormData] = useState({
    source: '',
    destination: '',
    vehicleId: '',
    driverId: '',
    cargo: '',
    distance: ''
  });
  
  const [validationError, setValidationError] = useState('');

  // Validate cargo weight against vehicle capacity
  useEffect(() => {
    if (formData.vehicleId && formData.cargo) {
      const selectedVehicle = availableVehicles.find(v => v.id === formData.vehicleId);
      if (selectedVehicle && formData.cargo > selectedVehicle.capacity) {
        setValidationError(`Vehicle Capacity: ${selectedVehicle.capacity} kg / Cargo Weight: ${formData.cargo} kg / ✗ Capacity exceeded by ${formData.cargo - selectedVehicle.capacity} kg — dispatch blocked`);
      } else {
        setValidationError('');
      }
    } else {
      setValidationError('');
    }
  }, [formData.vehicleId, formData.cargo, availableVehicles]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['cargo', 'distance'].includes(name) ? (value ? Number(value) : '') : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validationError) return; // Prevent submission if invalid
    
    // Auto-generate ID
    const newTrip = {
      ...formData,
      id: `TR${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      status: TRIP_STATUS.DISPATCHED, // Immediately dispatch
      eta: 'Calculating...'
    };
    
    onSubmit(newTrip);
  };

  return (
    <div className="trip-form-container card">
      <div className="trip-lifecycle">
        <div className="step active">Draft</div>
        <div className="step-line"></div>
        <div className="step pending">Dispatched</div>
        <div className="step-line"></div>
        <div className="step pending">Completed</div>
      </div>

      <form onSubmit={handleSubmit} className="form-container" style={{ marginTop: 'var(--spacing-6)' }}>
        <div className="input-group">
          <label>SOURCE</label>
          <input
            className="input"
            name="source"
            value={formData.source}
            onChange={handleChange}
            required
            placeholder="e.g., Gandhinagar Depot"
          />
        </div>

        <div className="input-group">
          <label>DESTINATION</label>
          <input
            className="input"
            name="destination"
            value={formData.destination}
            onChange={handleChange}
            required
            placeholder="e.g., Ahmedabad Hub"
          />
        </div>

        <div className="input-group">
          <label>VEHICLE (AVAILABLE ONLY)</label>
          <select 
            className="input" 
            name="vehicleId" 
            value={formData.vehicleId} 
            onChange={handleChange}
            required
          >
            <option value="">Select a vehicle</option>
            {availableVehicles.map(v => (
              <option key={v.id} value={v.id}>{v.name} - {v.capacity} kg capacity</option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label>DRIVER (AVAILABLE ONLY)</label>
          <select 
            className="input" 
            name="driverId" 
            value={formData.driverId} 
            onChange={handleChange}
            required
          >
            <option value="">Select a driver</option>
            {availableDrivers.map(d => (
              <option key={d.id} value={d.id}>{d.name} (Safety: {d.safety}%)</option>
            ))}
          </select>
        </div>

        <div className="flex gap-4">
          <div className="input-group" style={{ flex: 1 }}>
            <label>CARGO WEIGHT (KG)</label>
            <input
              type="number"
              className="input"
              name="cargo"
              value={formData.cargo}
              onChange={handleChange}
              required
              min="1"
            />
          </div>
          <div className="input-group" style={{ flex: 1 }}>
            <label>PLANNED DISTANCE (KM)</label>
            <input
              type="number"
              className="input"
              name="distance"
              value={formData.distance}
              onChange={handleChange}
              required
              min="1"
            />
          </div>
        </div>

        {validationError && (
          <div className="validation-error-box mt-4">
            {validationError}
          </div>
        )}

        <div className="flex justify-between mt-6">
          <button type="button" className="btn-secondary" style={{ color: 'var(--error)', borderColor: 'var(--border-color)' }} onClick={onCancel}>
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn-primary" 
            disabled={!!validationError || !formData.vehicleId || !formData.driverId || !formData.source || !formData.destination}
          >
            Dispatch
          </button>
        </div>
      </form>
    </div>
  );
};
