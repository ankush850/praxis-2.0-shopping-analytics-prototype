import React from 'react';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import './Dashboard.css';

const API_BASE = '/api';

const COLOR_SETS = {
  'theme-indigo': ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f43f5e'],
  'theme-emerald': ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#6366f1', '#8b5cf6', '#ec4899', '#06b6d4'],
  'theme-sunset': ['#f43f5e', '#fbbf24', '#10b981', '#3b82f6', '#8b5cf6', '#6366f1', '#ec4899', '#06b6d4'],
  'theme-midnight': ['#3b82f6', '#6366f1', '#10b981', '#8b5cf6', '#f43f5e', '#ec4899', '#06b6d4', '#1e293b']
};

const Dashboard = ({ currentTheme = 'theme-indigo' }) => {
  const [segmentData, setSegmentData] = React.useState([]);
  const [overview, setOverview] = React.useState(null);
  const [demo, setDemo] = React.useState({ gender: [], age_groups: [] });
  const [regionData, setRegionData] = React.useState([]);
  const [categoryData, setCategoryData] = React.useState([]);
  const [spendBuckets, setSpendBuckets] = React.useState([]);
  const [seasonData, setSeasonData] = React.useState([]);
  const [busy, setBusy] = React.useState(true);
  const [fault, setFault] = React.useState(null);
  const [running, setRunning] = React.useState(false);

  const palette = COLOR_SETS[currentTheme] || COLOR_SETS['theme-indigo'];
  const mainColor = palette[0];

  const loadDashboard = async () => {
    setBusy(true);
    setFault(null);

    try {
      const requests = [
        axios.get(`${API_BASE}/segments`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/dashboard-summary`).catch(() => ({ data: null })),
        axios.get(`${API_BASE}/demographics`).catch(() => ({ data: { gender: [], age_groups: [] } })),
        axios.get(`${API_BASE}/locations`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/categories`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/purchase-dist`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/season-category`).catch(() => ({ data: [] }))
      ];

      const [
        segmentsRes,
        summaryRes,
        demoRes,
        locRes,
        catRes,
        spendRes,
        seasonRes
      ] = await Promise.all(requests);

      setSegmentData(segmentsRes.data);
      setOverview(summaryRes.data);
      setDemo(demoRes.data);
      setRegionData(locRes.data);
      setCategoryData(catRes.data);
      setSpendBuckets(spendRes.data);
      setSeasonData(seasonRes.data);

      if (!summaryRes.data) {
        setFault('Dashboard data is currently unavailable. Ensure the backend server is running.');
      }
    } catch (e) {
      console.error('Dashboard error:', e);
      setFault('Critical connection error. Please refresh or contact support.');
    } finally {
      setBusy(false);
    }
  };

  React.useEffect(() => {
    loadDashboard();
  }, []);

  const startAnalysis = async () => {
    setRunning(true);
    try {
      await axios.post(`${API_BASE}/run-analysis`);
      await loadDashboard();
    } catch {
      alert('ML Analysis failed to initialize.');
    } finally {
      setRunning(false);
    }
  };

  if (busy) {
    return (
      <div className="status-container">
        <div className="spinner" />
        <p>Quantifying shopper metrics...</p>
      </div>
    );
  }

  if (fault) {
    return (
      <div className="status-container">
        <div style={{ color: '#ef4444', fontSize: '3rem', marginBottom: '16px' }}>&times;</div>
        <h3>System Offline</h3>
        <p>{fault}</p>
        <button
          className="btn btn-primary"
          onClick={loadDashboard}
          style={{ marginTop: '20px' }}
        >
          Try Reconnect
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-actions">
        {segmentData.length === 0 && (
          <button
            className="btn btn-primary"
            onClick={startAnalysis}
            disabled={running}
          >
            {running ? 'Processing Clusters...' : 'Initialize ML Segmentation'}
          </button>
        )}
        <button className="btn btn-secondary" onClick={loadDashboard}>
          Refresh Data
        </button>
      </div>

      {overview && (
        <div className="stats-grid">
          <div className="card stat-card">
            <span className="stat-label">Total Reach</span>
            <div className="stat-value" style={{ color: mainColor }}>
              {overview.total_customers.toLocaleString()}
              <span className="stat-unit">Users</span>
            </div>
          </div>

          <div className="card stat-card">
            <span className="stat-label">Average Order</span>
            <div className="stat-value" style={{ color: palette[1] }}>
              <span className="stat-unit">$</span>
              {overview.avg_purchase_amount.toFixed(2)}
            </div>
          </div>

          <div className="card stat-card">
            <span className="stat-label">Satisfaction</span>
            <div className="stat-value" style={{ color: palette[2] }}>
              {overview.avg_rating.toFixed(1)}
              <span className="stat-unit">/ 5.0</span>
            </div>
          </div>

          <div className="card stat-card">
            <span className="stat-label">Active Segments</span>
            <div className="stat-value" style={{ color: palette[4] }}>
              {segmentData.length || '0'}
              <span className="stat-unit">Groups</span>
            </div>
          </div>
        </div>
      )}

      <div className="charts-grid">
        <div className="card chart-card full-width">
          <div className="chart-header">
            <h3>Strategic Customer Segments</h3>
          </div>
          <div className="chart-body">
            {segmentData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={segmentData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="segment_label" axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
                  <Tooltip cursor={{ fill: '#f9fafb' }} />
                  <Bar dataKey="count" fill={mainColor} radius={[6, 6, 0, 0]} barSize={60} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#9ca3af' }}>
                <p>No segmentation data available.</p>
                <button className="btn btn-secondary" onClick={startAnalysis}>
                  Start Cluster Analysis
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="card chart-card">
          <div className="chart-header">
            <h3>Demographic Breakdown</h3>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={demo.gender}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {demo.gender.map((_, i) => (
                    <Cell key={i} fill={palette[i % palette.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card chart-card">
          <div className="chart-header">
            <h3>Age Distribution</h3>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={demo.age_groups}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
                <YAxis hide />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke={palette[1]} fill={palette[1]} fillOpacity={0.2} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card chart-card">
          <div className="chart-header">
            <h3>Category Market Share</h3>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name }) => name}>
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={palette[i % palette.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card chart-card">
          <div className="chart-header">
            <h3>Spending Distribution</h3>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={spendBuckets}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
                <Tooltip />
                <Bar dataKey="count" fill={palette[2]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card chart-card full-width">
          <div className="chart-header">
            <h3>Top Regional Performance</h3>
          </div>
          <div className="chart-body" style={{ height: '400px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionData} layout="vertical" margin={{ left: 40, right: 40 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} tick={{ fill: '#111827', fontWeight: 500 }} />
                <Tooltip />
                <Bar dataKey="value" fill={palette[4]} radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
