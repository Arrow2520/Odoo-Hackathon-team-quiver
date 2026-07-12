import { useState } from 'react';
import { MAINTENANCE_STATUS, STATUS_LABELS } from '../../utils/constants';

export const MaintenanceForm = ({ onSubmit, availableVehicles }) => {
  const [formData, setFormData] = useState({
    vehicleId: '',
    serviceType: '',
    cost: '',
    date: new Date().toISOString().split('T')[0],
    status: MAINTENANCE_STATUS.ACTIVE
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'cost' ? (value ? Number(value) : '') : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newRecord = {
      ...formData,
      id: `M${Date.now()}`
    };
    onSubmit(newRecord);
    
    // Reset form
    setFormData({
      vehicleId: '',
      serviceType: '',
      cost: '',
      date: new Date().toISOString().split('T')[0],
      status: MAINTENANCE_STATUS.ACTIVE
    });
  };

  return (
    <div className="card">
      <h3 className="mb-4">Create Maintenance Record</h3>
      <form onSubmit={handleSubmit} className="form-container">
        
        <div className="input-group">
          <label>VEHICLE</label>
          <select 
            className="input" 
            name="vehicleId" 
            value={formData.vehicleId} 
            onChange={handleChange}
            required
          >
            <option value="">Select a vehicle</option>
            {availableVehicles.map(v => (
              <option key={v.id} value={v.id}>{v.name} ({v.id})</option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label>SERVICE TYPE</label>
          <input
            className="input"
            name="serviceType"
            value={formData.serviceType}
            onChange={handleChange}
            required
            placeholder="e.g., Oil Change"
          />
        </div>

        <div className="input-group">
          <label>COST</label>
          <input
            type="number"
            className="input"
            name="cost"
            value={formData.cost}
            onChange={handleChange}
            required
            min="0"
          />
        </div>

        <div className="flex gap-4">
          <div className="input-group" style={{ flex: 1 }}>
            <label>DATE</label>
            <input
              type="date"
              className="input"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>
          <div className="input-group" style={{ flex: 1 }}>
            <label>STATUS</label>
            <select 
              className="input" 
              name="status" 
              value={formData.status} 
              onChange={handleChange}
            >
              {Object.values(MAINTENANCE_STATUS).map(s => <option key={s} value={s}>{STATUS_LABELS[s] || s}</option>)}
            </select>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <button type="submit" className="btn-primary w-full">Save</button>
        </div>
      </form>
    </div>
  );
};
