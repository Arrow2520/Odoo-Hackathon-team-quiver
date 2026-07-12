import { useState, useEffect } from 'react';
import { Modal } from '../components/common/Modal';
import { VehicleForm } from '../components/forms/VehicleForm';
import { StatusBadge } from '../components/common/StatusBadge';
import { VEHICLE_STATUS } from '../utils/constants';
import { apiService } from '../services/api';
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

  const loadVehicles = async () => {
    try {
      const data = await apiService.vehicles.getAll();
      setVehicles(data);
    } catch (error) {
      console.error("Failed to fetch vehicles:", error);
    }
  };

  const handleAdd = () => {
    setEditingVehicle(null);
    setIsModalOpen(true);
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setIsModalOpen(true);
  };

  const handleSave = async (vehicleData) => {
    try {
      if (editingVehicle) {
        // Note: Assuming your FastAPI has a PUT endpoint, we would normally call apiService.vehicles.update here.
        // For the hackathon MVP, if you only have create, you might just do a create or you can add the PUT request to api.js.
        alert("Edit functionality requires the PUT endpoint wired in api.js");
      } else {
        await apiService.vehicles.create(vehicleData);
      }
      
      // Refresh the table from the database
      await loadVehicles();
      setIsModalOpen(false);
    } catch (error) {
      alert(`Failed to save vehicle: ${error.message}`);
    }
  };

  // Filter logic
  const filteredVehicles = vehicles.filter(v => {
    const matchesType = typeFilter === 'All' || v.type === typeFilter;
    const matchesStatus = statusFilter === 'All' || v.status === statusFilter;
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          v.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesStatus && matchesSearch;
  });

  return (
    <div className="page-container">
      <div className="page-header flex justify-between items-center">
        <h2>Fleet Management</h2>
        <button className="btn-primary" onClick={handleAdd}>+ Add Vehicle</button>
      </div>

      <div className="filters-bar card flex justify-between items-center">
        <div className="flex gap-4 items-center">
          <select className="input mb-0" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="All">All Types</option>
            <option value="Van">Van</option>
            <option value="Truck">Truck</option>
            <option value="Mini">Mini</option>
          </select>

          <select className="input mb-0" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All Statuses</option>
            {Object.values(VEHICLE_STATUS).map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
        
        <div>
          <input 
            type="text" 
            className="input mb-0" 
            placeholder="Search ID or Name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="card table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Reg No.</th>
              <th>Name</th>
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