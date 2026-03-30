import React, { useState, useEffect } from 'react';
import { BarChart3, PieChart, TrendingUp, Users, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import {
  PieChart as RechartsPie, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import { AnalyticsSummary, AnalyticsTrends } from '../../types';
import { getAnalyticsSummary, getAnalyticsTrends } from '../../services/api';

const COLORS = { HIGH: '#EF4444', MEDIUM: '#F59E0B', LOW: '#10B981' };

const Analytics: React.FC = () => {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [trends, setTrends] = useState<AnalyticsTrends | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchData = async () => {
    setLoading(true);
    try {
      const [s, t] = await Promise.all([getAnalyticsSummary(), getAnalyticsTrends()]);
      setSummary(s);
      setTrends(t);
      setLastUpdated(new Date());
    } catch (e) {
      console.error('Failed to fetch analytics:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !summary) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px', color: 'var(--text-muted)' }}>
        Loading analytics...
      </div>
    );
  }

  const pieData = summary ? [
    { name: 'HIGH', value: summary.severityBreakdown?.HIGH || 0 },
    { name: 'MEDIUM', value: summary.severityBreakdown?.MEDIUM || 0 },
    { name: 'LOW', value: summary.severityBreakdown?.LOW || 0 },
  ].filter(d => d.value > 0) : [];

  const topUsers = trends?.topAnomalousUsers
    ? Object.entries(trends.topAnomalousUsers)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 8)
        .map(([user, count]) => ({ user: user.replace('github_', '').substring(0, 15), count }))
    : [];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '4px' }}>Analytics</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Last updated: {lastUpdated.toLocaleTimeString()} · Auto-refreshes every 30s
          </p>
        </div>
        <button
          onClick={fetchData}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 16px', borderRadius: '8px',
            backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)',
            color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px'
          }}
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Incidents', value: summary?.totalIncidents || 0, icon: AlertTriangle, color: 'var(--accent-blue)', bg: 'rgba(59,130,246,0.1)' },
          { label: 'Unresolved', value: summary?.unresolvedIncidents || 0, icon: AlertTriangle, color: 'var(--danger)', bg: 'rgba(239,68,68,0.1)' },
          { label: 'Resolved', value: summary?.resolvedIncidents || 0, icon: CheckCircle, color: 'var(--success)', bg: 'rgba(16,185,129,0.1)' },
          { label: 'Avg Risk Score', value: trends?.averageRiskScore?.toFixed(1) || '0', icon: TrendingUp, color: 'var(--warning)', bg: 'rgba(245,158,11,0.1)' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} style={{
              backgroundColor: 'var(--bg-card)', borderRadius: '12px',
              padding: '20px', border: '1px solid var(--border)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{stat.label}</div>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '8px',
                  backgroundColor: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Icon size={16} color={stat.color} />
                </div>
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: stat.color }}>{stat.value}</div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>

        {/* Severity Pie Chart */}
        <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', padding: '20px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PieChart size={16} color="var(--accent-blue)" />
            Severity Distribution
          </div>
          {pieData.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <ResponsiveContainer width={180} height={180}>
                <RechartsPie>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[entry.name as keyof typeof COLORS]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }} />
                </RechartsPie>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {pieData.map((item) => (
                  <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: COLORS[item.name as keyof typeof COLORS] }} />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{item.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.value} incidents</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              No data yet
            </div>
          )}
        </div>

        {/* Resolution Stats */}
        <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', padding: '20px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={16} color="var(--success)" />
            Resolution Rate
          </div>
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '56px', fontWeight: 800, color: 'var(--success)' }}>
              {summary?.resolutionRate || 0}%
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '8px' }}>of incidents resolved</div>
          </div>
          <div style={{ marginTop: '16px', height: '12px', backgroundColor: 'var(--border)', borderRadius: '6px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${summary?.resolutionRate || 0}%`,
              background: 'linear-gradient(90deg, #10B981, #3B82F6)',
              borderRadius: '6px', transition: 'width 1s ease'
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{summary?.resolvedIncidents || 0} resolved</span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{summary?.unresolvedIncidents || 0} pending</span>
          </div>
        </div>
      </div>

      {/* Top Anomalous Users */}
      {topUsers.length > 0 && (
        <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', padding: '20px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={16} color="var(--warning)" />
            Top Anomalous Users
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topUsers} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis dataKey="user" type="category" tick={{ fontSize: 11, fill: '#94A3B8' }} width={120} />
              <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }} />
              <Bar dataKey="count" fill="#3B82F6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default Analytics;
