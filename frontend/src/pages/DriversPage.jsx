import { useState, useEffect } from 'react';
import { Modal } from '../components/common/Modal';
import { DriverForm } from '../components/forms/DriverForm';
import { StatusBadge } from '../components/common/StatusBadge';
import { DRIVER_STATUS } from '../utils/constants';

export const DriversPage = () => {
  const [drivers, setDrivers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = () => {
    const data = JSON.parse(localStorage.getItem('drivers') || '[]');
    setDrivers(data);
  };

  const saveDrivers = (data) => {
    localStorage.setItem('drivers', JSON.stringify(data));
    setDrivers(data);
  };

  const handleAdd = () => {
    setEditingDriver(null);
    setIsModalOpen(true);
  };

  const handleEdit = (driver) => {
    setEditingDriver(driver);
    setIsModalOpen(true);
  };

  const handleSave = (driverData) => {
    let updatedDrivers;
    if (editingDriver) {
      updatedDrivers = drivers.map(d => d.id === driverData.id ? driverData : d);
    } else {
      updatedDrivers = [...drivers, driverData];
    }
    
    saveDrivers(updatedDrivers);
    setIsModalOpen(false);
  };

  // Check license expiry
  const isExpired = (expiryDate) => {
    return new Date(expiryDate) < new Date();
  };

  // Filter logic
  const filteredDrivers = drivers.filter(d => {
    return statusFilter === 'All' || d.status === statusFilter;
  });

  return (
    <div className="page-container">
      <div className="page-header flex justify-between items-center">
        <h2>Drivers & Safety Profiles</h2>
        <button className="btn-primary" onClick={handleAdd}>+ Add Driver</button>
      </div>

      <div className="filters-bar card flex gap-2">
        <button 
          className={`btn-secondary ${statusFilter === 'All' ? 'active-filter' : ''}`}
          onClick={() => setStatusFilter('All')}
        >
          All
        </button>
        {Object.values(DRIVER_STATUS).map(status => (
          <button 
            key={status}
            className={`btn-secondary ${statusFilter === status ? 'active-filter' : ''}`}
            onClick={() => setStatusFilter(status)}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="card table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Driver Name</th>
              <th>License No.</th>
              <th>Category</th>
              <th>Expiry</th>
              <th>Contact</th>
              <th>Safety Score</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDrivers.map(d => {
              const expired = isExpired(d.expiry);
              return (
                <tr key={d.id}>
                  <td className="font-semibold">{d.name}</td>
                  <td className="font-mono">{d.license}</td>
                  <td>{d.category}</td>
                  <td style={{ color: expired ? 'var(--error)' : 'inherit' }}>
                    {d.expiry} {expired && <strong>EXPIRED</strong>}
                  </td>
                  <td>{d.contact}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '50px', height: '6px', backgroundColor: 'var(--bg-input)', borderRadius: '3px' }}>
                        <div style={{ 
                          width: `${d.safety}%`, 
                          height: '100%', 
                          backgroundColor: d.safety > 85 ? 'var(--status-available)' : (d.safety > 70 ? 'var(--status-in-shop)' : 'var(--error)'),
                          borderRadius: '3px'
                        }}></div>
                      </div>
                      <span>{d.safety}%</span>
                    </div>
                  </td>
                  <td><StatusBadge status={d.status} /></td>
                  <td>
                    <button className="btn-secondary btn-sm" onClick={() => handleEdit(d)}>Edit</button>
                  </td>
                </tr>
              );
            })}
            {filteredDrivers.length === 0 && (
              <tr>
                <td colSpan="8" className="text-center text-muted py-4">No drivers found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="rule-note mt-4">
        Expired license or Suspended status → blocked from trip assignment
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingDriver ? "Edit Driver" : "Add New Driver"}
      >
        <DriverForm 
          initialData={editingDriver}
          onSubmit={handleSave}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
      
      {/* Specific inline styles for active filter since we re-use fleet css */}
      <style>{`
        .active-filter {
          background-color: var(--border-color);
          border-color: var(--accent-gold);
          color: var(--accent-gold);
        }
        .font-semibold { font-weight: 600; }
      `}</style>
    </div>
  );
};
