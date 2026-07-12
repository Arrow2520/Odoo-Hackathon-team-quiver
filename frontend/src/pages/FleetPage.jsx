import { useState, useEffect } from 'react';
import { Modal } from '../components/common/Modal';
import { VehicleForm } from '../components/forms/VehicleForm';
import { StatusBadge } from '../components/common/StatusBadge';
import { VEHICLE_STATUS } from '../utils/constants';
import './FleetPage.css';

export const FleetPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  
  // Filters
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = () => {
    const data = JSON.parse(localStorage.getItem('vehicles') || '[]');
    setVehicles(data);
  };

  const saveVehicles = (data) => {
    localStorage.setItem('vehicles', JSON.stringify(data));
    setVehicles(data);
  };

  const handleAdd = () => {
    setEditingVehicle(null);
    setIsModalOpen(true);
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setIsModalOpen(true);
  };

  const handleSave = (vehicleData) => {
    let updatedVehicles;
    if (editingVehicle) {
      updatedVehicles = vehicles.map(v => v.id === vehicleData.id ? vehicleData : v);
    } else {
      // Check for duplicate ID
      if (vehicles.some(v => v.id === vehicleData.id)) {
        alert('Registration number must be unique!');
        return;
      }
      updatedVehicles = [...vehicles, vehicleData];
    }
    
    saveVehicles(updatedVehicles);
    setIsModalOpen(false);
  };

  // Filter logic
  const filteredVehicles = vehicles.filter(v => {
    const matchesType = typeFilter === 'All' || v.type === typeFilter;
    const matchesStatus = statusFilter === 'All' || v.status === statusFilter;
    const matchesSearch = v.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          v.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesStatus && matchesSearch;
  });

  return (
    <div className="page-container">
      <div className="page-header flex justify-between items-center">
        <h2>Vehicle Registry</h2>
        <button className="btn-primary" onClick={handleAdd}>+ Add Vehicle</button>
      </div>

      <div className="filters-bar card">
        <div className="flex gap-4">
          <div className="input-group mb-0">
            <select 
              className="input" 
              value={typeFilter} 
              onChange={e => setTypeFilter(e.target.value)}
            >
              <option value="All">Type: All</option>
              <option value="Van">Van</option>
              <option value="Truck">Truck</option>
              <option value="Mini">Mini</option>
            </select>
          </div>
          <div className="input-group mb-0">
            <select 
              className="input" 
              value={statusFilter} 
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="All">Status: All</option>
              {Object.values(VEHICLE_STATUS).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="input-group mb-0" style={{ flex: 1 }}>
            <input 
              type="text" 
              className="input w-full" 
              placeholder="Search reg. no or name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="card table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Reg. No.</th>
              <th>Name / Model</th>
              <th>Type</th>
              <th>Capacity</th>
              <th>Odometer</th>
              <th>Acq. Cost</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVehicles.map(v => (
              <tr key={v.id}>
                <td className="font-mono">{v.id}</td>
                <td>{v.name}</td>
                <td>{v.type}</td>
                <td>{v.capacity.toLocaleString()} kg</td>
                <td>{v.odometer.toLocaleString()}</td>
                <td>{v.acqCost.toLocaleString()}</td>
                <td><StatusBadge status={v.status} /></td>
                <td>
                  <button className="btn-secondary btn-sm" onClick={() => handleEdit(v)}>Edit</button>
                </td>
              </tr>
            ))}
            {filteredVehicles.length === 0 && (
              <tr>
                <td colSpan="8" className="text-center text-muted py-4">No vehicles found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="rule-note mt-4">
        Registration No. must be unique · Retired/In Shop vehicles are hidden from Trip Dispatcher
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}
      >
        <VehicleForm 
          initialData={editingVehicle}
          onSubmit={handleSave}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};
