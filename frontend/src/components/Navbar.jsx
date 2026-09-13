import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Trophy, Activity, Award, LogOut, Download, AlertTriangle, BookOpen } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? "text-cyber-green border-b-2 border-cyber-green shadow-neon-green" : "text-cyber-muted hover:text-cyber-blue hover:border-b-2 hover:border-cyber-blue";
  };

  return (
    <nav className="border-b border-cyber-border bg-cyber-dark/85 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-cyber-green glow-text-green" />
              <span className="font-extrabold text-xl tracking-wider text-cyber-text glow-text-green">
                PHISH<span className="text-cyber-green">QUEST</span>
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-6 text-sm font-semibold tracking-wide h-16 items-center">
            <Link to="/" className={`px-2 py-5 transition ${isActive('/')}`}>
              DASHBOARD
            </Link>
            <Link to="/games" className={`px-2 py-5 transition ${isActive('/games')}`}>
              TRAINING MODES
            </Link>
            <Link to="/history" className={`px-2 py-5 transition ${isActive('/history')}`}>
              SCAN HISTORY
            </Link>
            <Link to="/ml" className={`px-2 py-5 transition ${isActive('/ml')}`}>
              ML PERFORMANCE
            </Link>
            <Link to="/extension" className={`px-2 py-5 transition ${isActive('/extension')}`}>
              EXTENSION GUIDE
            </Link>
            <Link to="/leaderboard" className={`px-2 py-5 transition ${isActive('/leaderboard')}`}>
              LEADERBOARD
            </Link>
          </div>

          {/* User Profile Summary / HUD */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                {/* HUD Panel */}
                <div className="hidden lg:flex items-center space-x-3 bg-cyber-solid/40 border border-cyber-border px-3 py-1.5 rounded-md">
                  <div className="text-right">
                    <div className="text-xs text-cyber-muted font-bold">LVL {user.level}</div>
                    <div className="text-[10px] text-cyber-green font-extrabold tracking-widest">{user.levelTitle}</div>
                  </div>
                  <div className="h-6 w-px bg-cyber-border" />
                  <div className="text-left">
                    <div className="text-xs text-cyber-muted font-bold">XP</div>
                    <div className="text-xs text-cyber-blue font-bold glow-text-blue">{user.xp}</div>
                  </div>
                  <div className="h-6 w-px bg-cyber-border" />
                  <div className="text-center">
                    <div className="text-xs text-cyber-muted font-bold">STREAK</div>
                    <div className="text-xs text-cyber-purple font-bold">🔥 {user.streak}d</div>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={logout}
                  className="flex items-center text-xs text-cyber-red/80 hover:text-cyber-red border border-cyber-red/30 hover:border-cyber-red px-2.5 py-1.5 rounded transition bg-cyber-red/5 hover:bg-cyber-red/10"
                  title="Logout Session"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  LOGOUT
                </button>
              </div>
            ) : (
              <div className="flex space-x-3">
                <Link
                  to="/login"
                  className="text-xs text-cyber-blue border border-cyber-blue px-3 py-1.5 rounded hover:bg-cyber-blue/10 transition"
                >
                  LOGIN
                </Link>
                <Link
                  to="/register"
                  className="text-xs bg-cyber-green text-cyber-dark font-extrabold px-3 py-1.5 rounded hover:bg-cyber-green/90 transition shadow-neon-green"
                >
                  REGISTER
                </Link>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
