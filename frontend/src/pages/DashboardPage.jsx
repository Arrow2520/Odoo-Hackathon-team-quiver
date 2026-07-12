import { useState, useEffect } from 'react';
import { KPICard } from '../components/common/KPICard';
import { StatusBadge } from '../components/common/StatusBadge';
import { VEHICLE_STATUS, DRIVER_STATUS, TRIP_STATUS } from '../utils/constants';
import { apiService } from '../services/api';
import './DashboardPage.css';

export const DashboardPage = () => {
  const [stats, setStats] = useState({
    activeVehicles: 0,
    availableVehicles: 0,
    inMaintenance: 0,
    activeTrips: 0,
    pendingTrips: 0,
    driversOnDuty: 0,
    utilization: 0,
  });
  
  const [recentTrips, setRecentTrips] = useState([]);
  const [vehicleDistribution, setVehicleDistribution] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch concurrently from FastAPI
      const [vehicles, drivers, trips] = await Promise.all([
        apiService.vehicles.getAll(),
        apiService.drivers.getAll(),
        apiService.trips.getAll()
      ]);

      // Compute KPIs
      const activeVehicles = vehicles.filter(v => v.status !== VEHICLE_STATUS.RETIRED).length;
      const availableVehicles = vehicles.filter(v => v.status === VEHICLE_STATUS.AVAILABLE).length;
      const inMaintenance = vehicles.filter(v => v.status === VEHICLE_STATUS.IN_SHOP).length;
      const onTripVehicles = vehicles.filter(v => v.status === VEHICLE_STATUS.ON_TRIP).length;
      
      const activeTrips = trips.filter(t => t.status === TRIP_STATUS.DISPATCHED).length;
      const pendingTrips = trips.filter(t => t.status === TRIP_STATUS.DRAFT).length;
      const driversOnDuty = drivers.filter(d => d.status === DRIVER_STATUS.ON_TRIP).length;
      
      const utilization = activeVehicles > 0 ? Math.round((onTripVehicles / activeVehicles) * 100) : 0;

      setStats({
        activeVehicles,
        availableVehicles,
        inMaintenance,
        activeTrips,
        pendingTrips,
        driversOnDuty,
        utilization: `${utilization}%`
      });

      // Join trips with driver and vehicle names for display
      const joinedTrips = trips.slice(0, 5).map(trip => {
        const vehicle = vehicles.find(v => v.id === trip.vehicle_id);
        const driver = drivers.find(d => d.id === trip.driver_id);
        return {
          ...trip,
          vehicleName: vehicle ? `${vehicle.registration_number} (${vehicle.model})` : '—',
          driverName: driver ? driver.name : '—'
        };
      });
      setRecentTrips(joinedTrips);

      // Compute distribution for sidebar
      setVehicleDistribution({
        Available: { count: availableVehicles, percentage: activeVehicles ? (availableVehicles/vehicles.length)*100 : 0, color: 'var(--status-available)' },
        'On Trip': { count: onTripVehicles, percentage: activeVehicles ? (onTripVehicles/vehicles.length)*100 : 0, color: 'var(--status-on-trip)' },
        'In Shop': { count: inMaintenance, percentage: activeVehicles ? (inMaintenance/vehicles.length)*100 : 0, color: 'var(--status-in-shop)' },
        Retired: { count: vehicles.filter(v => v.status === VEHICLE_STATUS.RETIRED).length, percentage: vehicles.length ? (vehicles.filter(v => v.status === VEHICLE_STATUS.RETIRED).length/vehicles.length)*100 : 0, color: 'var(--status-retired)' }
      });
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="card text-center p-6">Loading Dashboard Data...</div>;
  }

  return (
    <div className="dashboard-container">
      {/* ... The rest of your JSX remains exactly the same ... */}
      <div className="filters-row">
        <span className="filters-label">FILTERS</span>
        <select className="input filter-select">
          <option>Vehicle Type: All</option>
        </select>
        <select className="input filter-select">
          <option>Status: All</option>
        </select>
        <select className="input filter-select">
          <option>Region: All</option>
        </select>
      </div>

      <div className="kpis-row">
        <KPICard title="ACTIVE VEHICLES" value={stats.activeVehicles} accentColor="blue" />
        <KPICard title="AVAILABLE VEHICLES" value={stats.availableVehicles} accentColor="green" />
        <KPICard title="VEHICLES IN MAINTENANCE" value={stats.inMaintenance} accentColor="orange" />
        <KPICard title="ACTIVE TRIPS" value={stats.activeTrips} accentColor="blue" />
        <KPICard title="PENDING TRIPS" value={stats.pendingTrips} accentColor="gray" />
        <KPICard title="DRIVERS ON DUTY" value={stats.driversOnDuty} accentColor="blue" />
        <KPICard title="FLEET UTILIZATION" value={stats.utilization} accentColor="green" />
      </div>

      <div className="dashboard-content-grid">
        <div className="recent-trips-section card">
          <h3>RECENT TRIPS</h3>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>TRIP</th>
                  <th>VEHICLE</th>
                  <th>DRIVER</th>
                  <th>STATUS</th>
                  <th>ETA</th>
                </tr>
              </thead>
              <tbody>
                {recentTrips.map(trip => (
                  <tr key={trip.id}>
                    <td>{trip.id}</td>
                    <td>{trip.vehicleName}</td>
                    <td>{trip.driverName}</td>
                    <td><StatusBadge status={trip.status} /></td>
                    <td>{trip.eta}</td>
                  </tr>
                ))}
                {recentTrips.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center text-muted py-4">No recent trips.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="vehicle-status-section card">
          <h3>VEHICLE STATUS</h3>
          <div className="status-bars">
            {Object.entries(vehicleDistribution).map(([status, data]) => (
              <div key={status} className="status-bar-item">
                <div className="status-bar-header">
                  <span>{status}</span>
                </div>
                <div className="status-bar-track">
                  <div 
                    className="status-bar-fill" 
                    style={{ width: `${data.percentage}%`, backgroundColor: data.color }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};