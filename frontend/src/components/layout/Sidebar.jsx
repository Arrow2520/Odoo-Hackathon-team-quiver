import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  LayoutDashboard, 
  Truck, 
  Users, 
  Map, 
  Wrench, 
  Fuel, 
  BarChart3, 
  Settings 
} from 'lucide-react';
import './Sidebar.css';

export const Sidebar = ({ isOpen }) => {
  const { hasPermission } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, alwaysVisible: true },
    { name: 'Fleet', path: '/fleet', icon: Truck, module: 'fleet' },
    { name: 'Drivers', path: '/drivers', icon: Users, module: 'drivers' },
    { name: 'Trips', path: '/trips', icon: Map, module: 'trips' },
    { name: 'Maintenance', path: '/maintenance', icon: Wrench, module: 'fleet' },
    { name: 'Fuel & Expenses', path: '/expenses', icon: Fuel, module: 'fuelExp' },
    { name: 'Analytics', path: '/analytics', icon: BarChart3, module: 'analytics' },
    { name: 'Settings', path: '/settings', icon: Settings, alwaysVisible: true },
  ];

  return (
    <aside className={`sidebar ${!isOpen ? 'closed' : ''}`}>
      <div className="sidebar-brand">
        <h2>{isOpen ? 'TransitOps' : 'TO'}</h2>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          if (!item.alwaysVisible && !hasPermission(item.module)) {
            return null;
          }
          
          const Icon = item.icon;
          return (
            <NavLink 
              key={item.name} 
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              title={!isOpen ? item.name : ''}
            >
              <Icon size={20} />
              {isOpen && <span>{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};
