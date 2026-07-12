import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useAuth } from '../../hooks/useAuth';
import './AppLayout.css';

export const AppLayout = () => {
  const { user, loading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  if (loading) {
    return <div className="loading-screen">Loading TransitOps...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-layout">
      <Sidebar isOpen={isSidebarOpen} />
      <div className="main-content-wrapper">
        <TopBar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
