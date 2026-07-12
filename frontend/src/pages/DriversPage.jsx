import { useState, useEffect } from 'react';
import { Modal } from '../components/common/Modal';
import { DriverForm } from '../components/forms/DriverForm';
import { StatusBadge } from '../components/common/StatusBadge';
import { DRIVER_STATUS } from '../utils/constants';
import { apiService } from '../services/api';

export const DriversPage = () => {
  const [drivers, setDrivers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = async () => {
    try {
      setLoading(true);
      const data = await apiService.drivers.getAll();
      setDrivers(data);
    } catch (error) {
      console.error("Failed to fetch drivers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingDriver(null);
    setIsModalOpen(true);
  };

  const handleEdit = (driver) => {
    setEditingDriver(driver);
    setIsModalOpen(true);
  };

  const handleSave = async (driverData) => {
    try {
      if (editingDriver) {
        // Assuming your backend has a PUT route, otherwise handle appropriately
        alert("Edit functionality requires the PUT endpoint wired in api.js");
      } else {
        await apiService.drivers.create(driverData);
      }
      await loadDrivers();
      setIsModalOpen(false);
    } catch (error) {
      alert(`Failed to save driver: ${error.message}`);
    }
  };

  const isLicenseValid = (expiryDate) => {
    return new Date(expiryDate) > new Date();
  };

  const filteredDrivers = drivers.filter(d => 
    statusFilter === 'All' || d.status === statusFilter
  );

  if (loading) return <div className="card text-center p-6">Loading drivers...</div>;

  return (
    <div className="page-container">
      <div className="page-header flex justify-between items-center">
        <h2>Driver Management</h2>
        <button className="btn-primary" onClick={handleAdd}>+ Add Driver</button>
      </div>

      <div className="filters-bar card flex gap-4 items-center">
        <select className="input mb-0" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="All">All Statuses</option>
          {Object.values(DRIVER_STATUS).map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      <div className="card table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>License</th>
              <th>Category</th>
              <th>Expiry</th>
              <th>Safety Score</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDrivers.map(d => {
              const validLicense = isLicenseValid(d.expiry);
              return (
                <tr key={d.id}>
                  <td className="font-mono">{d.id}</td>
                  <td className="font-semibold">{d.name}</td>
                  <td className="font-mono">{d.license}</td>
                  <td>{d.category}</td>
                  <td>
                    <span style={{ color: validLicense ? 'inherit' : 'var(--error)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {d.expiry} {!validLicense && '⚠️'}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div style={{ width: '60px', height: '6px', backgroundColor: 'var(--bg-input)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ 
                          width: `${d.safety}%`, 
                          height: '100%', 
                          backgroundColor: d.safety > 80 ? 'var(--status-available)' : d.safety > 60 ? 'var(--status-in-shop)' : 'var(--error)',
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
    </div>
  );
};