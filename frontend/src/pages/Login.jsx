import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Terminal, Key, User, AlertCircle, RefreshCw } from 'lucide-react';

const Login = () => {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  
  const { login, user, error, setError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Clear global auth errors when entering the page
    setError(null);
    if (user) {
      navigate('/');
    }
  }, [user, navigate, setError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emailOrUsername || !password) {
      setFormError('Please input credentials');
      return;
    }

    try {
      setFormError('');
      setLoading(true);
      await login(emailOrUsername, password);
      navigate('/');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center">
      <div className="w-full max-w-md cyber-glass p-8 rounded-lg border border-cyber-border relative overflow-hidden shadow-neon-blue">
        <div className="absolute top-0 left-0 w-full h-[3px] bg-cyber-blue shadow-neon-blue animate-pulse" />
        
        {/* Terminal Header */}
        <div className="flex items-center justify-center flex-col space-y-2 mb-8">
          <Shield className="h-12 w-12 text-cyber-blue glow-text-blue" />
          <h2 className="text-xl font-black text-cyber-text tracking-widest uppercase">
            PHISHQUEST TERMINAL
          </h2>
          <p className="text-[10px] text-cyber-muted tracking-widest font-mono">
            SYS_AUTH: AUTHORIZATION REQUIRED
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-sm">
          <div>
            <label className="block text-xs font-semibold text-cyber-muted mb-1.5 uppercase tracking-wider flex items-center">
              <User className="h-3 w-3 mr-1 text-cyber-blue" />
              IDENTIFIER (USERNAME OR EMAIL)
            </label>
            <input
              type="text"
              required
              placeholder="operator@phishquest.net"
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
              className="w-full bg-cyber-dark border border-cyber-border rounded px-3 py-2 text-cyber-text focus:outline-none focus:border-cyber-blue transition text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-cyber-muted mb-1.5 uppercase tracking-wider flex items-center">
              <Key className="h-3 w-3 mr-1 text-cyber-blue" />
              AUTHENTICATION KEY (PASSWORD)
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-cyber-dark border border-cyber-border rounded px-3 py-2 text-cyber-text focus:outline-none focus:border-cyber-blue transition text-xs font-mono"
            />
          </div>

          {(formError || error) && (
            <div className="flex items-center text-xs text-cyber-red bg-cyber-red/10 border border-cyber-red/30 p-3 rounded font-mono">
              <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>{formError || error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyber-blue text-cyber-dark font-black tracking-widest py-2.5 rounded hover:bg-cyber-blue/90 transition shadow-neon-blue flex items-center justify-center disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                VERIFYING...
              </>
            ) : (
              "CONNECT GATEWAY"
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-cyber-muted font-mono border-t border-cyber-border/40 pt-4">
          <span>First deployment? </span>
          <Link to="/register" className="text-cyber-blue hover:underline">
            Register Agent Profile
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Login;
