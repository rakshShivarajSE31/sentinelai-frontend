import React, { useState, useEffect } from 'react';
import { Shield, Activity, AlertTriangle, BarChart2, Settings, MessageSquare, Wifi, WifiOff } from 'lucide-react';
import { useWebSocket } from './hooks/useWebSocket';
import LiveMonitor from './components/tabs/LiveMonitor';
import Incidents from './components/tabs/Incidents';
import Analytics from './components/tabs/Analytics';
import GeneratorControl from './components/tabs/GeneratorControl';
import NaturalQuery from './components/tabs/NaturalQuery';
import AlertPopup from './components/layout/AlertPopup';
import './index.css';

type Tab = 'live' | 'incidents' | 'analytics' | 'generator' | 'query';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('live');
  const { isConnected, liveEvents, newIncidents, clearNewIncidents } = useWebSocket();
  const [unreadIncidents, setUnreadIncidents] = useState(0);
  const [showAlert, setShowAlert] = useState(false);
  const [alertIncident, setAlertIncident] = useState<any>(null);

  // Track unread incidents when not on incidents tab
  useEffect(() => {
    if (newIncidents.length > 0) {
      if (activeTab !== 'incidents') {
        setUnreadIncidents(prev => prev + newIncidents.length);
      }
      // Show popup for HIGH severity
      const highSeverity = newIncidents.find(i => i.severity === 'HIGH');
      if (highSeverity) {
        setAlertIncident(highSeverity);
        setShowAlert(true);
      }
      // Update page title
      document.title = `🔴 ${unreadIncidents + newIncidents.length} NEW — SentinelAI`;
    }
  }, [newIncidents]);

  // Clear unread when switching to incidents tab
  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    if (tab === 'incidents') {
      setUnreadIncidents(0);
      clearNewIncidents();
      document.title = 'SentinelAI — Security Intelligence';
    }
  };

  const tabs = [
    { id: 'live' as Tab, label: 'Live Monitor', icon: Activity },
    { id: 'incidents' as Tab, label: 'Incidents', icon: AlertTriangle },
    { id: 'analytics' as Tab, label: 'Analytics', icon: BarChart2 },
    { id: 'generator' as Tab, label: 'Generator', icon: Settings },
    { id: 'query' as Tab, label: 'AI Query', icon: MessageSquare },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>

      {/* ── Top Navigation ── */}
      <nav style={{
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Shield size={28} color="#3B82F6" />
            <div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
                SentinelAI
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '-2px' }}>
                Multi-Agent Intelligence Platform
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: isActive ? 600 : 400,
                    backgroundColor: isActive ? 'var(--accent-blue)' : 'transparent',
                    color: isActive ? 'white' : 'var(--text-secondary)',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                >
                  <Icon size={16} />
                  {tab.label}
                  {/* Unread badge on Incidents tab */}
                  {tab.id === 'incidents' && unreadIncidents > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      backgroundColor: 'var(--danger)',
                      color: 'white',
                      borderRadius: '50%',
                      width: '18px',
                      height: '18px',
                      fontSize: '11px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700
                    }}>
                      {unreadIncidents > 9 ? '9+' : unreadIncidents}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Connection Status */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '20px',
            backgroundColor: isConnected ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${isConnected ? 'var(--success)' : 'var(--danger)'}`
          }}>
            {isConnected
              ? <Wifi size={14} color="var(--success)" />
              : <WifiOff size={14} color="var(--danger)" />
            }
            <span style={{
              fontSize: '12px',
              fontWeight: 600,
              color: isConnected ? 'var(--success)' : 'var(--danger)'
            }}>
              {isConnected ? 'LIVE' : 'OFFLINE'}
            </span>
            {isConnected && (
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'var(--success)',
                display: 'inline-block'
              }} className="pulse" />
            )}
          </div>
        </div>
      </nav>

      {/* ── Main Content ── */}
      <main style={{ padding: '24px' }}>
        {activeTab === 'live' && <LiveMonitor liveEvents={liveEvents} isConnected={isConnected} />}
        {activeTab === 'incidents' && <Incidents newIncidents={newIncidents} />}
        {activeTab === 'analytics' && <Analytics />}
        {activeTab === 'generator' && <GeneratorControl />}
        {activeTab === 'query' && <NaturalQuery />}
      </main>

      {/* ── Alert Popup ── */}
      {showAlert && alertIncident && (
        <AlertPopup
          incident={alertIncident}
          onClose={() => setShowAlert(false)}
        />
      )}
    </div>
  );
};

export default App;
