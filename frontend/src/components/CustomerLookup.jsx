import React, { useState } from 'react';
import axios from 'axios';
import './CustomerLookup.css';

const API_BASE = '/api';

const CustomerLookup = () => {
  const [customerId, setCustomerId] = useState('');
  const [customer, setCustomer] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCustomer = async () => {
    if (!customerId) return;
    setLoading(true);
    setError(null);
    setCustomer(null);
    try {
      const res = await axios.get(`${API_BASE}/customer/${customerId}`);
      setCustomer(res.data);
    } catch (err) {
      setError("No customer records found for ID #" + customerId);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') fetchCustomer();
  };

  return (
    <div className="customer-lookup">
      <div className="lookup-container">
        <div className="card search-panel">
          <h3 style={{ marginBottom: '16px' }}>Identify Customer</h3>
          <div className="input-group">
            <input 
              type="number" 
              className="search-input"
              value={customerId} 
              onChange={(e) => setCustomerId(e.target.value)} 
              onKeyPress={handleKeyPress}
              placeholder="Enter unique Customer ID (e.g. 1-3900)"
            />
            <button className="btn btn-primary" onClick={fetchCustomer} disabled={loading}>
              {loading ? 'Searching...' : 'Retrieve Profile'}
            </button>
          </div>
          {error && <p style={{ color: '#ef4444', marginTop: '16px', fontSize: '0.875rem' }}>{error}</p>}
        </div>

        {customer && (
          <div className="card profile-card">
            <div className="profile-header">
              <div className="avatar-circle">
                {customer.gender === 'Male' ? 'M' : 'F'}
              </div>
              <div className="profile-info">
                <h3>Customer #{customer.id}</h3>
                <p>{customer.location} &bull; {customer.age} years old</p>
              </div>
            </div>

            <div className="profile-details">
              <div className="detail-section">
                <h4>Behavioral Analytics</h4>
                <div className="detail-item">
                  <span className="detail-label">Assigned Segment</span>
                  <span className="segment-badge">{customer.segment || 'Pending Analysis'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">RFM Loyalty Score</span>
                  <span className="score-badge">{customer.rfm_score || '0'} / 100</span>
                </div>
              </div>

              <div className="detail-section">
                <h4>Transactional History</h4>
                <div className="detail-item">
                  <span className="detail-label">Recent Purchase</span>
                  <span className="detail-value">{customer.recent_purchase || 'None'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Total Expenditure</span>
                  <span className="detail-value" style={{ color: '#10b981' }}>
                    ${customer.total_spent ? customer.total_spent.toLocaleString() : '0.00'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerLookup;
