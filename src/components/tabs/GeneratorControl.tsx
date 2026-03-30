import React, { useState, useEffect } from 'react';
import { Play, Square, Zap, Activity, Building2 } from 'lucide-react';
import { startGenerator, stopGenerator, getGeneratorStatus, injectAnomaly } from '../../services/api';

const INDUSTRY_MODES = [
  { id: 'banking', label: '🏦 Banking', description: 'Transactions, transfers, login attempts', frequency: 5 },
  { id: 'healthcare', label: '🏥 Healthcare', description: 'Patient vitals, lab results, alerts', frequency: 8 },
  { id: 'ecommerce', label: '🛒 E-Commerce', description: 'Orders, clicks, cart abandonment', frequency: 3 },
  { id: 'devops', label: '💻 DevOps', description: 'CPU metrics, error logs, deployments', frequency: 4 },
  { id: 'security', label: '🔒 Security', description: 'Login attempts, access violations', frequency: 6 },
];

const GeneratorControl: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [totalEvents, setTotalEvents] = useState(0);
  const [selectedIndustry, setSelectedIndustry] = useState('banking');
  const [anomalyFrequency, setAnomalyFrequency] = useState(10);
  const [loading, setLoading] = useState(false);
  const [injecting, setInjecting] = useState(false);
  const [lastInjected, setLastInjected] = useState<string | null>(null);
  const [sessionEvents, setSessionEvents] = useState(0);
  const [sessionAnomalies, setSessionAnomalies] = useState(0);
  const [uptime, setUptime] = useState(0);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const status = await getGeneratorStatus();
        setIsRunning(status.running);
        setTotalEvents(status.totalEvents);
      } catch (e) {}
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning) {
      timer = setInterval(() => {
        setUptime(prev => prev + 1);
        setSessionEvents(prev => prev + 2);
        if (Math.random() < 1 / anomalyFrequency) {
          setSessionAnomalies(prev => prev + 1);
        }
      }, 1000);
    } else {
      setUptime(0);
    }
    return () => clearInterval(timer);
  }, [isRunning, anomalyFrequency]);

  const handleStart = async () => {
    setLoading(true);
    try {
      const industry = INDUSTRY_MODES.find(i => i.id === selectedIndustry);
      await startGenerator(industry?.frequency || anomalyFrequency);
      setIsRunning(true);
      setSessionEvents(0);
      setSessionAnomalies(0);
    } catch (e) {
      console.error('Failed to start:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    setLoading(true);
    try {
      const result = await stopGenerator();
      setIsRunning(false);
      setTotalEvents(result.totalEvents || totalEvents);
    } catch (e) {
      console.error('Failed to stop:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleInjectAnomaly = async () => {
    setInjecting(true);
    try {
      await injectAnomaly();
      setLastInjected(new Date().toLocaleTimeString());
      setSessionAnomalies(prev => prev + 1);
    } catch (e) {
      console.error('Failed to inject:', e);
    } finally {
      setInjecting(false);
    }
  };

  const formatUptime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '4px' }}>Generator Control</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          Control the event generator and simulate different industry scenarios
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px' }}>

        {/* Left — Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Industry Mode Selector */}
          <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', padding: '20px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 size={16} color="var(--accent-blue)" />
              Industry Demo Mode
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {INDUSTRY_MODES.map(mode => (
                <div
                  key={mode.id}
                  onClick={() => !isRunning && setSelectedIndustry(mode.id)}
                  style={{
                    padding: '14px 16px', borderRadius: '10px',
                    border: `1px solid ${selectedIndustry === mode.id ? 'var(--accent-blue)' : 'var(--border)'}`,
                    backgroundColor: selectedIndustry === mode.id ? 'rgba(59,130,246,0.1)' : 'var(--bg-secondary)',
                    cursor: isRunning ? 'not-allowed' : 'pointer',
                    opacity: isRunning && selectedIndustry !== mode.id ? 0.5 : 1,
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: selectedIndustry === mode.id ? 'var(--accent-blue)' : 'var(--text-primary)' }}>
                      {mode.label}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      1 in {mode.frequency} anomaly
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>
                    {mode.description}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Anomaly Frequency Slider */}
          <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', padding: '20px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>
              Anomaly Frequency
            </div>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>1 in every {anomalyFrequency} events is an anomaly</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-blue)' }}>
                  {Math.round(100 / anomalyFrequency)}% rate
                </span>
              </div>
              <input
                type="range" min="2" max="50" value={anomalyFrequency}
                onChange={e => setAnomalyFrequency(Number(e.target.value))}
                disabled={isRunning}
                style={{ width: '100%', accentColor: 'var(--accent-blue)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>High (50%)</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Low (2%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right — Status + Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Start / Stop Button */}
          <div style={{
            backgroundColor: 'var(--bg-card)', borderRadius: '12px',
            padding: '24px', border: '1px solid var(--border)', textAlign: 'center'
          }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 16px',
              backgroundColor: isRunning ? 'rgba(16,185,129,0.1)' : 'rgba(59,130,246,0.1)',
              border: `2px solid ${isRunning ? 'var(--success)' : 'var(--accent-blue)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }} className={isRunning ? 'pulse' : ''}>
              <Activity size={32} color={isRunning ? 'var(--success)' : 'var(--accent-blue)'} />
            </div>

            <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px', color: isRunning ? 'var(--success)' : 'var(--text-muted)' }}>
              {isRunning ? 'RUNNING' : 'STOPPED'}
            </div>
            {isRunning && (
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                ⏱️ {formatUptime(uptime)}
              </div>
            )}

            <button
              onClick={isRunning ? handleStop : handleStart}
              disabled={loading}
              style={{
                width: '100%', padding: '14px',
                borderRadius: '10px', border: 'none', cursor: loading ? 'wait' : 'pointer',
                backgroundColor: isRunning ? 'var(--danger)' : 'var(--accent-blue)',
                color: 'white', fontSize: '15px', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                opacity: loading ? 0.7 : 1
              }}
            >
              {isRunning ? <><Square size={16} /> Stop Generator</> : <><Play size={16} /> Start Generator</>}
            </button>
          </div>

          {/* Inject Anomaly Button */}
          <button
            onClick={handleInjectAnomaly}
            disabled={injecting}
            style={{
              width: '100%', padding: '16px',
              borderRadius: '12px', border: '2px solid var(--danger)',
              cursor: injecting ? 'wait' : 'pointer',
              backgroundColor: injecting ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.1)',
              color: 'var(--danger)', fontSize: '15px', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              opacity: injecting ? 0.7 : 1
            }}
          >
            <Zap size={18} />
            {injecting ? 'Injecting...' : '🚨 Inject Anomaly Now'}
          </button>

          {lastInjected && (
            <div style={{
              fontSize: '12px', color: 'var(--success)', textAlign: 'center',
              backgroundColor: 'rgba(16,185,129,0.1)', padding: '8px',
              borderRadius: '8px', border: '1px solid var(--success)'
            }}>
              ✅ Anomaly injected at {lastInjected}
            </div>
          )}

          {/* Session Stats */}
          <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', padding: '16px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '14px' }}>Session Stats</div>
            {[
              { label: 'Events Generated', value: sessionEvents, color: 'var(--accent-blue)' },
              { label: 'Anomalies Injected', value: sessionAnomalies, color: 'var(--danger)' },
              { label: 'Total All Time', value: totalEvents, color: 'var(--text-secondary)' },
            ].map((stat, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{stat.label}</span>
                <span style={{ fontSize: '16px', fontWeight: 700, color: stat.color }}>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneratorControl;
