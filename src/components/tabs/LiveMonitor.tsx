import React, { useState, useEffect } from 'react';
import { Activity, Zap, AlertTriangle, CheckCircle, TrendingUp, Wifi, WifiOff, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { LiveEvent } from '../../types';
import { getSystemHealth } from '../../services/api';

interface LiveMonitorProps {
  liveEvents: LiveEvent[];
  isConnected: boolean;
}

const LiveMonitor: React.FC<LiveMonitorProps> = ({ liveEvents, isConnected }) => {
  const [chartData, setChartData] = useState<{ time: string; count: number; anomalies: number }[]>([]);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [eventsPerSecond, setEventsPerSecond] = useState(0);

  // Calculate stats from live events
  const totalEvents = liveEvents.length;
  const anomalies = liveEvents.filter(e => e.status === 'ANOMALY').length;
  const warnings = liveEvents.filter(e => e.status === 'WARNING').length;
  const normal = liveEvents.filter(e => e.status === 'NORMAL').length;

  // Update chart data every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const timeLabel = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      const recentEvents = liveEvents.filter(e =>
        (Date.now() - e.timestamp) < 5000
      );
      setChartData(prev => {
        const newData = [...prev, {
          time: timeLabel,
          count: recentEvents.length,
          anomalies: recentEvents.filter(e => e.status === 'ANOMALY').length
        }].slice(-12);
        return newData;
      });
      setEventsPerSecond(Math.round(recentEvents.length / 5));
    }, 5000);
    return () => clearInterval(interval);
  }, [liveEvents]);

  // Fetch system health
  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const health = await getSystemHealth();
        setSystemHealth(health);
      } catch (e) {}
    };
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    if (status === 'ANOMALY') return 'var(--danger)';
    if (status === 'WARNING') return 'var(--warning)';
    return 'var(--success)';
  };

  const getStatusBg = (status: string) => {
    if (status === 'ANOMALY') return 'rgba(239,68,68,0.1)';
    if (status === 'WARNING') return 'rgba(245,158,11,0.1)';
    return 'rgba(16,185,129,0.1)';
  };

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
          Live Monitor
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          Real-time event stream — watching {totalEvents} events live
        </p>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Events/sec', value: eventsPerSecond, icon: Zap, color: 'var(--accent-blue)', bg: 'rgba(59,130,246,0.1)' },
          { label: 'Total Events', value: totalEvents, icon: Activity, color: 'var(--text-primary)', bg: 'rgba(255,255,255,0.05)' },
          { label: 'Anomalies', value: anomalies, icon: AlertTriangle, color: 'var(--danger)', bg: 'rgba(239,68,68,0.1)' },
          { label: 'Warnings', value: warnings, icon: TrendingUp, color: 'var(--warning)', bg: 'rgba(245,158,11,0.1)' },
          { label: 'Normal', value: normal, icon: CheckCircle, color: 'var(--success)', bg: 'rgba(16,185,129,0.1)' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} style={{
              backgroundColor: 'var(--bg-card)',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                backgroundColor: stat.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Icon size={18} color={stat.color} />
              </div>
              <div>
                <div style={{ fontSize: '22px', fontWeight: 700, color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{stat.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px' }}>

        {/* Live Event Feed */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: '12px',
          border: '1px solid var(--border)',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={16} color="var(--accent-blue)" />
              <span style={{ fontWeight: 600, fontSize: '14px' }}>Live Event Feed</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {isConnected
                ? <><Wifi size={12} color="var(--success)" /><span style={{ fontSize: '12px', color: 'var(--success)' }}>Connected</span></>
                : <><WifiOff size={12} color="var(--danger)" /><span style={{ fontSize: '12px', color: 'var(--danger)' }}>Disconnected</span></>
              }
            </div>
          </div>

          {/* Event List */}
          <div style={{ height: '480px', overflowY: 'auto' }}>
            {liveEvents.length === 0 ? (
              <div style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                height: '100%', gap: '12px', color: 'var(--text-muted)'
              }}>
                <Activity size={40} strokeWidth={1} />
                <p style={{ fontSize: '14px' }}>Waiting for events...</p>
                <p style={{ fontSize: '12px' }}>Start the generator or wait for real events</p>
              </div>
            ) : (
              liveEvents.map((event, i) => (
                <div
                  key={event.eventId + i}
                  className={i === 0 ? 'fade-in' : ''}
                  style={{
                    padding: '12px 20px',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    backgroundColor: event.status === 'ANOMALY'
                      ? 'rgba(239,68,68,0.05)' : 'transparent',
                    transition: 'background-color 0.2s'
                  }}
                >
                  {/* Status dot */}
                  <div style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    backgroundColor: getStatusColor(event.status),
                    flexShrink: 0
                  }} className={event.status === 'ANOMALY' ? 'pulse' : ''} />

                  {/* Event info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                        {event.eventId}
                      </span>
                      <span style={{
                        fontSize: '10px', fontWeight: 600, padding: '1px 6px',
                        borderRadius: '4px',
                        backgroundColor: getStatusBg(event.status),
                        color: getStatusColor(event.status),
                        border: `1px solid ${getStatusColor(event.status)}40`
                      }}>
                        {event.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {event.userId} · {event.eventType} · {event.source}
                    </div>
                  </div>

                  {/* Score */}
                  <div style={{
                    fontSize: '14px', fontWeight: 700,
                    color: getStatusColor(event.status),
                    minWidth: '45px', textAlign: 'right'
                  }}>
                    {event.anomalyScore}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Event Volume Chart */}
          <div style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: '12px',
            border: '1px solid var(--border)',
            padding: '16px'
          }}>
            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart2 size={16} color="var(--accent-blue)" />
              Event Volume (live)
            </div>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={chartData}>
                  <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 9, fill: '#64748B' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={entry.anomalies > 0 ? '#EF4444' : '#3B82F6'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                Collecting data...
              </div>
            )}
          </div>

          {/* System Health */}
          <div style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: '12px',
            border: '1px solid var(--border)',
            padding: '16px'
          }}>
            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px' }}>
              System Health
            </div>
            {systemHealth ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {Object.entries(systemHealth.services || {}).map(([service, status]) => (
                  <div key={service} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                      {service}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{
                        width: '8px', height: '8px', borderRadius: '50%',
                        backgroundColor: status === 'UP' ? 'var(--success)' : 'var(--danger)'
                      }} />
                      <span style={{
                        fontSize: '12px', fontWeight: 600,
                        color: status === 'UP' ? 'var(--success)' : 'var(--danger)'
                      }}>
                        {status as string}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Loading...</div>
            )}
          </div>

          {/* WebSocket Status */}
          <div style={{
            backgroundColor: isConnected ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.05)',
            borderRadius: '12px',
            border: `1px solid ${isConnected ? 'var(--success)' : 'var(--danger)'}40`,
            padding: '16px',
            textAlign: 'center'
          }}>
            {isConnected ? (
              <>
                <Wifi size={24} color="var(--success)" style={{ marginBottom: '8px' }} />
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--success)' }}>WebSocket Live</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Receiving real-time updates
                </div>
              </>
            ) : (
              <>
                <WifiOff size={24} color="var(--danger)" style={{ marginBottom: '8px' }} />
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--danger)' }}>Disconnected</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Attempting to reconnect...
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


export default LiveMonitor;
