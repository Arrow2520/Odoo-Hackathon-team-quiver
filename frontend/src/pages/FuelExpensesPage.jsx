import { useState, useEffect } from 'react';
import { exportToCSV } from '../utils/csvExport';
import { apiService } from '../services/api';
import './FuelExpensesPage.css';

export const FuelExpensesPage = () => {
  const [fuelLogs, setFuelLogs] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch all required data concurrently from the backend
      const [fuelData, expData, vehData, maintData] = await Promise.all([
        apiService.fuel.getAll(),
        apiService.expenses.getAll(),
        apiService.vehicles.getAll(),
        apiService.maintenance.getAll()
      ]);
      setFuelLogs(fuelData);
      setExpenses(expData);
      setVehicles(vehData);
      setMaintenance(maintData);
    } catch (error) {
      console.error("Failed to load expenses data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getVehicleName = (id) => {
    // Assuming backend returns an integer ID, adjust type checking if necessary
    const v = vehicles.find(v => String(v.id) === String(id));
    return v ? v.registration_number || v.name : id;
  };

  const getMaintenanceTotal = (vehicleId) => {
    return maintenance
      .filter(m => String(m.vehicle_id || m.vehicleId) === String(vehicleId))
      .reduce((sum, m) => sum + Number(m.cost), 0);
  };

  const handleExportFuel = () => {
    const data = fuelLogs.map(log => ({
      'Vehicle': getVehicleName(log.vehicle_id || log.vehicleId),
      'Date': log.fuel_date || log.date,
      'Liters': log.liters,
      'Cost': log.cost
    }));
    exportToCSV(data, ['Vehicle', 'Date', 'Liters', 'Cost'], 'fuel_logs.csv');
  };

  const handleExportExpenses = () => {
    const data = expenses.map(exp => ({
      'Trip': exp.trip_id || exp.tripId || '-',
      'Vehicle': getVehicleName(exp.vehicle_id || exp.vehicleId),
      'Amount': exp.amount || exp.toll,
      'Linked Maintenance': getMaintenanceTotal(exp.vehicle_id || exp.vehicleId)
    }));
    exportToCSV(data, ['Trip', 'Vehicle', 'Amount', 'Linked Maintenance'], 'expenses.csv');
  };

  if (loading) return <div className="card text-center p-6">Loading Financial Data...</div>;

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
                <td>{getVehicleName(log.vehicle_id || log.vehicleId)}</td>
                <td>{log.fuel_date || log.date}</td>
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
          <h3 style={{ margin: 0 }}>OTHER EXPENSES (TOLLS / MISC)</h3>
          <div className="flex gap-2">
            <button className="btn-secondary btn-sm" onClick={handleExportExpenses}>CSV Export</button>
          </div>
        </div>
        
        <table className="data-table">
          <thead>
            <tr>
              <th>Trip ID</th>
              <th>Vehicle</th>
              <th>Amount</th>
              <th>Maint. (Linked)</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map(exp => (
              <tr key={exp.id}>
                <td>{exp.trip_id || exp.tripId || 'N/A'}</td>
                <td>{getVehicleName(exp.vehicle_id || exp.vehicleId)}</td>
                <td>{(exp.amount || exp.toll)?.toLocaleString() || 0}</td>
                <td>{getMaintenanceTotal(exp.vehicle_id || exp.vehicleId).toLocaleString()}</td>
              </tr>
            ))}
            {expenses.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center text-muted py-4">No expenses found.</td>
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