import React from 'react';
import axios from 'axios';
import './AffinityAnalysis.css';

const API_BASE = '/api';

export default function AffinityAnalysis() {
  const [query, updateQuery] = React.useState('Clothing');
  const [data, setData] = React.useState([]);
  const [busy, setBusy] = React.useState(false);

  const loadData = async () => {
    const value = query.trim();
    if (value.length === 0) return;

    setBusy(true);
    try {
      const response = await axios.get(`${API_BASE}/affinity/${value}`);
      setData(response.data);
    } catch (err) {
      console.error('Error fetching affinity rules', err);
    } finally {
      setBusy(false);
    }
  };

  const onKey = (evt) => {
    if (evt.key === 'Enter') {
      loadData();
    }
  };

  const hasResults = data.length > 0;

  return (
    <div className="affinity-analysis">
      <div className="search-container">
        <div className="search-header">
          <h3>Market Basket Discovery</h3>
          <p>Analyze associations between product categories, seasons, and customer attributes.</p>
        </div>

        <div className="input-group">
          <input
            className="search-input"
            type="text"
            value={query}
            placeholder="Search by category, season, or gender..."
            onChange={(e) => updateQuery(e.target.value)}
            onKeyPress={onKey}
          />
          <button
            className="btn btn-primary"
            disabled={busy}
            onClick={loadData}
          >
            {busy ? 'Processing...' : 'Analyze Patterns'}
          </button>
        </div>
      </div>

      <div className="card results-card">
        {hasResults ? (
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
              {data.map((item, index) => {
                const confidencePct = item.confidence * 100;
                return (
                  <tr key={index}>
                    <td style={{ fontWeight: 500 }}>{item.antecedents}</td>
                    <td style={{ color: 'var(--primary-color)', fontWeight: 600 }}>
                      {item.consequents}
                    </td>
                    <td>
                      <span className="badge badge-lift">
                        {item.lift.toFixed(2)}x Stronger
                      </span>
                    </td>
                    <td style={{ width: '200px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span>{confidencePct.toFixed(0)}%</span>
                      </div>
                      <div className="confidence-bar">
                        <div
                          className="confidence-fill"
                          style={{ width: `${confidencePct}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <svg
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              style={{ width: '48px', height: '48px', margin: '0 auto 16px', color: '#d1d5db' }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <p>No associations found for "{query}".</p>
            <p style={{ fontSize: '0.875rem' }}>
              Try broad terms like 'Clothing', 'Summer', or 'Female'.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
