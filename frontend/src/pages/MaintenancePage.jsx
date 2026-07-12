import { useState, useEffect } from 'react';
import { MaintenanceForm } from '../components/forms/MaintenanceForm';
import { StatusBadge } from '../components/common/StatusBadge';
import { VEHICLE_STATUS, MAINTENANCE_STATUS } from '../utils/constants';
import './MaintenancePage.css';

export const MaintenancePage = () => {
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setMaintenanceRecords(JSON.parse(localStorage.getItem('maintenance') || '[]'));
    setVehicles(JSON.parse(localStorage.getItem('vehicles') || '[]'));
  };

  const saveData = (newRecords, newVehicles) => {
    localStorage.setItem('maintenance', JSON.stringify(newRecords));
    localStorage.setItem('vehicles', JSON.stringify(newVehicles));
    setMaintenanceRecords(newRecords);
    setVehicles(newVehicles);
  };

  // Exclude retired vehicles from the dropdown
  const availableVehicles = vehicles.filter(v => v.status !== VEHICLE_STATUS.RETIRED);

  const handleAddRecord = (newRecord) => {
    const updatedRecords = [newRecord, ...maintenanceRecords];
    
    // Auto-update vehicle status based on maintenance status
    const updatedVehicles = vehicles.map(v => {
      if (v.id === newRecord.vehicleId && v.status !== VEHICLE_STATUS.RETIRED) {
        if (newRecord.status === MAINTENANCE_STATUS.ACTIVE) {
          return { ...v, status: VEHICLE_STATUS.IN_SHOP };
        } else if (newRecord.status === MAINTENANCE_STATUS.COMPLETED) {
          // If a maintenance record is created as completed, just ensure the vehicle is available
          // if it was previously in shop (this handles the edge case of creating historical records)
          if (v.status === VEHICLE_STATUS.IN_SHOP) {
             return { ...v, status: VEHICLE_STATUS.AVAILABLE };
          }
        }
      }
      return v;
    });
    
    saveData(updatedRecords, updatedVehicles);
  };

  const handleCloseRecord = (recordId) => {
    const record = maintenanceRecords.find(r => r.id === recordId);
    if (!record) return;
    
    // 1. Update record status
    const updatedRecords = maintenanceRecords.map(r => 
      r.id === recordId ? { ...r, status: MAINTENANCE_STATUS.COMPLETED } : r
    );
    
    // 2. Restore vehicle status (if not retired)
    const updatedVehicles = vehicles.map(v => {
      if (v.id === record.vehicleId && v.status === VEHICLE_STATUS.IN_SHOP) {
        return { ...v, status: VEHICLE_STATUS.AVAILABLE };
      }
      return v;
    });
    
    saveData(updatedRecords, updatedVehicles);
  };

  return (
    <div className="maintenance-page-layout">
      {/* Left Column: Form */}
      <div className="maintenance-left-panel">
        <MaintenanceForm 
          availableVehicles={availableVehicles}
          onSubmit={handleAddRecord}
        />
        
        <div className="status-flow-diagram mt-6 p-6 card">
          <h4 className="mb-4 text-muted">Status Flow Diagram</h4>
          <div className="flow-step">
            <span className="badge badge-available">Available</span>
            <span className="flow-arrow">→</span>
            <span className="flow-text">creating active record</span>
            <span className="flow-arrow">→</span>
            <span className="badge badge-inshop">In Shop</span>
          </div>
          <div className="flow-step mt-4">
            <span className="badge badge-inshop">In Shop</span>
            <span className="flow-arrow">→</span>
            <span className="flow-text">closing record (not retired)</span>
            <span className="flow-arrow">→</span>
            <span className="badge badge-available">Available</span>
          </div>
          <div className="rule-note mt-4" style={{ color: 'var(--text-muted)' }}>
            Note: "In Shop" vehicles are removed from the dispatch pool.
          </div>
        </div>
      </div>
      
      {/* Right Column: Table */}
      <div className="maintenance-right-panel">
        <div className="card table-container">
          <div className="flex justify-between items-center mb-4">
            <h3 style={{ margin: 0 }}>Maintenance Log</h3>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Service Type</th>
                <th>Cost</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {maintenanceRecords.map(r => {
                const vehicle = vehicles.find(v => v.id === r.vehicleId);
                return (
                  <tr key={r.id}>
                    <td>{vehicle ? vehicle.name : r.vehicleId}</td>
                    <td>{r.serviceType}</td>
                    <td>{r.cost.toLocaleString()}</td>
                    <td>{r.date}</td>
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
