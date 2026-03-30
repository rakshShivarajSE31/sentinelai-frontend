import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, CheckCircle, Clock, ChevronDown, ChevronUp, Search, Filter, Download, Shield, Eye, TrendingUp, Zap, FileText } from 'lucide-react';
import { Incident, DetectiveResult, AnalystResult, RiskResult, ActionResult } from '../../types';
import { getAllIncidents, resolveIncident } from '../../services/api';

interface IncidentsProps {
  newIncidents: any[];
}

const Incidents: React.FC<IncidentsProps> = ({ newIncidents }) => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [activeAgent, setActiveAgent] = useState<string>('detective');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchIncidents = useCallback(async () => {
    try {
      const data = await getAllIncidents();
      setIncidents(data);
    } catch (e) {
      console.error('Failed to fetch incidents:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  // Add new incidents from WebSocket
  useEffect(() => {
    if (newIncidents.length > 0) {
      fetchIncidents();
    }
  }, [newIncidents, fetchIncidents]);

  const handleResolve = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await resolveIncident(id);
      setIncidents(prev => prev.map(i => i.id === id ? { ...i, resolved: true } : i));
    } catch (err) {
      console.error('Failed to resolve:', err);
    }
  };

  const handleExport = (incident: Incident, e: React.MouseEvent) => {
    e.stopPropagation();
    const content = incident.incidentReport || 'No report available';
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `incident-${incident.id}-report.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const parseJson = (str: string) => {
    try { return JSON.parse(str); } catch { return null; }
  };

  const getSeverityStyle = (severity: string) => {
    if (severity === 'HIGH') return { bg: 'rgba(239,68,68,0.15)', color: '#FCA5A5', border: '#EF4444' };
    if (severity === 'MEDIUM') return { bg: 'rgba(245,158,11,0.15)', color: '#FCD34D', border: '#F59E0B' };
    return { bg: 'rgba(16,185,129,0.15)', color: '#86EFAC', border: '#10B981' };
  };

  const filteredIncidents = incidents.filter(i => {
    const matchSeverity = severityFilter === 'ALL' || i.severity === severityFilter;
    const matchSearch = searchQuery === '' ||
      i.eventId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (i.userId || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchSeverity && matchSearch;
  });

  const agents = [
    { id: 'detective', label: 'Detective', icon: Shield, color: '#3B82F6' },
    { id: 'analyst', label: 'Analyst', icon: Eye, color: '#8B5CF6' },
    { id: 'risk', label: 'Risk', icon: TrendingUp, color: '#F59E0B' },
    { id: 'action', label: 'Action', icon: Zap, color: '#EF4444' },
    { id: 'report', label: 'Report', icon: FileText, color: '#10B981' },
  ];

  const renderAgentContent = (incident: Incident, agentId: string) => {
    if (agentId === 'detective') {
      const data: DetectiveResult = parseJson(incident.detectiveOutput) || {};
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1, backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', padding: '12px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>VERDICT</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: data.confirmed ? 'var(--danger)' : 'var(--success)' }}>
                {data.confirmed ? '🚨 CONFIRMED' : '✅ FALSE ALARM'}
              </div>
            </div>
            <div style={{ flex: 1, backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', padding: '12px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>CONFIDENCE</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--accent-blue)' }}>
                {Math.round((data.confidence || 0) * 100)}%
              </div>
            </div>
          </div>
          <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', padding: '12px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>ANOMALY TYPE</div>
            <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{data.anomalyType || 'Unknown'}</div>
          </div>
          <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', padding: '12px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>REASONING</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{data.reasoning || 'No reasoning provided'}</div>
          </div>
        </div>
      );
    }

    if (agentId === 'analyst') {
      const data: AnalystResult = parseJson(incident.analystOutput) || {};
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', padding: '12px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>ROOT CAUSE</div>
            <div style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.5 }}>{data.rootCause || 'Unknown'}</div>
          </div>
          <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', padding: '12px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>PATTERN MATCH</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{data.patternMatch || 'No pattern identified'}</div>
          </div>
          <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', padding: '12px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>CONTRIBUTING FACTORS</div>
            {(data.contributingFactors || []).map((factor, i) => (
              <div key={i} style={{ fontSize: '12px', color: 'var(--text-secondary)', padding: '4px 0', borderBottom: i < (data.contributingFactors?.length || 0) - 1 ? '1px solid var(--border)' : 'none' }}>
                • {factor}
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (agentId === 'risk') {
      const data: RiskResult = parseJson(incident.riskOutput) || {};
      const score = data.riskScore || 0;
      const scoreColor = score >= 70 ? 'var(--danger)' : score >= 40 ? 'var(--warning)' : 'var(--success)';
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Risk Score Gauge */}
          <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>RISK SCORE</div>
            <div style={{ fontSize: '48px', fontWeight: 800, color: scoreColor }}>{score}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>out of 100</div>
            <div style={{ marginTop: '12px', height: '8px', backgroundColor: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${score}%`, backgroundColor: scoreColor, borderRadius: '4px', transition: 'width 1s ease' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1, backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', padding: '12px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>SEVERITY</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: scoreColor }}>{data.severity || 'UNKNOWN'}</div>
            </div>
            <div style={{ flex: 1, backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', padding: '12px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>URGENCY</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--warning)' }}>{data.urgency || 'UNKNOWN'}</div>
            </div>
          </div>
          <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', padding: '12px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>BUSINESS IMPACT</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{data.businessImpact || 'Unknown impact'}</div>
          </div>
        </div>
      );
    }

    if (agentId === 'action') {
      const data: ActionResult = parseJson(incident.actionOutput) || {};
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid #EF4444', borderRadius: '8px', padding: '12px' }}>
            <div style={{ fontSize: '11px', color: '#EF4444', marginBottom: '6px', fontWeight: 600 }}>⚡ IMMEDIATE ACTION</div>
            <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600 }}>{data.immediateAction || 'No action specified'}</div>
          </div>
          <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', padding: '12px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>NOTIFY LIST</div>
            {(data.notifyList || []).map((person, i) => (
              <div key={i} style={{ fontSize: '12px', color: 'var(--text-secondary)', padding: '3px 0' }}>📢 {person}</div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1, backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', padding: '12px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>ESCALATE</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: data.escalate ? 'var(--danger)' : 'var(--success)' }}>
                {data.escalate ? 'YES' : 'NO'}
              </div>
            </div>
            <div style={{ flex: 1, backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', padding: '12px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>TIMEFRAME</div>
              <div style={{ fontSize: '12px', color: 'var(--warning)' }}>{data.timeframe || 'Immediate'}</div>
            </div>
          </div>
          <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', padding: '12px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>PREVENTION STEPS</div>
            {(data.preventionSteps || []).map((step, i) => (
              <div key={i} style={{ fontSize: '12px', color: 'var(--text-secondary)', padding: '3px 0' }}>🛡️ {step}</div>
            ))}
          </div>
        </div>
      );
    }

    if (agentId === 'report') {
      const report = incident.incidentReport || 'No report available';
      return (
        <div style={{
          backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', padding: '16px',
          fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.8,
          whiteSpace: 'pre-wrap', maxHeight: '400px', overflowY: 'auto'
        }}>
          {report}
        </div>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px', color: 'var(--text-muted)' }}>
        <div>Loading incidents...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '4px' }}>Incidents</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            {filteredIncidents.length} incidents · {incidents.filter(i => !i.resolved).length} unresolved
          </p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by event ID or user..."
            style={{
              width: '100%', padding: '10px 12px 10px 36px',
              backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)',
              borderRadius: '8px', color: 'var(--text-primary)', fontSize: '13px',
              outline: 'none'
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map(s => (
            <button key={s} onClick={() => setSeverityFilter(s)} style={{
              padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border)',
              backgroundColor: severityFilter === s ? 'var(--accent-blue)' : 'var(--bg-secondary)',
              color: severityFilter === s ? 'white' : 'var(--text-secondary)',
              cursor: 'pointer', fontSize: '13px', fontWeight: 500
            }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Incident List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredIncidents.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px',
            backgroundColor: 'var(--bg-card)', borderRadius: '12px',
            border: '1px solid var(--border)', color: 'var(--text-muted)'
          }}>
            <AlertTriangle size={40} strokeWidth={1} style={{ marginBottom: '12px', margin: '0 auto 12px' }} />
            <p>No incidents found</p>
          </div>
        ) : (
          filteredIncidents.map(incident => {
            const sevStyle = getSeverityStyle(incident.severity);
            const isExpanded = expandedId === incident.id;
            return (
              <div key={incident.id} style={{
                backgroundColor: 'var(--bg-card)', borderRadius: '12px',
                border: `1px solid ${isExpanded ? sevStyle.border + '80' : 'var(--border)'}`,
                overflow: 'hidden', transition: 'border-color 0.2s'
              }}>
                {/* Incident Header */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : incident.id)}
                  style={{
                    padding: '16px 20px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '16px',
                    backgroundColor: isExpanded ? 'rgba(255,255,255,0.02)' : 'transparent'
                  }}
                >
                  {/* Severity badge */}
                  <span style={{
                    padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
                    backgroundColor: sevStyle.bg, color: sevStyle.color,
                    border: `1px solid ${sevStyle.border}40`, whiteSpace: 'nowrap'
                  }}>
                    {incident.severity}
                  </span>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {incident.eventId}
                      </span>
                      {incident.resolved && (
                        <span style={{ fontSize: '11px', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <CheckCircle size={10} /> Resolved
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {incident.userId} · {incident.eventType} · {new Date(incident.createdAt).toLocaleString()}
                    </div>
                  </div>

                  {/* Risk score */}
                  <div style={{
                    fontSize: '20px', fontWeight: 800,
                    color: sevStyle.color, minWidth: '50px', textAlign: 'center'
                  }}>
                    {incident.riskScore}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {!incident.resolved && (
                      <button
                        onClick={(e) => handleResolve(incident.id, e)}
                        style={{
                          padding: '6px 12px', borderRadius: '6px',
                          backgroundColor: 'rgba(16,185,129,0.1)',
                          border: '1px solid var(--success)',
                          color: 'var(--success)', cursor: 'pointer', fontSize: '12px',
                          fontWeight: 600
                        }}
                      >
                        Resolve
                      </button>
                    )}
                    <button
                      onClick={(e) => handleExport(incident, e)}
                      style={{
                        padding: '6px 10px', borderRadius: '6px',
                        backgroundColor: 'transparent', border: '1px solid var(--border)',
                        color: 'var(--text-muted)', cursor: 'pointer'
                      }}
                      title="Export report"
                    >
                      <Download size={12} />
                    </button>
                    {isExpanded ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                  </div>
                </div>

                {/* Expanded — Agent Pipeline */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid var(--border)', padding: '20px' }}>

                    {/* Agent Pipeline Visual */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '20px', flexWrap: 'wrap' }}>
                      {agents.map((agent, i) => {
                        const Icon = agent.icon;
                        return (
                          <React.Fragment key={agent.id}>
                            <button
                              onClick={() => setActiveAgent(agent.id)}
                              style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                padding: '8px 14px', borderRadius: '8px',
                                backgroundColor: activeAgent === agent.id ? agent.color + '20' : 'var(--bg-secondary)',
                                border: `1px solid ${activeAgent === agent.id ? agent.color : 'var(--border)'}`,
                                color: activeAgent === agent.id ? agent.color : 'var(--text-muted)',
                                cursor: 'pointer', fontSize: '12px', fontWeight: 600,
                                transition: 'all 0.2s'
                              }}
                            >
                              <Icon size={13} />
                              {agent.label}
                            </button>
                            {i < agents.length - 1 && (
                              <div style={{ color: 'var(--text-muted)', fontSize: '16px' }}>→</div>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>

                    {/* Agent Content */}
                    <div className="fade-in">
                      {renderAgentContent(incident, activeAgent)}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Incidents;
