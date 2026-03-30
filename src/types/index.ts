// ── All TypeScript interfaces for SentinelAI ──────────────────

// A raw event from the live feed
export interface LiveEvent {
  eventId: string;
  userId: string;
  eventType: string;
  source: string;
  anomalyScore: number;
  status: 'NORMAL' | 'WARNING' | 'ANOMALY';
  timestamp: number;
}

// A complete incident from PostgreSQL
export interface Incident {
  id: number;
  eventId: string;
  userId: string;
  eventType: string;
  source: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  riskScore: number;
  resolved: boolean;
  createdAt: string;
  incidentReport: string;
  detectiveOutput: string;
  analystOutput: string;
  riskOutput: string;
  actionOutput: string;
}

// Detective Agent result
export interface DetectiveResult {
  confirmed: boolean;
  confidence: number;
  anomalyType: string;
  reasoning: string;
  agent: string;
  eventId: string;
}

// Analyst Agent result
export interface AnalystResult {
  rootCause: string;
  historicalContext: string;
  patternMatch: string;
  contributingFactors: string[];
  severity: string;
  agent: string;
  eventId: string;
}

// Risk Agent result
export interface RiskResult {
  severity: string;
  riskScore: number;
  businessImpact: string;
  urgency: string;
  agent: string;
  eventId: string;
}

// Action Agent result
export interface ActionResult {
  immediateAction: string;
  notifyList: string[];
  escalate: boolean;
  timeframe: string;
  preventionSteps: string[];
  agent: string;
  eventId: string;
}

// Analytics summary
export interface AnalyticsSummary {
  totalIncidents: number;
  unresolvedIncidents: number;
  resolvedIncidents: number;
  totalEvents: number;
  severityBreakdown: {
    HIGH: number;
    MEDIUM: number;
    LOW: number;
  };
  resolutionRate: number;
  recentIncidents: Incident[];
}

// Analytics trends
export interface AnalyticsTrends {
  totalIncidents: number;
  severityTrend: {
    HIGH: number;
    MEDIUM: number;
    LOW: number;
  };
  averageRiskScore: number;
  topAnomalousUsers: Record<string, number>;
  unresolvedCount: number;
}

// WebSocket message types
export interface WebSocketMessage {
  type: 'NEW_INCIDENT' | 'LIVE_EVENT' | 'STATS_UPDATE';
  [key: string]: any;
}

// Generator status
export interface GeneratorStatus {
  running: boolean;
  totalEvents: number;
}

// System health
export interface SystemHealth {
  status: string;
  services: {
    kafka: string;
    mongodb: string;
    redis: string;
    springboot: string;
  };
}

// Query result
export interface QueryResult {
  question: string;
  answer: string;
  dataPoints: number;
}