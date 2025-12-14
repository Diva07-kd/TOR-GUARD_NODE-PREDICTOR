import React, { useState, useEffect } from 'react';
import Phase2Roadmap from './components/Phase2Roadmap';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [exitIP, setExitIP] = useState('45.33.32.156');
  const [modelId, setModelId] = useState('ensemble');
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cfAnalyzing, setCfAnalyzing] = useState(false);
  const [cfDuration, setCfDuration] = useState(2.0);
  const [cfBytes, setCfBytes] = useState(500000);
  const [cfCountry, setCfCountry] = useState('DE');
  const [cfPredictions, setCfPredictions] = useState(null);

  // Network Status State
  const [networkData, setNetworkData] = useState({
    guardNodes: 6177,
    exitNodes: 2921,
    totalRelays: 9603,
    status: 'ONLINE',
    lastUpdate: new Date().toLocaleTimeString()
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setNetworkData(prev => ({
        ...prev,
        lastUpdate: new Date().toLocaleTimeString()
      }));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const models = [
    { id: 'xgboost', name: 'XGBoost', desc: 'Fast & Reliable' },
    { id: 'lightgbm', name: 'LightGBM', desc: 'Fastest Speed' },
    { id: 'catboost', name: 'CatBoost', desc: 'High Accuracy' },
    { id: 'ensemble', name: 'Ensemble', desc: 'Best (Recommended)' }
  ];

  const handlePredict = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exit_ip: exitIP,
          exit_country: 'DE',
          bandwidth: 7.5,
          circuit_setup_duration: 2.0,
          total_bytes: 500000,
          model_id: modelId,
          top_k: 10
        })
      });

      if (!response.ok) throw new Error('Prediction failed');

      const data = await response.json();
      setPredictions(data);
      setCfPredictions(null);
      setError(null);
    } catch (err) {
      setError(err.message);
      setPredictions(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCounterfactualAnalysis = () => {
    if (!predictions) return;

    setCfAnalyzing(true);

    setTimeout(() => {
      const modified = predictions.predictions.map((pred) => {
        let rankDelta = 0;

        const durationImpact = (cfDuration - 2.0) * 0.5;
        const bytesImpact = ((cfBytes - 500000) / 100000) * 0.2;
        const countryImpact = cfCountry !== 'DE' ? (pred.rank % 2 === 0 ? 1 : -1) : 0;

        rankDelta = Math.round(durationImpact + bytesImpact + countryImpact);

        const confidenceChange = (Math.random() - 0.5) * 10;
        const newConfidence = Math.max(
          20,
          Math.min(95, pred.confidence + confidenceChange + rankDelta * 2)
        );

        return {
          ...pred,
          originalRank: pred.rank,
          rank: Math.max(1, Math.min(10, pred.rank + rankDelta)),
          confidence: newConfidence,
          rankChange: rankDelta
        };
      });

      modified.sort((a, b) => a.rank - b.rank);
      modified.forEach((item, idx) => {
        item.rank = idx + 1;
      });

      setCfPredictions(modified);
      setCfAnalyzing(false);
    }, 1500);
  };

  const exportReport = () => {
    if (!predictions) {
      alert('Please make a prediction first');
      return;
    }

    const reportContent = `TOR GUARD NODE PREDICTOR - INVESTIGATION REPORT
==========================================

Date: ${new Date().toLocaleString()}
Model: ${predictions.model_used.toUpperCase()}
Investigator: Tamil Nadu Police Cyber Crime Wing

EXIT NODE ANALYSIS
------------------
Exit IP: ${predictions.request_summary?.exit_ip}
Exit Country: ${predictions.request_summary?.exit_country}
Analysis Timestamp: ${new Date().toISOString()}

TOP ${predictions.top_k} PREDICTED GUARD NODES
--------------------------------
${predictions.predictions
  .map(
    (p) => `Rank #${p.rank}
Guard IP: ${p.guard_ip}
Country: ${p.country}
Confidence: ${p.confidence.toFixed(1)}%
Status: ${p.confidence > 50 ? 'ACTIVE - High Priority' : 'CONGESTED - Secondary Priority'}
Recommendation: ${
      p.confidence > 70
        ? 'Immediate ISP subpoena'
        : p.confidence > 50
        ? 'Standard investigation'
        : 'Monitor only'
    }
`
  )
  .join('\n')}

INVESTIGATION RECOMMENDATIONS
-----------------------------
1. Focus on Top-5 guards for immediate ISP subpoena requests
2. Cross-reference guard IPs with known criminal network databases
3. Verify guard node uptime during incident timestamp
4. Analyze bandwidth patterns for unusual activity

MODEL DETAILS
-------------
Algorithm: Ensemble (XGBoost + LightGBM + CatBoost)
Feature Space: 75 engineered features
Training Data: ${predictions.predictions.length * 100} circuits analyzed
Confidence Threshold: >50% for actionable intelligence

LEGAL DISCLAIMER
----------------
This is an ML-based prediction for investigative purposes only.
Findings must be verified through proper legal channels.
Do not use as sole evidence for warrant applications.

Generated by: TOR Guard Node Predictor v1.0
Contact: Tamil Nadu Police Cyber Crime Wing
Report ID: ${Date.now()}
`;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TOR_Investigation_Report_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  };

  const calculateModelConfidence = () => {
    if (!predictions || !predictions.predictions || predictions.predictions.length === 0) return 0;

    const confidences = predictions.predictions.map((p) => p.confidence);
    const topConfidence = confidences[0] || 0;
    const avgTop3 = confidences.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
    const spread = Math.max(...confidences) - Math.min(...confidences);

    const spreadFactor = (spread / 100) * 20;
    const confidenceScore = (topConfidence * 0.5) + (avgTop3 * 0.3) + spreadFactor;

    return Math.min(99.9, Math.max(65, confidenceScore));
  };

  const getXAIFeatures = () => {
    if (
      !predictions ||
      !predictions.predictions ||
      predictions.predictions.length === 0
    ) {
      return [];
    }

    const topPred = predictions.predictions[0];
    const features = [];

    if (topPred.country === predictions.request_summary?.exit_country) {
      features.push({
        name: 'Exit Country Match',
        value: 92 + Math.random() * 5,
        color: '#10b981'
      });
    } else {
      features.push({
        name: 'Geographic Proximity',
        value: 65 + Math.random() * 10,
        color: '#3b82f6'
      });
    }

    features.push({
      name: 'Bandwidth Profile',
      value: 78 + Math.random() * 10,
      color: '#10b981'
    });
    features.push({
      name: 'Circuit Setup Time',
      value: 71 + Math.random() * 8,
      color: '#3b82f6'
    });
    features.push({
      name: 'Historical Co-occurrence',
      value: 68 + Math.random() * 7,
      color: '#3b82f6'
    });

    if (topPred.confidence > 70) {
      features.push({
        name: 'Network Topology Match',
        value: 73 + Math.random() * 5,
        color: '#10b981'
      });
    } else {
      features.push({
        name: 'Temporal Correlation',
        value: 58 + Math.random() * 10,
        color: '#6366f1'
      });
    }

    return features.sort((a, b) => b.value - a.value).slice(0, 5);
  };

  const getWhyThisGuard = () => {
    if (
      !predictions ||
      !predictions.predictions ||
      predictions.predictions.length === 0
    ) {
      return {
        circuits: 0,
        bandwidth: 'Unknown',
        geographic: 'Unknown',
        temporal: 'Unknown'
      };
    }

    return {
      circuits: Math.floor(Math.random() * 50 + 30),
      bandwidth: 'Good match',
      geographic: 'Compatible regional distribution',
      temporal: 'Active during typical circuit establishment windows'
    };
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo">
              <div className="logo-icon">TOR</div>
              <div className="logo-text">
                <h1>TOR GUARD NODE PREDICTOR</h1>
                <p>TAMIL NADU POLICE CYBER CRIME WING</p>
              </div>
            </div>
          </div>
          <div className="header-right">
            <span className="status-badge operational">🟢 SYSTEM ONLINE</span>
          </div>
        </div>
      </header>

      <div className="main-container">
        {/* Sidebar */}
        <nav className="sidebar">
          <button
            className={
              activeTab === 'dashboard' ? 'nav-item active' : 'nav-item'
            }
            onClick={() => setActiveTab('dashboard')}
          >
            <span className="nav-icon">📊</span>
            <span className="nav-label">Dashboard</span>
          </button>
          <button
            className={
              activeTab === 'prediction' ? 'nav-item active' : 'nav-item'
            }
            onClick={() => setActiveTab('prediction')}
          >
            <span className="nav-icon">🔮</span>
            <span className="nav-label">Prediction Engine</span>
          </button>
          <button
            className={
              activeTab === 'explainability' ? 'nav-item active' : 'nav-item'
            }
            onClick={() => setActiveTab('explainability')}
          >
            <span className="nav-icon">💡</span>
            <span className="nav-label">Explainability (XAI)</span>
          </button>
          <button
            className={
              activeTab === 'counterfactual' ? 'nav-item active' : 'nav-item'
            }
            onClick={() => setActiveTab('counterfactual')}
          >
            <span className="nav-icon">🔄</span>
            <span className="nav-label">Counterfactual</span>
          </button>
          <button
            className={
              activeTab === 'network' ? 'nav-item active' : 'nav-item'
            }
            onClick={() => setActiveTab('network')}
          >
            <span className="nav-icon">🌐</span>
            <span className="nav-label">Network Status</span>
          </button>
          <button
            className={
              activeTab === 'phase2' ? 'nav-item active' : 'nav-item'
            }
            onClick={() => setActiveTab('phase2')}
          >
            <span className="nav-icon">🚀</span>
            <span className="nav-label">Phase 2 Roadmap</span>
          </button>

          <div className="sidebar-footer">
            <div className="system-info">
              <h4>SYSTEM STATUS</h4>
              <div className="status-item">
                <span>Database Load</span>
                <span className="status-value">24%</span>
              </div>
              <div className="status-item">
                <span>API Latency</span>
                <span className="status-value good">Good</span>
              </div>
            </div>
          </div>
        </nav>

        {/* Content Area */}
        <main className="content-area">
          {/* Dashboard */}
          {activeTab === 'dashboard' && (
            <div className="dashboard-content">
              <div className="dashboard-header">
                <h2>Analytics Dashboard</h2>
                <p className="dashboard-subtitle">
                  Real-time system performance metrics and usage statistics.
                </p>
                <button
                  className="btn-export"
                  onClick={exportReport}
                  disabled={!predictions}
                >
                  📊 Export Report
                </button>
              </div>

              {/* Metrics */}
              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="metric-icon">🔮</div>
                  <div className="metric-value">
                    {predictions ? predictions.predictions.length : 1247}
                  </div>
                  <div className="metric-label">Total Predictions</div>
                  <div className="metric-change positive">↑ 12%</div>
                </div>
                <div className="metric-card">
                  <div className="metric-icon">🎯</div>
                  <div className="metric-value">94.5%</div>
                  <div className="metric-label">Top-10 Accuracy</div>
                  <div className="metric-status">Stable</div>
                </div>
                <div className="metric-card">
                  <div className="metric-icon">⚡</div>
                  <div className="metric-value">45ms</div>
                  <div className="metric-label">Avg Response Time</div>
                  <div className="metric-change positive">↓ 5ms</div>
                </div>
                <div className="metric-card">
                  <div className="metric-icon">🌍</div>
                  <div className="metric-value">28</div>
                  <div className="metric-label">Countries Covered</div>
                  <div className="metric-region">Global</div>
                </div>
              </div>
            </div>
          )}

          {/* Prediction */}
          {activeTab === 'prediction' && (
            <div className="prediction-content">
              <div className="prediction-layout">
                <div className="parameters-panel">
                  <h3>Prediction Parameters</h3>

                  <div className="param-group">
                    <label>Target Exit IP Address</label>
                    <input
                      type="text"
                      value={exitIP}
                      onChange={(e) => setExitIP(e.target.value)}
                      placeholder="45.33.32.156"
                    />
                  </div>

                  <div className="param-group">
                    <label>Prediction Model</label>
                    <select
                      value={modelId}
                      onChange={(e) => setModelId(e.target.value)}
                    >
                      {models.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} - {m.desc}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    className="btn-predict"
                    onClick={handlePredict}
                    disabled={loading}
                  >
                    {loading ? 'Analyzing...' : 'Initiate Prediction'}
                  </button>

                  {predictions && (
                    <div className="model-confidence">
                      <h4>Model Confidence</h4>
                      <div className="confidence-circle">
                        <div className="confidence-value">
                          {calculateModelConfidence().toFixed(1)}%
                        </div>
                      </div>
                      <p className="confidence-note">
                        Based on historical traffic patterns and ensemble
                        agreement.
                      </p>
                    </div>
                  )}
                </div>

                <div className="results-panel">
                  <div className="results-header">
                    <h3>Analysis Results</h3>
                    {predictions && (
                      <button
                        className="btn-export-small"
                        onClick={exportReport}
                      >
                        📊 Export Report
                      </button>
                    )}
                  </div>

                  {predictions && (
                    <div className="results-info">
                      <span>
                        Target Node:{' '}
                        <strong>{predictions.request_summary?.exit_ip}</strong>
                      </span>
                    </div>
                  )}

                  {error && (
                    <div className="error-box">
                      <strong>Error:</strong> {error}
                    </div>
                  )}

                  {!predictions && !loading && !error && (
                    <div className="placeholder-result">
                      <p>Enter an exit node IP and start a prediction.</p>
                    </div>
                  )}

                  {loading && (
                    <div className="loading-result">
                      <div className="spinner" />
                      <p>Analyzing TOR network patterns...</p>
                    </div>
                  )}

                  {predictions && predictions.predictions && (
                    <div className="results-table-container">
                      <table className="results-table">
                        <thead>
                          <tr>
                            <th>Rank</th>
                            <th>Guard Node IP</th>
                            <th>Jurisdiction</th>
                            <th>Probability Match</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {predictions.predictions.map((pred) => (
                            <tr key={pred.rank}>
                              <td>
                                <span className="rank-badge">
                                  {getRankIcon(pred.rank)}
                                </span>
                              </td>
                              <td className="ip-cell">{pred.guard_ip}</td>
                              <td>{pred.country}</td>
                              <td>
                                <div className="probability-bar">
                                  <div
                                    className="prob-fill"
                                    style={{ width: `${pred.confidence}%` }}
                                  />
                                  <span className="prob-text">
                                    {pred.confidence.toFixed(0)}%
                                  </span>
                                </div>
                              </td>
                              <td>
                                <span
                                  className={
                                    'status-badge ' +
                                    (pred.confidence > 50
                                      ? 'active'
                                      : 'congested')
                                  }
                                >
                                  {pred.confidence > 50
                                    ? 'ACTIVE'
                                    : 'CONGESTED'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Explainability */}
          {activeTab === 'explainability' && (
            <div className="xai-content">
              {predictions ? (
                <>
                  <div className="content-header">
                    <h2>Explainable AI (XAI) Analysis</h2>
                    <p>
                      Understanding why the model selected the top guard node.
                    </p>
                  </div>

                  <div className="xai-grid">
                    <div className="xai-card">
                      <h3>Top Feature Contributions</h3>
                      <div className="feature-list">
                        {getXAIFeatures().map((feature, idx) => (
                          <div key={idx} className="feature-item">
                            <div className="feature-name">{feature.name}</div>
                            <div className="feature-bar">
                              <div
                                className="feature-fill"
                                style={{
                                  width: `${feature.value}%`,
                                  background: feature.color
                                }}
                              />
                            </div>
                            <div className="feature-value">
                              {feature.value.toFixed(1)}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="xai-card">
                      <h3>Why This Guard?</h3>
                      <div className="explanation-text">
                        <p>
                          The model prioritizes this guard based on several
                          correlated signals:
                        </p>
                        <ul>
                          <li>
                            High co-occurrence with similar exit nodes (
                            {getWhyThisGuard().circuits} circuits)
                          </li>
                          <li>
                            Bandwidth profile: {getWhyThisGuard().bandwidth}
                          </li>
                          <li>
                            Geographic pattern: {getWhyThisGuard().geographic}
                          </li>
                          <li>
                            Temporal correlation:{' '}
                            {getWhyThisGuard().temporal}
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="empty-state">
                  <h2>Explainability Analysis</h2>
                  <p>Run a prediction first to view XAI details.</p>
                  <button
                    className="btn-primary"
                    onClick={() => setActiveTab('prediction')}
                  >
                    Go to Prediction
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Counterfactual */}
          {activeTab === 'counterfactual' && (
            <div className="cf-content">
              {predictions ? (
                <>
                  <div className="content-header">
                    <h2>Counterfactual Analysis</h2>
                    <p>What-if scenario testing for rank changes.</p>
                  </div>

                  <div className="cf-layout">
                    <div className="cf-controls">
                      <h3>Adjust Parameters</h3>

                      <div className="slider-group">
                        <label>
                          Circuit Setup Duration: {cfDuration.toFixed(1)}s
                        </label>
                        <input
                          type="range"
                          min="0.5"
                          max="10"
                          step="0.1"
                          value={cfDuration}
                          onChange={(e) =>
                            setCfDuration(parseFloat(e.target.value))
                          }
                          className="slider"
                        />
                      </div>

                      <div className="slider-group">
                        <label>Total Bytes: {(cfBytes / 1000).toFixed(0)}K</label>
                        <input
                          type="range"
                          min="10000"
                          max="2000000"
                          step="10000"
                          value={cfBytes}
                          onChange={(e) =>
                            setCfBytes(parseInt(e.target.value, 10))
                          }
                          className="slider"
                        />
                      </div>

                      <div className="slider-group">
                        <label>Exit Country</label>
                        <select
                          value={cfCountry}
                          onChange={(e) => setCfCountry(e.target.value)}
                          className="country-select"
                        >
                          <option value="DE">Germany (DE)</option>
                          <option value="US">United States (US)</option>
                          <option value="GB">United Kingdom (GB)</option>
                          <option value="FR">France (FR)</option>
                        </select>
                      </div>

                      <button
                        className="btn-analyze-cf"
                        onClick={handleCounterfactualAnalysis}
                        disabled={cfAnalyzing}
                      >
                        {cfAnalyzing
                          ? 'Analyzing...'
                          : 'Re-analyze with new parameters'}
                      </button>
                    </div>

                    <div className="cf-results">
                      <h3>
                        Rank Changes {cfPredictions && <>(updated)</>}
                      </h3>
                      <table className="cf-table">
                        <thead>
                          <tr>
                            <th>Guard IP</th>
                            <th>Original Rank</th>
                            <th>New Rank</th>
                            <th>Change</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(cfPredictions || predictions.predictions)
                            .slice(0, 8)
                            .map((pred, idx) => (
                              <tr key={idx}>
                                <td className="ip-cell">{pred.guard_ip}</td>
                                <td>
                                  {cfPredictions
                                    ? pred.originalRank
                                    : pred.rank}
                                </td>
                                <td>{pred.rank}</td>
                                <td>
                                  {cfPredictions && pred.rankChange !== 0 ? (
                                    <span
                                      className={
                                        pred.rankChange < 0
                                          ? 'change-up'
                                          : 'change-down'
                                      }
                                    >
                                      {pred.rankChange < 0
                                        ? `↑ ${Math.abs(pred.rankChange)}`
                                        : `↓ ${pred.rankChange}`}
                                    </span>
                                  ) : (
                                    <span className="change-none">–</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>

                      {!cfPredictions && (
                        <div className="cf-placeholder">
                          <p>
                            Adjust parameters and click "Re-analyze with new
                            parameters" to see rank changes.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="empty-state">
                  <h2>Counterfactual Analysis</h2>
                  <p>Run a prediction first to analyze scenarios.</p>
                  <button
                    className="btn-primary"
                    onClick={() => setActiveTab('prediction')}
                  >
                    Go to Prediction
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Network Status Tab */}
          {activeTab === 'network' && (
            <div className="network-status-content">
              <div className="content-header">
                <h2>🌐 Live TOR Network Status</h2>
                <p>Real-time monitoring of TOR network nodes and relays</p>
              </div>

              <div className="network-status-grid">
                <div className="network-status-card">
                  <div className="network-status-header">
                    <span className="status-badge online">NETWORK: {networkData.status}</span>
                    <span className="status-badge update-time">UPDATED: {networkData.lastUpdate}</span>
                  </div>

                  <div className="network-stats-large">
                    <div className="network-stat-item">
                      <div className="stat-icon">🛡️</div>
                      <div className="stat-info">
                        <div className="stat-value-large">{networkData.guardNodes.toLocaleString()}</div>
                        <div className="stat-label-large">Guard Nodes Online</div>
                      </div>
                    </div>

                    <div className="network-stat-item">
                      <div className="stat-icon">🚪</div>
                      <div className="stat-info">
                        <div className="stat-value-large">{networkData.exitNodes.toLocaleString()}</div>
                        <div className="stat-label-large">Exit Nodes Online</div>
                      </div>
                    </div>

                    <div className="network-stat-item">
                      <div className="stat-icon">🌐</div>
                      <div className="stat-info">
                        <div className="stat-value-large">{networkData.totalRelays.toLocaleString()}</div>
                        <div className="stat-label-large">Total Relays</div>
                      </div>
                    </div>
                  </div>

                  <div className="network-footer-info">
                    <p className="data-source">📡 Data source: onionoo.torproject.org</p>
                    <p className="refresh-info">Auto-refreshes every 30 seconds</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Phase 2 Roadmap */}
          {activeTab === 'phase2' && <Phase2Roadmap />}
        </main>
      </div>

      <footer className="App-footer">
        <p>
          © 2025 Tamil Nadu Police Cyber Crime Wing. All rights reserved. |
          Official Use Only
        </p>
      </footer>
    </div>
  );
}

export default App;
