import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { KPICard } from '../components/common/KPICard';
import { apiService } from '../services/api';
import './AnalyticsPage.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export const AnalyticsPage = () => {
  const [stats, setStats] = useState({
    fuelEfficiency: '0 km/l',
    utilization: '0%',
    opCost: '0',
    roi: '0%',
  });

  const [topCostliest, setTopCostliest] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [vehicles, fuelLogs, expenses, maintenance] = await Promise.all([
        apiService.vehicles.getAll(),
        apiService.fuel.getAll(),
        apiService.expenses.getAll(),
        apiService.maintenance.getAll()
      ]);

      // Calculate Operational Cost
      const totalFuelCost = fuelLogs.reduce((sum, f) => sum + Number(f.cost), 0);
      const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || Number(e.toll) || 0), 0);
      const totalMaintCost = maintenance.reduce((sum, m) => sum + Number(m.cost), 0);
      const totalOpCost = totalFuelCost + totalExpenses + totalMaintCost;

      const fuelEfficiency = '8.4 km/l'; // Mocked as per original logic
      
      // Calculate Utilization
      const activeVehicles = vehicles.filter(v => v.status !== 'Retired').length;
      const onTripVehicles = vehicles.filter(v => v.status === 'On Trip').length;
      const utilization = activeVehicles > 0 ? Math.round((onTripVehicles / activeVehicles) * 100) : 0;

      // Calculate ROI (mocked revenue for demo)
      const mockRevenue = totalOpCost * 1.5;
      const totalAcqCost = vehicles.reduce((sum, v) => sum + Number(v.acquisition_cost || v.acqCost), 0);
      const roi = totalAcqCost > 0 ? (((mockRevenue - totalOpCost) / totalAcqCost) * 100).toFixed(1) : 0;

      setStats({
        fuelEfficiency,
        utilization: `${utilization}%`,
        opCost: totalOpCost.toLocaleString(),
        roi: `${roi}%`,
      });

      // Calculate Top Costliest Vehicles
      const vehicleCosts = vehicles.map(v => {
        const vId = v.id;
        const vFuel = fuelLogs.filter(f => (f.vehicle_id || f.vehicleId) === vId).reduce((s, f) => s + Number(f.cost), 0);
        const vExp = expenses.filter(e => (e.vehicle_id || e.vehicleId) === vId).reduce((s, e) => s + (Number(e.amount) || Number(e.toll) || 0), 0);
        const vMaint = maintenance.filter(m => (m.vehicle_id || m.vehicleId) === vId).reduce((s, m) => s + Number(m.cost), 0);
        return {
          name: v.registration_number || v.name,
          cost: vFuel + vExp + vMaint
        };
      }).sort((a, b) => b.cost - a.cost).slice(0, 5);

      setTopCostliest(vehicleCosts);
    } catch (error) {
      console.error("Failed to load analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  const revenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Monthly Revenue',
        data: [12000, 19000, 15000, 22000, 18000, 25000, 31000],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      },
    ],
  };

  const costData = {
    labels: topCostliest.map(v => v.name),
    datasets: [
      {
        label: 'Operational Cost',
        data: topCostliest.map(v => v.cost),
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)', 'rgba(249, 115, 22, 0.8)', 'rgba(59, 130, 246, 0.8)', 
          'rgba(34, 197, 94, 0.8)', 'rgba(168, 85, 247, 0.8)'
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { grid: { color: 'rgba(255, 255, 255, 0.1)' }, ticks: { color: '#94a3b8' } },
      x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
    },
  };

  const horizontalOptions = {
    ...chartOptions,
    indexAxis: 'y',
    scales: {
      x: { grid: { color: 'rgba(255, 255, 255, 0.1)' }, ticks: { color: '#94a3b8' } },
      y: { grid: { display: false }, ticks: { color: '#94a3b8' } },
    }
  };

  if (loading) return <div className="card text-center p-6">Generating Analytics...</div>;

  return (
    <div className="analytics-page-layout">
      <div className="page-header mb-6">
        <h2>Reports & Analytics</h2>
      </div>

      <div className="kpis-row mb-6">
        <KPICard title="FUEL EFFICIENCY" value={stats.fuelEfficiency} accentColor="green" />
        <KPICard title="FLEET UTILIZATION" value={stats.utilization} accentColor="blue" />
        <KPICard title="OPERATIONAL COST" value={stats.opCost} accentColor="orange" />
        <KPICard title="VEHICLE ROI" value={stats.roi} accentColor="green" />
      </div>

      <div className="charts-grid">
        <div className="card chart-container">
          <h3 className="mb-4">MONTHLY REVENUE</h3>
          <div style={{ height: '300px' }}>
            <Bar data={revenueData} options={chartOptions} />
          </div>
        </div>

        <div className="card chart-container">
          <h3 className="mb-4">TOP COSTLIEST VEHICLES</h3>
          <div style={{ height: '300px' }}>
            <Bar data={costData} options={horizontalOptions} />
          </div>
        </div>
      </div>
      
      <div className="rule-note mt-6" style={{ color: 'var(--text-muted)' }}>
        Formula note: ROI = (Revenue − (Maintenance + Fuel + Expenses)) / Acquisition Cost
      </div>
    </div>
  );
};