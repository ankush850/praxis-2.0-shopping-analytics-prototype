import React, { useState } from 'react';
import axios from 'axios';
import './AffinityAnalysis.css';

const API_BASE = '/api';

const AffinityAnalysis = () => {
  const [category, setCategory] = useState('Clothing');
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAffinity = async () => {
    if (!category.trim()) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/affinity/${category}`);
      setRules(res.data);
    } catch (error) {
      console.error("Error fetching affinity rules", error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') fetchAffinity();
  };

  return (
    <div className="affinity-analysis">
      <div className="search-container">
        <div className="search-header">
          <h3>Market Basket Discovery</h3>
          <p>Analyze associations between product categories, seasons, and customer attributes.</p>
        </div>
        <div className="input-group">
          <input 
            type="text" 
            className="search-input"
            value={category} 
            onChange={(e) => setCategory(e.target.value)} 
            onKeyPress={handleKeyPress}
            placeholder="Search by category, season, or gender..."
          />
          <button className="btn btn-primary" onClick={fetchAffinity} disabled={loading}>
            {loading ? 'Processing...' : 'Analyze Patterns'}
          </button>
        </div>
      </div>

      <div className="card results-card">
        {rules.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Pattern Antecedents</th>
                <th>Likely Consequents</th>
                <th>Lift Score</th>
                <th>Confidence Level</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 500 }}>{rule.antecedents}</td>
                  <td style={{ color: 'var(--primary-color)', fontWeight: 600 }}>{rule.consequents}</td>
                  <td>
                    <span className="badge badge-lift">
                      {rule.lift.toFixed(2)}x Stronger
                    </span>
                  </td>
                  <td style={{ width: '200px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>{(rule.confidence * 100).toFixed(0)}%</span>
                    </div>
                    <div className="confidence-bar">
                      <div className="confidence-fill" style={{ width: `${rule.confidence * 100}%` }}></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <svg style={{ width: '48px', height: '48px', margin: '0 auto 16px', color: '#d1d5db' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p>No associations found for "{category}".</p>
            <p style={{ fontSize: '0.875rem' }}>Try broad terms like 'Clothing', 'Summer', or 'Female'.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AffinityAnalysis;
