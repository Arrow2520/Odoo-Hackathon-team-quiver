import { createContext, useState, useEffect } from 'react';
import { PERMISSIONS } from '../utils/constants';
import { apiService } from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('transitops_token');
    const storedUser = localStorage.getItem('currentUser');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Helper to decode JWT token to get the user's role if the backend embeds it
  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  };

  const login = async (email, password, knownRole = null) => {
    try {
      const response = await apiService.auth.login(email, password);
      localStorage.setItem('transitops_token', response.access_token);
      
      const decoded = parseJwt(response.access_token);
      // Use role from token if available, otherwise use the one passed during registration
      const finalRole = decoded?.role || knownRole || 'fleet_manager'; 
      
      const loggedInUser = { email, role: finalRole };
      localStorage.setItem('currentUser', JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message || 'Invalid credentials' };
    }
  };

  const register = async (userData) => {
    try {
      await apiService.auth.register(userData);
      // Automatically log them in after successful registration
      return await login(userData.email, userData.password, userData.role);
    } catch (error) {
      return { success: false, message: error.message || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('transitops_token');
    localStorage.removeItem('currentUser');
    setUser(null);
  };

  const hasPermission = (module, action = 'view') => {
    if (!user || !user.role) return false;
    const rolePerms = PERMISSIONS[user.role];
    if (!rolePerms || !rolePerms[module]) return false;
    if (action === 'full') return rolePerms[module] === 'full';
    return rolePerms[module] === 'full' || rolePerms[module] === 'view';
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};