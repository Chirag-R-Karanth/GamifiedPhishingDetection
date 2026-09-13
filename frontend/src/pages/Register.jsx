import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Terminal, Key, User, Mail, AlertCircle, RefreshCw } from 'lucide-react';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const { register, user, error, setError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setError(null);
    if (user) {
      navigate('/');
    }
  }, [user, navigate, setError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password || !confirmPassword) {
      setFormError('Please fill in all security protocols');
      return;
    }

    if (password.length < 6) {
      setFormError('Passkeys must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Security codes do not match');
      return;
    }

    try {
      setFormError('');
      setLoading(true);
      await register(username, email, password);
      navigate('/');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center">
      <div className="w-full max-w-md cyber-glass p-8 rounded-lg border border-cyber-border relative overflow-hidden shadow-neon-green">
        <div className="absolute top-0 left-0 w-full h-[3px] bg-cyber-green shadow-neon-green animate-pulse" />

        {/* Terminal Header */}
        <div className="flex items-center justify-center flex-col space-y-2 mb-8">
          <Shield className="h-12 w-12 text-cyber-green glow-text-green" />
          <h2 className="text-xl font-black text-cyber-text tracking-widest uppercase">
            AGENT REGISTRATION
          </h2>
          <p className="text-[10px] text-cyber-muted tracking-widest font-mono">
            SYS_ENROLL: INITIALIZE CYBER THREAT INDEX
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-cyber-muted mb-1 uppercase tracking-wider flex items-center">
              <User className="h-3 w-3 mr-1 text-cyber-green" />
              CODENAME (USERNAME)
            </label>
            <input
              type="text"
              required
              placeholder="e.g. operator_zero"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-cyber-dark border border-cyber-border rounded px-3 py-2 text-cyber-text focus:outline-none focus:border-cyber-green transition text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-cyber-muted mb-1 uppercase tracking-wider flex items-center">
              <Mail className="h-3 w-3 mr-1 text-cyber-green" />
              EMAIL ADDRESS
            </label>
            <input
              type="email"
              required
              placeholder="operator@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-cyber-dark border border-cyber-border rounded px-3 py-2 text-cyber-text focus:outline-none focus:border-cyber-green transition text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-cyber-muted mb-1 uppercase tracking-wider flex items-center">
              <Key className="h-3 w-3 mr-1 text-cyber-green" />
              SECURITY KEY (PASSWORD)
            </label>
            <input
              type="password"
              required
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-cyber-dark border border-cyber-border rounded px-3 py-2 text-cyber-text focus:outline-none focus:border-cyber-green transition text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-cyber-muted mb-1 uppercase tracking-wider flex items-center">
              <Key className="h-3 w-3 mr-1 text-cyber-green" />
              CONFIRM SECURITY KEY
            </label>
            <input
              type="password"
              required
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-cyber-dark border border-cyber-border rounded px-3 py-2 text-cyber-text focus:outline-none focus:border-cyber-green transition text-xs font-mono"
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
            className="w-full bg-cyber-green text-cyber-dark font-black tracking-widest py-2.5 rounded hover:bg-cyber-green/90 transition shadow-neon-green flex items-center justify-center disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ENROLLING CODENAME...
              </>
            ) : (
              "REGISTER PROFILE"
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-cyber-muted font-mono border-t border-cyber-border/40 pt-4">
          <span>Already registered? </span>
          <Link to="/login" className="text-cyber-green hover:underline">
            Connect Secure Gateway
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Register;
