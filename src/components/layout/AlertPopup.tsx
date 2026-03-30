import React, { useEffect } from 'react';
import { AlertTriangle, X, ExternalLink } from 'lucide-react';

interface AlertPopupProps {
  incident: any;
  onClose: () => void;
}

const AlertPopup: React.FC<AlertPopupProps> = ({ incident, onClose }) => {

  // Auto dismiss after 6 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 6000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className="slide-in"
      style={{
        position: 'fixed',
        top: '80px',
        right: '24px',
        zIndex: 9999,
        width: '360px',
        backgroundColor: '#1E293B',
        border: '1px solid #EF4444',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: '0 20px 60px rgba(239,68,68,0.3)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            backgroundColor: 'rgba(239,68,68,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <AlertTriangle size={16} color="#EF4444" />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#EF4444' }}>
              🚨 HIGH SEVERITY INCIDENT
            </div>
            <div style={{ fontSize: '11px', color: '#94A3B8' }}>
              New incident detected
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#94A3B8', padding: '4px'
          }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Content */}
      <div style={{
        backgroundColor: 'rgba(239,68,68,0.05)',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '12px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '12px', color: '#94A3B8' }}>Event ID</span>
          <span style={{ fontSize: '12px', fontFamily: 'monospace', color: '#F1F5F9' }}>
            {incident.eventId}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '12px', color: '#94A3B8' }}>User</span>
          <span style={{ fontSize: '12px', color: '#F1F5F9' }}>{incident.userId}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '12px', color: '#94A3B8' }}>Risk Score</span>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#EF4444' }}>
            {incident.riskScore}/100
          </span>
        </div>
      </div>

      {/* Progress bar — auto dismiss timer */}
      <div style={{
        height: '3px', backgroundColor: '#334155',
        borderRadius: '2px', overflow: 'hidden'
      }}>
        <div style={{
          height: '100%', backgroundColor: '#EF4444',
          borderRadius: '2px',
          animation: 'shrink 6s linear forwards'
        }} />
      </div>

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>

      <div style={{ fontSize: '11px', color: '#64748B', marginTop: '8px', textAlign: 'center' }}>
        Click Incidents tab to investigate
      </div>
    </div>
  );
};

export default AlertPopup;
