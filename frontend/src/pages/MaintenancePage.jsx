import { useState, useEffect } from 'react';
import { MaintenanceForm } from '../components/forms/MaintenanceForm';
import { StatusBadge } from '../components/common/StatusBadge';
import { VEHICLE_STATUS, MAINTENANCE_STATUS } from '../utils/constants';
import { apiService } from '../services/api';
import './MaintenancePage.css';

export const MaintenancePage = () => {
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [maintData, vehData] = await Promise.all([
        apiService.maintenance.getAll(),
        apiService.vehicles.getAll()
      ]);
      setMaintenanceRecords(maintData);
      setVehicles(vehData);
    } catch (error) {
      console.error("Failed to load maintenance data:", error);
    } finally {
      setLoading(false);
    }
  };

  const availableVehicles = vehicles.filter(v => v.status !== VEHICLE_STATUS.RETIRED);

  const handleAddRecord = async (newRecord) => {
    try {
      await apiService.maintenance.create(newRecord);
      await loadData(); // Refresh to get updated vehicle statuses from backend
    } catch (error) {
      alert(`Failed to create maintenance log: ${error.message}`);
    }
  };

  const handleCloseRecord = async (id) => {
    try {
      await apiService.maintenance.close(id);
      await loadData();
    } catch (error) {
      alert(`Failed to close maintenance log: ${error.message}`);
    }
  };

  if (loading) return <div className="card text-center p-6">Loading maintenance logs...</div>;

  return (
    <div className="maintenance-page-layout">
      <div className="maintenance-left-panel">
        <MaintenanceForm onSubmit={handleAddRecord} availableVehicles={availableVehicles} />
        
        <div className="card mt-6">
          <h4 className="mb-4 text-muted">Workflow Rules</h4>
          <div className="flex-col gap-4">
            <div className="flow-step">
              <span className="badge badge-available">Vehicle Available</span>
              <span className="flow-arrow">→</span>
              <span className="flow-text">Create Record</span>
              <span className="flow-arrow">→</span>
              <span className="badge badge-inshop">Vehicle In Shop</span>
            </div>
            <div className="flow-step">
              <span className="badge badge-inshop">Vehicle In Shop</span>
              <span className="flow-arrow">→</span>
              <span className="flow-text">Close Record</span>
              <span className="flow-arrow">→</span>
              <span className="badge badge-available">Vehicle Available</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="maintenance-right-panel">
        <div className="card h-full">
          <h3 className="mb-4">Maintenance Log</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Service</th>
                <th>Cost (Rs)</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {maintenanceRecords.map(r => {
                const vehicle = vehicles.find(v => v.id === r.vehicle_id);
                return (
                  <tr key={r.id}>
                    <td>{vehicle ? `${vehicle.registration_number} (${vehicle.model})` : r.vehicle_id}</td>
                    <td>{r.service_type}</td>
                    <td>{r.cost.toLocaleString()}</td>
                    <td>{r.opened_at ? new Date(r.opened_at).toLocaleDateString() : '—'}</td>
                    <td>
                      {r.status === MAINTENANCE_STATUS.ACTIVE ? 
                        <span className="badge badge-inshop">In Shop</span> : 
                        <span className="badge badge-completed">Completed</span>
                      }
                    </td>
                    <td>
                      {r.status === MAINTENANCE_STATUS.ACTIVE && (
                        <button 
                          className="btn-primary btn-sm"
                          onClick={() => handleCloseRecord(r.id)}
                        >
                          Close
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {maintenanceRecords.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-4">No maintenance records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};