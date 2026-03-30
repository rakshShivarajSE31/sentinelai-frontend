import axios from 'axios';
import {
  Incident, AnalyticsSummary, AnalyticsTrends,
  GeneratorStatus, SystemHealth, QueryResult
} from '../types';

// Base URL for all API calls
const BASE_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
});

// ── Incidents ─────────────────────────────────────────────────
export const getAllIncidents = () =>
  api.get<Incident[]>('/api/incidents').then(r => r.data);

export const getRecentIncidents = () =>
  api.get<Incident[]>('/api/incidents/recent').then(r => r.data);

export const getIncidentById = (id: number) =>
  api.get<Incident>(`/api/incidents/${id}`).then(r => r.data);

export const getIncidentsBySeverity = (severity: string) =>
  api.get<Incident[]>(`/api/incidents/severity/${severity}`).then(r => r.data);

export const getUnresolvedIncidents = () =>
  api.get<Incident[]>('/api/incidents/unresolved').then(r => r.data);

export const resolveIncident = (id: number) =>
  api.post(`/api/incidents/${id}/resolve`).then(r => r.data);

// ── Analytics ─────────────────────────────────────────────────
export const getAnalyticsSummary = () =>
  api.get<AnalyticsSummary>('/api/analytics/summary').then(r => r.data);

export const getAnalyticsTrends = () =>
  api.get<AnalyticsTrends>('/api/analytics/trends').then(r => r.data);

// ── Generator ─────────────────────────────────────────────────
export const startGenerator = (anomalyFrequency: number = 10) =>
  api.post('/api/generator/start', { anomalyFrequency }).then(r => r.data);

export const stopGenerator = () =>
  api.post('/api/generator/stop', {}).then(r => r.data);

export const getGeneratorStatus = () =>
  api.get<GeneratorStatus>('/api/generator/status').then(r => r.data);

export const injectAnomaly = () =>
  api.post('/api/generator/inject-anomaly', {}).then(r => r.data);

// ── System ────────────────────────────────────────────────────
export const getSystemHealth = () =>
  api.get<SystemHealth>('/api/system').then(r => r.data);

// ── Natural Language Query ────────────────────────────────────
export const queryIncidents = (question: string) =>
  api.post<QueryResult>('/api/query', { question }).then(r => r.data);

export default api;