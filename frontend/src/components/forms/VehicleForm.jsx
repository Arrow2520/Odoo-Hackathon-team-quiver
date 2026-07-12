import { useState } from 'react';
import { VEHICLE_STATUS, STATUS_LABELS } from '../../utils/constants';

export const VehicleForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(
    initialData || {
      id: '',
      name: '',
      type: 'Van',
      capacity: '',
      odometer: '',
      acqCost: '',
      status: VEHICLE_STATUS.AVAILABLE
    }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['capacity', 'odometer', 'acqCost'].includes(name) ? Number(value) || '' : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <div className="input-group">
        <label>Registration No. (Must be unique)</label>
        <input
          className="input"
          name="id"
          value={formData.id}
          onChange={handleChange}
          required
          disabled={!!initialData} // Cannot change ID on edit
          placeholder="e.g. GJ01AB4521"
        />
      </div>

      <div className="input-group">
        <label>Name / Model</label>
        <input
          className="input"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="e.g. VAN-05"
        />
      </div>

      <div className="flex gap-4">
        <div className="input-group" style={{ flex: 1 }}>
          <label>Type</label>
          <select className="input" name="type" value={formData.type} onChange={handleChange}>
            <option value="Van">Van</option>
            <option value="Truck">Truck</option>
            <option value="Mini">Mini</option>
          </select>
        </div>
        <div className="input-group" style={{ flex: 1 }}>
          <label>Capacity (kg)</label>
          <input
            type="number"
            className="input"
            name="capacity"
            value={formData.capacity}
            onChange={handleChange}
            required
            min="1"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <div className="input-group" style={{ flex: 1 }}>
          <label>Odometer (km)</label>
          <input
            type="number"
            className="input"
            name="odometer"
            value={formData.odometer}
            onChange={handleChange}
            required
            min="0"
          />
        </div>
        <div className="input-group" style={{ flex: 1 }}>
          <label>Acquisition Cost</label>
          <input
            type="number"
            className="input"
            name="acqCost"
            value={formData.acqCost}
            onChange={handleChange}
            required
            min="0"
          />
        </div>
      </div>

      <div className="input-group">
        <label>Status</label>
        <select className="input" name="status" value={formData.status} onChange={handleChange}>
          {Object.values(VEHICLE_STATUS).map(status => (
            <option key={status} value={status}>{STATUS_LABELS[status] || status}</option>
          ))}
        </select>
      </div>

      <div className="flex justify-between" style={{ marginTop: 'var(--spacing-6)' }}>
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary">Save Vehicle</button>
      </div>
    </form>
  );
};
