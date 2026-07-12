import { useState } from 'react';
import { DRIVER_STATUS } from '../../utils/constants';

export const DriverForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(
    initialData || {
      id: `D${Date.now()}`,
      name: '',
      license: '',
      category: 'LMV',
      expiry: '',
      contact: '',
      safety: 100,
      status: DRIVER_STATUS.AVAILABLE
    }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'safety' ? Number(value) : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <div className="input-group">
        <label>Driver Name</label>
        <input
          className="input"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="flex gap-4">
        <div className="input-group" style={{ flex: 1 }}>
          <label>License Number</label>
          <input
            className="input"
            name="license"
            value={formData.license}
            onChange={handleChange}
            required
          />
        </div>
        <div className="input-group" style={{ flex: 1 }}>
          <label>Category</label>
          <select className="input" name="category" value={formData.category} onChange={handleChange}>
            <option value="LMV">LMV (Light)</option>
            <option value="HMV">HMV (Heavy)</option>
          </select>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="input-group" style={{ flex: 1 }}>
          <label>Expiry Date</label>
          <input
            type="date"
            className="input"
            name="expiry"
            value={formData.expiry}
            onChange={handleChange}
            required
          />
        </div>
        <div className="input-group" style={{ flex: 1 }}>
          <label>Contact Number</label>
          <input
            className="input"
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      
      <div className="flex gap-4">
        <div className="input-group" style={{ flex: 1 }}>
          <label>Safety Score (%)</label>
          <input
            type="number"
            className="input"
            name="safety"
            value={formData.safety}
            onChange={handleChange}
            min="0"
            max="100"
            required
          />
        </div>
        <div className="input-group" style={{ flex: 1 }}>
          <label>Status</label>
          <select className="input" name="status" value={formData.status} onChange={handleChange}>
            {Object.values(DRIVER_STATUS).map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-between" style={{ marginTop: 'var(--spacing-6)' }}>
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary">Save Driver</button>
      </div>
    </form>
  );
};
