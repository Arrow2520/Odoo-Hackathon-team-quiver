import { Search, LogOut, Menu } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import './TopBar.css';

export const TopBar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="menu-toggle-btn" onClick={toggleSidebar}>
          <Menu size={20} />
        </button>
        <div className="search-container">
          <Search className="search-icon" size={18} />
          <input type="text" placeholder="Search..." className="search-input" />
        </div>
      </div>

      <div className="user-section">
        <span className="user-name">{user?.name}</span>
        <div className="role-badge">
          <span>{user?.role}</span>
          <div className="avatar">
            {getInitials(user?.name)}
          </div>
        </div>
        <button className="logout-btn" onClick={logout} title="Logout">
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};
