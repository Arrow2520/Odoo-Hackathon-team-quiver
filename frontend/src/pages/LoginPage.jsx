import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './LoginPage.css';

export const LoginPage = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('fleet_manager');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    let result;
    if (isRegistering) {
      result = await register({ 
        email, 
        password, 
        role, 
        full_name: fullName 
      });
    } else {
      result = await login(email, password);
    }
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="login-brand">
          <div className="login-logo-placeholder"></div>
          <h1>TransitOps</h1>
          <p className="tagline">Smart Transport Operations Platform</p>
        </div>
        
        <div className="login-roles-info mt-6 text-muted">
          <p>No more spreadsheets. Manage fleets, dispatch trips, and track maintenance all in one place.</p>
        </div>
      </div>
      
      <div className="login-right">
        <div className="login-form-container">
          <h2>{isRegistering ? 'Create Account' : 'Welcome Back'}</h2>
          <p className="text-muted mb-6">
            {isRegistering ? 'Register to manage your fleet operations.' : 'Sign in to access your dashboard.'}
          </p>
          
          {error && <div className="error-box mb-4">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            {isRegistering && (
              <>
                <div className="input-group">
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    className="input" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="input-group">
                  <label>System Role</label>
                  <select 
                    className="input" 
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="fleet_manager">Fleet Manager</option>
                    <option value="driver">Driver / Dispatcher</option>
                    <option value="safety_officer">Safety Officer</option>
                    <option value="financial_analyst">Financial Analyst</option>
                  </select>
                </div>
              </>
            )}

            <div className="input-group">
              <label>Work Email</label>
              <input 
                type="email" 
                className="input" 
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength="6"
              />
            </div>
            
            <button type="submit" className="btn-primary login-btn" disabled={loading}>
              {loading ? 'Processing...' : (isRegistering ? 'Register & Sign In' : 'Sign In')}
            </button>
          </form>

          <div className="text-center mt-4">
            <span className="text-muted">
              {isRegistering ? 'Already have an account? ' : 'Need an account? '}
            </span>
            <button 
              type="button" 
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError('');
              }} 
              style={{ background: 'none', border: 'none', color: 'var(--status-on-trip)', cursor: 'pointer', fontWeight: 600 }}
            >
              {isRegistering ? 'Sign In' : 'Register'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};