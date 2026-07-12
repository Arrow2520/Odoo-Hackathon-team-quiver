import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './LoginPage.css';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Dispatcher');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const result = await login(email, password);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message || 'Failed authentication');
    }
    
    setLoading(false);
  };

  // Pre-fill helper based on role selection
  const handleRoleChange = (e) => {
    const selectedRole = e.target.value;
    setRole(selectedRole);
    
    // Auto-fill for ease of testing based on seed data
    if (selectedRole === 'Dispatcher') setEmail('raven.k@transitops.in');
    if (selectedRole === 'Fleet Manager') setEmail('fleet@transitops.in');
    if (selectedRole === 'Safety Officer') setEmail('safety@transitops.in');
    if (selectedRole === 'Financial Analyst') setEmail('finance@transitops.in');
    setPassword('password123');
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="login-brand">
          <div className="login-logo-placeholder"></div>
          <h1>TransitOps</h1>
          <p className="tagline">Smart Transport Operations Platform</p>
        </div>
        
        <div className="login-roles-info">
          <h3>One login, four roles:</h3>
          <ul>
            <li><span className="dot"></span>Fleet Manager</li>
            <li><span className="dot"></span>Dispatcher</li>
            <li><span className="dot"></span>Safety Officer</li>
            <li><span className="dot"></span>Financial Analyst</li>
          </ul>
        </div>
      </div>
      
      <div className="login-right">
        <div className="login-form-container">
          <h2>Sign in to your account</h2>
          <p className="subtitle">Enter your credentials to continue</p>
          
          {error && (
            <div className="error-box">
              <span className="error-icon">×</span>
              {error}
            </div>
          )}
          
          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label>Role (RBAC Demo)</label>
              <select className="input" value={role} onChange={handleRoleChange}>
                <option value="Dispatcher">Dispatcher</option>
                <option value="Fleet Manager">Fleet Manager</option>
                <option value="Safety Officer">Safety Officer</option>
                <option value="Financial Analyst">Financial Analyst</option>
              </select>
            </div>
            
            <div className="input-group">
              <label>Email</label>
              <input 
                type="email" 
                className="input" 
                placeholder="raven.k@transitops.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="input-group">
              <label>Password</label>
              <input 
                type="password" 
                className="input" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <div className="login-options">
              <label className="checkbox-label">
                <input type="checkbox" defaultChecked />
                <span>Remember me</span>
              </label>
              <a href="#" className="forgot-password">Forgot password?</a>
            </div>
            
            <button 
              type="submit" 
              className="btn-primary login-btn"
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
          
          <div className="rbac-notes">
            <p>Access is scoped by role after login:</p>
            <ul>
              <li>Fleet Manager → Fleet, Maintenance</li>
              <li>Dispatcher → Dashboard, Trips</li>
              <li>Safety Officer → Drivers, Compliance</li>
              <li>Financial Analyst → Fuel & Expenses, Analytics</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
