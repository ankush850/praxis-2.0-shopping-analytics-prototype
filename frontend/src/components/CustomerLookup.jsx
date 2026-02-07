import React from 'react';
import axios from 'axios';
import './CustomerLookup.css';

const API_BASE = '/api';

export default function CustomerLookup() {
  const [idInput, setIdInput] = React.useState('');
  const [profile, setProfile] = React.useState(null);
  const [message, setMessage] = React.useState(null);
  const [isBusy, setIsBusy] = React.useState(false);

  const resetState = () => {
    setProfile(null);
    setMessage(null);
  };

  const requestCustomer = async () => {
    if (!idInput) return;

    setIsBusy(true);
    resetState();

    try {
      const response = await axios.get(`${API_BASE}/customer/${idInput}`);
      setProfile(response.data);
    } catch {
      setMessage(`No customer records found for ID #${idInput}`);
    } finally {
      setIsBusy(false);
    }
  };

  const onKeyDown = (evt) => {
    if (evt.key === 'Enter') {
      requestCustomer();
    }
  };

  return (
    <div className="customer-lookup">
      <div className="lookup-container">
        <div className="card search-panel">
          <h3 style={{ marginBottom: '16px' }}>Identify Customer</h3>

          <div className="input-group">
            <input
              className="search-input"
              type="number"
              value={idInput}
              placeholder="Enter unique Customer ID (e.g. 1-3900)"
              onChange={(e) => setIdInput(e.target.value)}
              onKeyPress={onKeyDown}
            />
            <button
              className="btn btn-primary"
              disabled={isBusy}
              onClick={requestCustomer}
            >
              {isBusy ? 'Searching...' : 'Retrieve Profile'}
            </button>
          </div>

          {message && (
            <p
              style={{
                color: '#ef4444',
                marginTop: '16px',
                fontSize: '0.875rem'
              }}
            >
              {message}
            </p>
          )}
        </div>

        {profile && (
          <div className="card profile-card">
            <div className="profile-header">
              <div className="avatar-circle">
                {profile.gender === 'Male' ? 'M' : 'F'}
              </div>

              <div className="profile-info">
                <h3>Customer #{profile.id}</h3>
                <p>
                  {profile.location} &bull; {profile.age} years old
                </p>
              </div>
            </div>

            <div className="profile-details">
              <div className="detail-section">
                <h4>Behavioral Analytics</h4>

                <div className="detail-item">
                  <span className="detail-label">Assigned Segment</span>
                  <span className="segment-badge">
                    {profile.segment || 'Pending Analysis'}
                  </span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">RFM Loyalty Score</span>
                  <span className="score-badge">
                    {profile.rfm_score || '0'} / 100
                  </span>
                </div>
              </div>

              <div className="detail-section">
                <h4>Transactional History</h4>

                <div className="detail-item">
                  <span className="detail-label">Recent Purchase</span>
                  <span className="detail-value">
                    {profile.recent_purchase || 'None'}
                  </span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Total Expenditure</span>
                  <span
                    className="detail-value"
                    style={{ color: '#10b981' }}
                  >
                    $
                    {profile.total_spent
                      ? profile.total_spent.toLocaleString()
                      : '0.00'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
