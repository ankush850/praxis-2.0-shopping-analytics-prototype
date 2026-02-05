import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, AreaChart, Area
} from 'recharts';
import './Dashboard.css';

const API_BASE = '/api';

const THEME_PALETTES = {
  'theme-indigo': ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f43f5e'],
  'theme-emerald': ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#6366f1', '#8b5cf6', '#ec4899', '#06b6d4'],
  'theme-sunset': ['#f43f5e', '#fbbf24', '#10b981', '#3b82f6', '#8b5cf6', '#6366f1', '#ec4899', '#06b6d4'],
  'theme-midnight': ['#3b82f6', '#6366f1', '#10b981', '#8b5cf6', '#f43f5e', '#ec4899', '#06b6d4', '#1e293b']
};

const Dashboard = ({ currentTheme = 'theme-indigo' }) => {
  const [segments, setSegments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [demographics, setDemographics] = useState({ gender: [], age_groups: [] });
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [purchaseDist, setPurchaseDist] = useState([]);
  const [seasonality, setSeasonality] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const COLORS = THEME_PALETTES[currentTheme] || THEME_PALETTES['theme-indigo'];
  const PRIMARY_COLOR = COLORS[0];

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [segRes, sumRes, demoRes, locRes, catRes, distRes, seasonRes] = await Promise.all([
        axios.get(`${API_BASE}/segments`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/dashboard-summary`).catch(() => ({ data: null })),
        axios.get(`${API_BASE}/demographics`).catch(() => ({ data: { gender: [], age_groups: [] } })),
        axios.get(`${API_BASE}/locations`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/categories`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/purchase-dist`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/season-category`).catch(() => ({ data: [] }))
      ]);

      setSegments(segRes.data);
      setSummary(sumRes.data);
      setDemographics(demoRes.data);
      setLocations(locRes.data);
      setCategories(catRes.data);
      setPurchaseDist(distRes.data);
      setSeasonality(seasonRes.data);

      if (!sumRes.data) {
        setError("Dashboard data is currently unavailable. Ensure the backend server is running.");
      }
    } catch (err) {
      console.error("Dashboard error:", err);
      setError("Critical connection error. Please refresh or contact support.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRunAnalysis = async () => {
    setAnalyzing(true);
    try {
      await axios.post(`${API_BASE}/run-analysis`);
      await fetchData();
    } catch (err) {
      alert("ML Analysis failed to initialize.");
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) return (
    <div className="status-container">
      <div className="spinner"></div>
      <p>Quantifying shopper metrics...</p>
    </div>
  );

  if (error) return (
    <div className="status-container">
      <div style={{ color: '#ef4444', fontSize: '3rem', marginBottom: '16px' }}>&times;</div>
      <h3>System Offline</h3>
      <p>{error}</p>
      <button className="btn btn-primary" onClick={fetchData} style={{ marginTop: '20px' }}>Try Reconnect</button>
    </div>
  );

  return (
    <div className="dashboard">
      <div className="dashboard-actions">
        {segments.length === 0 && (
          <button className="btn btn-primary" onClick={handleRunAnalysis} disabled={analyzing}>
            {analyzing ? 'Processing Clusters...' : 'Initialize ML Segmentation'}
          </button>
        )}
        <button className="btn btn-secondary" onClick={fetchData}>Refresh Data</button>
      </div>

      {summary && (
        <div className="stats-grid">
          <div className="card stat-card">
            <span className="stat-label">Total Reach</span>
            <div className="stat-value" style={{ color: PRIMARY_COLOR }}>{summary.total_customers.toLocaleString()}<span className="stat-unit">Users</span></div>
          </div>
          <div className="card stat-card">
            <span className="stat-label">Average Order</span>
            <div className="stat-value" style={{ color: COLORS[1] }}><span className="stat-unit">$</span>{summary.avg_purchase_amount.toFixed(2)}</div>
          </div>
          <div className="card stat-card">
            <span className="stat-label">Satisfaction</span>
            <div className="stat-value" style={{ color: COLORS[2] }}>{summary.avg_rating.toFixed(1)}<span className="stat-unit">/ 5.0</span></div>
          </div>
          <div className="card stat-card">
            <span className="stat-label">Active Segments</span>
            <div className="stat-value" style={{ color: COLORS[4] }}>{segments.length || '0'}<span className="stat-unit">Groups</span></div>
          </div>
        </div>
      )}

      <div className="charts-grid">
        {/* Main Segment Area */}
        <div className="card chart-card full-width">
          <div className="chart-header">
            <h3>Strategic Customer Segments</h3>
          </div>
          <div className="chart-body">
            {segments.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={segments} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="segment_label" axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
                  <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="count" fill="url(#colorBar)" radius={[6, 6, 0, 0]} barSize={60}>
                    <defs>
                      <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={PRIMARY_COLOR} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={PRIMARY_COLOR} stopOpacity={0.3}/>
                      </linearGradient>
                    </defs>
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af' }}>
                <p>No segmentation data available.</p>
                <button className="btn btn-secondary" onClick={handleRunAnalysis}>Start Cluster Analysis</button>
              </div>
            )}
          </div>
        </div>

        {/* Demographics Split */}
        <div className="card chart-card">
          <div className="chart-header">
            <h3>Demographic Breakdown</h3>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={demographics.gender}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {demographics.gender.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
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
              <AreaChart data={demographics.age_groups}>
                <defs>
                  <linearGradient id="colorAge" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
                <YAxis hide />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke={COLORS[1]} fillOpacity={1} fill="url(#colorAge)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories & Spending */}
        <div className="card chart-card">
          <div className="chart-header">
            <h3>Category Market Share</h3>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categories}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name }) => name}
                >
                  {categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
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
              <BarChart data={purchaseDist}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
                <Tooltip />
                <Bar dataKey="count" fill={COLORS[2]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Global Reach */}
        <div className="card chart-card full-width">
          <div className="chart-header">
            <h3>Top Regional Performance</h3>
          </div>
          <div className="chart-body" style={{ height: '400px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={locations} layout="vertical" margin={{ left: 40, right: 40 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} tick={{ fill: '#111827', fontWeight: 500 }} />
                <Tooltip cursor={{ fill: '#f9fafb' }} />
                <Bar dataKey="value" fill={COLORS[4]} radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
