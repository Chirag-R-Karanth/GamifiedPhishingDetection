import React from 'react';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-cyber-bg relative">
      {/* CRT Scanline styling effect */}
      <div className="crt-overlay" />
      
      {/* Navigation Menu */}
      <Navbar />
      
      {/* Main content body */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {children}
      </main>

      {/* Futuristic footer */}
      <footer className="border-t border-cyber-border py-4 bg-cyber-dark/50 text-center text-[10px] text-cyber-muted tracking-wider">
        PHISHQUEST SYSTEM V1.0.0 // SECURITY TERMINAL ACTIVE // AUTHORIZED PERSONNEL ONLY
      </footer>
    </div>
  );
};

export default Layout;
