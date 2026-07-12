import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { FleetPage } from './pages/FleetPage';
import { DriversPage } from './pages/DriversPage';
import { TripsPage } from './pages/TripsPage';
import { MaintenancePage } from './pages/MaintenancePage';
import { FuelExpensesPage } from './pages/FuelExpensesPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { useAuth } from './hooks/useAuth';

// Protected Route Component for RBAC
const ProtectedRoute = ({ children, module }) => {
  const { hasPermission } = useAuth();
  
  if (!hasPermission(module)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            
            <Route path="/fleet" element={
              <ProtectedRoute module="fleet">
                <FleetPage />
              </ProtectedRoute>
            } />
            
            <Route path="/drivers" element={
              <ProtectedRoute module="drivers">
                <DriversPage />
              </ProtectedRoute>
            } />
            
            <Route path="/trips" element={
              <ProtectedRoute module="trips">
                <TripsPage />
              </ProtectedRoute>
            } />
            
            <Route path="/maintenance" element={
              <ProtectedRoute module="fleet">
                <MaintenancePage />
              </ProtectedRoute>
            } />
            
            <Route path="/expenses" element={
              <ProtectedRoute module="fuelExp">
                <FuelExpensesPage />
              </ProtectedRoute>
            } />
            
            <Route path="/analytics" element={
              <ProtectedRoute module="analytics">
                <AnalyticsPage />
              </ProtectedRoute>
            } />
            
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
