import { createContext, useState, useEffect } from 'react';
import { initialUsers, initializeStorage } from '../services/seedData';
import { PERMISSIONS } from '../utils/constants';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeStorage();
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const foundUser = users.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
      const { password, ...userWithoutPassword } = foundUser;
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      setUser(userWithoutPassword);
      return { success: true };
    }
    return { success: false, message: 'Invalid credentials' };
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    setUser(null);
  };

  const hasPermission = (module, action = 'view') => {
    if (!user || !user.role) return false;
    const rolePerms = PERMISSIONS[user.role];
    if (!rolePerms || !rolePerms[module]) return false;
    
    if (action === 'full') {
      return rolePerms[module] === 'full';
    }
    
    return rolePerms[module] === 'full' || rolePerms[module] === 'view';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};
