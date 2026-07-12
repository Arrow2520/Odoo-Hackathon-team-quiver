import { useState, useEffect } from 'react';
import { exportToCSV } from '../utils/csvExport';
import './FuelExpensesPage.css';

export const FuelExpensesPage = () => {
  const [fuelLogs, setFuelLogs] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setFuelLogs(JSON.parse(localStorage.getItem('fuelLogs') || '[]'));
    setExpenses(JSON.parse(localStorage.getItem('expenses') || '[]'));
    setVehicles(JSON.parse(localStorage.getItem('vehicles') || '[]'));
    setMaintenance(JSON.parse(localStorage.getItem('maintenance') || '[]'));
    setTrips(JSON.parse(localStorage.getItem('trips') || '[]'));
  };

  const getVehicleName = (id) => {
    const v = vehicles.find(v => v.id === id);
    return v ? v.name : id;
  };

  const getMaintenanceTotal = (vehicleId) => {
    return maintenance
      .filter(m => m.vehicleId === vehicleId)
      .reduce((sum, m) => sum + Number(m.cost), 0);
  };

  const getFuelTotal = (vehicleId) => {
    return fuelLogs
      .filter(f => f.vehicleId === vehicleId)
      .reduce((sum, f) => sum + Number(f.cost), 0);
  };

  const handleExportFuel = () => {
    const data = fuelLogs.map(log => ({
      'Vehicle': getVehicleName(log.vehicleId),
      'Date': log.date,
      'Liters': log.liters,
      'Cost': log.cost
    }));
    exportToCSV(data, ['Vehicle', 'Date', 'Liters', 'Cost'], 'fuel_logs.csv');
  };

  const handleExportExpenses = () => {
    const data = expenses.map(exp => ({
      'Trip': exp.tripId,
      'Vehicle': getVehicleName(exp.vehicleId),
      'Toll': exp.toll,
      'Other': exp.other,
      'Linked Maintenance': getMaintenanceTotal(exp.vehicleId)
    }));
    exportToCSV(data, ['Trip', 'Vehicle', 'Toll', 'Other', 'Linked Maintenance'], 'expenses.csv');
  };

  return (
    <div className="expenses-page-layout">
      <div className="page-header mb-6">
        <h2>Fuel & Expense Management</h2>
      </div>

      <div className="card table-container mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 style={{ margin: 0 }}>FUEL LOGS</h3>
          <div className="flex gap-2">
            <button className="btn-secondary btn-sm" onClick={handleExportFuel}>CSV Export</button>
            <button className="btn-primary btn-sm">+ Add Fuel Log</button>
          </div>
        </div>
        
        <table className="data-table">
          <thead>
            <tr>
              <th>Vehicle</th>
              <th>Date</th>
              <th>Liters</th>
              <th>Cost (Est.)</th>
            </tr>
          </thead>
          <tbody>
            {fuelLogs.map(log => (
              <tr key={log.id}>
                <td>{getVehicleName(log.vehicleId)}</td>
                <td>{log.date}</td>
                <td>{log.liters} L</td>
                <td>{log.cost?.toLocaleString()}</td>
              </tr>
            ))}
            {fuelLogs.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center text-muted py-4">No fuel logs found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="card table-container mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 style={{ margin: 0 }}>OTHER EXPENSES (TOLL / MISC)</h3>
          <div className="flex gap-2">
            <button className="btn-secondary btn-sm" onClick={handleExportExpenses}>CSV Export</button>
            <button className="btn-primary btn-sm">+ Add Expense</button>
          </div>
        </div>
        
        <table className="data-table">
          <thead>
            <tr>
              <th>Trip</th>
              <th>Vehicle</th>
              <th>Toll</th>
              <th>Other</th>
              <th>Maint. (Linked)</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map(exp => (
              <tr key={exp.id}>
                <td>{exp.tripId}</td>
                <td>{getVehicleName(exp.vehicleId)}</td>
                <td>{exp.toll?.toLocaleString() || 0}</td>
                <td>{exp.other?.toLocaleString() || 0}</td>
                <td>{getMaintenanceTotal(exp.vehicleId).toLocaleString()}</td>
              </tr>
            ))}
            {expenses.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center text-muted py-4">No expenses found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="total-cost-note card p-4">
        <strong style={{ color: 'var(--accent-gold)' }}>TOTAL OPERATIONAL COST (AUTO) = FUEL + MAINT + TOLLS + OTHER</strong>
        <p className="mt-2 text-muted" style={{ fontSize: '0.85rem' }}>
          Costs are automatically aggregated per vehicle and utilized in the Analytics dashboard for ROI calculations.
        </p>
      </div>
    </div>
  );
};
