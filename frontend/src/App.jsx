import React, { useState } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import AffinityAnalysis from './components/AffinityAnalysis';
import CustomerLookup from './components/CustomerLookup';

const NavIcon = ({ type }) => {
  switch (type) {
    case 'dashboard':
      return (
        <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      );
    case 'affinity':
      return (
        <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    case 'customer':
      return (
        <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      );
    default:
      return null;
  }
};

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState('theme-indigo');

  const themes = [
    { id: 'theme-indigo', color: '#6366f1', name: 'Ocean' },
    { id: 'theme-emerald', color: '#10b981', name: 'Emerald' },
    { id: 'theme-sunset', color: '#f43f5e', name: 'Sunset' },
    { id: 'theme-midnight', color: '#1e293b', name: 'Midnight' },
  ];

  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Analytics Dashboard';
      case 'affinity': return 'Product Affinity Analysis';
      case 'customer': return 'Customer Intelligence';
      default: return 'Shopper Behavior';
    }
  };

  const getSubtitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Real-time overview of customer segments and purchase trends.';
      case 'affinity': return 'Discover hidden relationships between product categories and demographics.';
      case 'customer': return 'Deep dive into individual customer profiles and behavior scores.';
      default: return '';
    }
  };

  return (
    <div className={`App ${theme}`}>
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>SHOPPER.AI</h1>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} 
            onClick={() => setActiveTab('dashboard')}
          >
            <NavIcon type="dashboard" />
            <span className="nav-text">Dashboard</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'affinity' ? 'active' : ''}`} 
            onClick={() => setActiveTab('affinity')}
          >
            <NavIcon type="affinity" />
            <span className="nav-text">Affinity Analysis</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'customer' ? 'active' : ''}`} 
            onClick={() => setActiveTab('customer')}
          >
            <NavIcon type="customer" />
            <span className="nav-text">Customer Lookup</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          v2.0.0 &copy; 2026 Shopper Insights
        </div>
      </aside>

      <main className="main-content">
        <header className="content-header">
          <div className="header-text">
            <h2>{getTitle()}</h2>
            <p>{getSubtitle()}</p>
          </div>
          <div className="theme-switcher">
            {themes.map(t => (
              <div 
                key={t.id}
                className={`theme-dot ${theme === t.id ? 'active' : ''}`}
                style={{ backgroundColor: t.color }}
                onClick={() => setTheme(t.id)}
                title={t.name}
              />
            ))}
          </div>
        </header>

        <section className="view-container">
          {activeTab === 'dashboard' && <Dashboard currentTheme={theme} />}
          {activeTab === 'affinity' && <AffinityAnalysis />}
          {activeTab === 'customer' && <CustomerLookup />}
        </section>
      </main>
    </div>
  );
}

export default App;
