import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import GameDashboard from './pages/GameDashboard';
import SpotTheScam from './pages/SpotTheScam';
import CyberDetective from './pages/CyberDetective';
import BossFight from './pages/BossFight';
import DailyChallenge from './pages/DailyChallenge';
import ModelComparison from './pages/ModelComparison';
import ScanHistory from './pages/ScanHistory';
import Leaderboard from './pages/Leaderboard';
import ExtensionGuide from './pages/ExtensionGuide';

// Private Route Guard Component
const PrivateRoute = ({ children }) => {
  const { token, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cyber-bg text-cyber-green font-mono">
        <div className="text-xs uppercase tracking-widest animate-pulse">
          DECRYPTING SESSION PARAMETERS...
        </div>
      </div>
    );
  }

  return token ? <Layout>{children}</Layout> : <Navigate to="/login" replace />;
};

const AppContent = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Authenticated/Command routes protected by PrivateRoute */}
      <Route path="/" element={
        <PrivateRoute>
          <Dashboard />
        </PrivateRoute>
      } />
      <Route path="/games" element={
        <PrivateRoute>
          <GameDashboard />
        </PrivateRoute>
      } />
      <Route path="/games/spot-the-scam" element={
        <PrivateRoute>
          <SpotTheScam />
        </PrivateRoute>
      } />
      <Route path="/games/cyber-detective" element={
        <PrivateRoute>
          <CyberDetective />
        </PrivateRoute>
      } />
      <Route path="/games/boss-fight" element={
        <PrivateRoute>
          <BossFight />
        </PrivateRoute>
      } />
      <Route path="/games/daily-challenge" element={
        <PrivateRoute>
          <DailyChallenge />
        </PrivateRoute>
      } />
      <Route path="/ml" element={
        <PrivateRoute>
          <ModelComparison />
        </PrivateRoute>
      } />
      <Route path="/history" element={
        <PrivateRoute>
          <ScanHistory />
        </PrivateRoute>
      } />
      <Route path="/leaderboard" element={
        <PrivateRoute>
          <Leaderboard />
        </PrivateRoute>
      } />
      <Route path="/extension" element={
        <PrivateRoute>
          <ExtensionGuide />
        </PrivateRoute>
      } />

      {/* Redirect wildcards */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
