import React, { useState } from 'react';
import './Phase2Roadmap.css';

const Phase2Roadmap = () => {
  const [expandedPhase, setExpandedPhase] = useState(null);

  const phases = [
    {
      id: 1,
      title: 'PHASE 1: PROOF-OF-CONCEPT',
      subtitle: 'NOW ✅ COMPLETED',
      duration: '0 months',
      status: 'completed',
      deliverables: [
        { name: 'ML Prototype', icon: '🤖' },
        { name: 'XGBoost + LightGBM + CatBoost', icon: '⚙️' },
        { name: '75-Feature Engineering', icon: '📊' },
        { name: 'SHAP Explainability', icon: '💡' },
        { name: 'React Dashboard', icon: '📱' },
        { name: 'Real-time Predictions', icon: '⚡' },
        { name: 'Report Generator', icon: '📄' }
      ],
      accuracy: {
        simulated: '99.79%',
        projected: '45-55% Top-1'
      },
      outcome: 'Demonstrates technical feasibility & operational readiness'
    },
    {
      id: 2,
      title: 'PHASE 2: VALIDATION & ENHANCEMENT',
      subtitle: '⏳ PLANNED',
      duration: '3-6 months',
      status: 'planned',
      fixes: [
        {
          name: 'FIX 1: Chutney Simulations',
          timeline: '2 months',
          problem: 'Synthetic data too optimistic',
          solution: [
            '50-node Chutney network for 1000+ hours',
            '100,000+ real simulation circuits',
            'Ground-truth guard-exit pairs',
            'Exact TOR circuit logic'
          ],
          improvement: '60% → 78% Top-1 accuracy'
        },
        {
          name: 'FIX 2: Timestamp-Based Filtering',
          timeline: '1 month',
          problem: 'Cannot verify guard was online',
          solution: [
            'TOR Consensus API integration',
            'Query active guards at incident time',
            'Filter predictions to consensus guards',
            'Temporal features: hour, day, season'
          ],
          improvement: '70-80% → 85-90% accuracy'
        },
        {
          name: 'FIX 3: Enhanced Feature Engineering',
          timeline: '1 month',
          problem: 'Static features miss dynamic patterns',
          solution: [
            '50 new temporal dynamic features',
            'Circuit type classification',
            'User behavior patterns',
            'Network congestion metrics'
          ],
          improvement: '85-90% → 88-92% accuracy'
        }
      ],
      outcome: 'Production-ready accuracy (80%+ Top-10), timestamp-aware, enhanced explainability'
    },
    {
      id: 3,
      title: 'PHASE 3: DEPLOYMENT & OPERATIONALIZATION',
      subtitle: '🚀 FUTURE',
      duration: '6-12 months',
      status: 'future',
      fixes: [
        {
          name: 'FIX 4: Real-World Validation',
          timeline: '4 months',
          strategy: 'Closed-Case Analysis',
          details: [
            'Partnership with TN Police Cyber Crime Wing',
            'Retrospective analysis of solved cases',
            'Ground truth: actual perpetrator guard known',
            'Validate on 50-100 real cases',
            'Accuracy documented: 85-90%'
          ]
        },
        {
          name: 'FIX 5: Legal Compliance Framework',
          timeline: '3 months',
          requirements: [
            'Audit trail for every prediction',
            'Chain of evidence documentation',
            'Privacy impact assessment',
            'Legal opinion from cyber law experts',
            'Training materials for prosecutors'
          ]
        },
        {
          name: 'FIX 6: Operational Integration',
          timeline: '3 months',
          integrations: [
            'Connection to police case management systems',
            'Automated monitoring of exit nodes',
            'Real-time alert system',
            'Integration with forensic tools (Encase, FTK)',
            'Cloud infrastructure with auto-scaling'
          ]
        },
        {
          name: 'FIX 7: Adversarial Robustness',
          timeline: '2 months',
          strategy: [
            'Red-team testing against evasion',
            'Adversarial training (robust models)',
            'Model poisoning detection',
            'Cryptographic verification of predictions'
          ]
        }
      ],
      outcome: '✅ Production-ready, 85-90% validated accuracy, legal compliance, operational deployment complete'
    }
  ];

  return (
    <div className="roadmap-container">
      <div className="roadmap-header">
        <h1>🚀 PHASE 2 ROADMAP: PATH TO PRODUCTION</h1>
        <p>3-Phase deployment strategy to overcome limitations and achieve production readiness</p>
      </div>

      {/* Timeline Visualization */}
      <div className="timeline-section">
        <div className="timeline">
          {phases.map((phase, index) => (
            <div key={phase.id} className={`timeline-item status-${phase.status}`}>
              <div className="timeline-marker">
                {phase.status === 'completed' && '✅'}
                {phase.status === 'planned' && '⏳'}
                {phase.status === 'future' && '🚀'}
              </div>
              <div className="timeline-content">
                <h3>{phase.title}</h3>
                <p className="duration">Duration: {phase.duration}</p>
              </div>
              {index < phases.length - 1 && <div className="timeline-connector"></div>}
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Phase Cards */}
      <div className="phases-grid">
        {phases.map((phase) => (
          <div 
            key={phase.id} 
            className={`phase-card status-${phase.status}`}
          >
            <div className="phase-card-header">
              <h2>{phase.title}</h2>
              <span className="status-badge">{phase.subtitle}</span>
            </div>

            <div className="phase-duration">
              ⏱️ Duration: {phase.duration}
            </div>

            {/* Phase 1: Deliverables */}
            {phase.id === 1 && (
              <div className="phase-content">
                <div className="deliverables-grid">
                  {phase.deliverables.map((item, idx) => (
                    <div key={idx} className="deliverable-item">
                      <span className="deliverable-icon">{item.icon}</span>
                      <span className="deliverable-name">{item.name}</span>
                    </div>
                  ))}
                </div>
                <div className="accuracy-box">
                  <div className="accuracy-item">
                    <span className="label">Simulated:</span>
                    <span className="value">{phase.accuracy.simulated}</span>
                  </div>
                  <div className="accuracy-item">
                    <span className="label">Real World:</span>
                    <span className="value">{phase.accuracy.projected}</span>
                  </div>
                </div>
                <p className="phase-outcome">📌 {phase.outcome}</p>
              </div>
            )}

            {/* Phase 2: Improvements */}
            {phase.id === 2 && (
              <div className="phase-content">
                <div className="fixes-container">
                  {phase.fixes.map((fix, idx) => (
                    <div key={idx} className="fix-box">
                      <div className="fix-header">
                        <h4>{fix.name}</h4>
                        <span className="timeline-badge">⏱️ {fix.timeline}</span>
                      </div>
                      <div className="fix-problem">
                        <strong>Problem:</strong> {fix.problem}
                      </div>
                      <div className="fix-solution">
                        <strong>Solution:</strong>
                        <ul>
                          {fix.solution.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="fix-improvement">
                        ✨ {fix.improvement}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="phase-outcome">🎯 {phase.outcome}</p>
              </div>
            )}

            {/* Phase 3: Operationalization */}
            {phase.id === 3 && (
              <div className="phase-content">
                <div className="fixes-container">
                  {phase.fixes.map((fix, idx) => (
                    <div key={idx} className="fix-box phase3">
                      <div className="fix-header">
                        <h4>{fix.name}</h4>
                        <span className="timeline-badge">⏱️ {fix.timeline}</span>
                      </div>
                      
                      {fix.strategy && (
                        <div className="fix-strategy">
                          <strong>Strategy:</strong> {Array.isArray(fix.strategy) ? (
                            <ul>
                              {fix.strategy.map((item, i) => (
                                <li key={i}>{item}</li>
                              ))}
                            </ul>
                          ) : (
                            <span> {fix.strategy}</span>
                          )}
                        </div>
                      )}
                      
                      {fix.details && (
                        <div className="fix-details">
                          <strong>Details:</strong>
                          <ul>
                            {fix.details.map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {fix.requirements && (
                        <div className="fix-requirements">
                          <strong>Requirements:</strong>
                          <ul>
                            {fix.requirements.map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {fix.integrations && (
                        <div className="fix-integrations">
                          <strong>Integration Points:</strong>
                          <ul>
                            {fix.integrations.map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <p className="phase-outcome">{phase.outcome}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Phase2Roadmap;
