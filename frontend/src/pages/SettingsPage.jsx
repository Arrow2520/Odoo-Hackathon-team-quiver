import { useState } from 'react';
import { PERMISSIONS } from '../utils/constants';
import './SettingsPage.css';

export const SettingsPage = () => {
  const [settings, setSettings] = useState({
    depotName: 'Gandhinagar Depot GJ4',
    currency: 'INR (Rs.)',
    distanceUnit: 'Kilometers'
  });

  const handleChange = (e) => {
    setSettings({
      ...settings,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    // Simulate save
    alert('Settings saved successfully!');
  };

  const renderPermissionIcon = (perm) => {
    if (perm === 'full') return <span style={{ color: 'var(--status-available)', fontWeight: 'bold' }}>✓ Full</span>;
    if (perm === 'view') return <span style={{ color: 'var(--status-on-trip)' }}>👁 View</span>;
    return <span style={{ color: 'var(--text-muted)' }}>—</span>;
  };

  return (
    <div className="settings-page-layout">
      {/* Left: General Settings */}
      <div className="settings-left-panel">
        <div className="card">
          <h3 className="mb-4">General Settings</h3>
          <form onSubmit={handleSave} className="form-container">
            <div className="input-group">
              <label>DEPOT NAME</label>
              <input
                className="input"
                name="depotName"
                value={settings.depotName}
                onChange={handleChange}
              />
            </div>
            <div className="input-group">
              <label>CURRENCY</label>
              <input
                className="input"
                name="currency"
                value={settings.currency}
                onChange={handleChange}
              />
            </div>
            <div className="input-group">
              <label>DISTANCE UNIT</label>
              <input
                className="input"
                name="distanceUnit"
                value={settings.distanceUnit}
                onChange={handleChange}
              />
            </div>
            <div className="flex justify-end mt-6">
              <button type="submit" className="btn-primary">Save changes</button>
            </div>
          </form>
        </div>
      </div>

      {/* Right: RBAC Matrix */}
      <div className="settings-right-panel">
        <div className="card">
          <h3 className="mb-4">Role-Based Access (RBAC)</h3>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Fleet</th>
                  <th>Drivers</th>
                  <th>Trips</th>
                  <th>Fuel/Exp.</th>
                  <th>Analytics</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(PERMISSIONS).map(([role, perms]) => (
                  <tr key={role}>
                    <td style={{ fontWeight: 500 }}>{role}</td>
                    <td>{renderPermissionIcon(perms.fleet)}</td>
                    <td>{renderPermissionIcon(perms.drivers)}</td>
                    <td>{renderPermissionIcon(perms.trips)}</td>
                    <td>{renderPermissionIcon(perms.fuelExp)}</td>
                    <td>{renderPermissionIcon(perms.analytics)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-muted text-sm">
            RBAC matrix defines access levels for all platform modules. 
            'Full' allows create/edit/delete, 'View' is read-only, '—' means the module is hidden.
          </p>
        </div>
      </div>
    </div>
  );
};
