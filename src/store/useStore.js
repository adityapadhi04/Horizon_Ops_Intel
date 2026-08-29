import { create } from 'zustand';
import axios from 'axios';

export const useStore = create((set, get) => ({
  // Core States
  his: [],
  lab: [],
  bed: [],
  activeConflicts: [],
  alerts: [],
  auditLog: [],
  trustScores: { his: 96, lab: 94, bed: 79, overall: 88 },
  settings: { labDelay: false, bedLag: false, running: true },
  rules: { bedDischargeThreshold: 2, labTatThreshold: 60, primaryPrecedence: 'his' },
  patterns: { recurringPatterns: 4, highRiskDepts: 2, mostUnreliableSource: 'Manual Bed Sheet', averageLag: '42 min' },

  // Aggregated Indicators
  occupiedCount: 0,
  availableCount: 100,
  patientCount: 0,
  conflictCount: 0,
  alertCount: 0,
  loading: false,
  error: null,

  // Actions
  loadAll: async () => {
    set({ loading: true });
    try {
      const [overviewRes, bedsRes, patientsRes, labsRes, conflictsRes, patternsRes, auditRes, alertsRes] = await Promise.all([
        axios.get('/api/overview'),
        axios.get('/api/beds'),
        axios.get('/api/patients'),
        axios.get('/api/labs'),
        axios.get('/api/conflicts'),
        axios.get('/api/patterns'),
        axios.get('/api/audit'),
        axios.get('/api/alerts')
      ]);

      set({
        occupiedCount: overviewRes.data.occupiedCount,
        availableCount: overviewRes.data.availableCount,
        patientCount: overviewRes.data.patientCount,
        conflictCount: overviewRes.data.conflictCount,
        alertCount: overviewRes.data.alertCount,
        trustScores: overviewRes.data.trustScores,
        bed: bedsRes.data,
        his: patientsRes.data,
        lab: labsRes.data,
        activeConflicts: conflictsRes.data,
        patterns: patternsRes.data,
        auditLog: auditRes.data,
        alerts: alertsRes.data,
        loading: false,
        error: null
      });
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      set({ error: err.message, loading: false });
    }
  },

  resolveConflict: async (conflictId, resolutionAction, overrideReason = '', resolvedBy = '') => {
    try {
      await axios.post(`/api/conflicts/${conflictId}/resolve`, {
        resolutionAction,
        overrideReason,
        resolvedBy
      });
      // Refresh all states
      await get().loadAll();
    } catch (err) {
      console.error("Error resolving conflict:", err);
    }
  },

  clearAlert: async (alertId) => {
    try {
      const res = await axios.post(`/api/alerts/${alertId}/clear`);
      set({ alerts: res.data, alertCount: res.data.length });
    } catch (err) {
      console.error("Error clearing alert:", err);
    }
  },

  resolveAlert: async (alertId, resolvedBy = '') => {
    try {
      await axios.post(`/api/alerts/${alertId}/resolve`, { resolvedBy });
      await get().loadAll();
    } catch (err) {
      console.error("Error resolving alert:", err);
    }
  },

  clearAllAlerts: async () => {
    try {
      const res = await axios.post('/api/alerts/clear-all');
      set({ alerts: res.data, alertCount: 0 });
    } catch (err) {
      console.error("Error clearing all alerts:", err);
    }
  },

  updateRule: async (key, value) => {
    try {
      await axios.post('/api/rules/update', { key, value });
      // Update local rules config representation
      set(state => ({
        rules: { ...state.rules, [key]: value }
      }));
      // Refresh database records
      await get().loadAll();
    } catch (err) {
      console.error("Error updating rules sandbox:", err);
    }
  },

  toggleSetting: async (key) => {
    try {
      const res = await axios.post('/api/demo/settings', { key });
      set({ settings: res.data });
    } catch (err) {
      console.error("Error toggling simulation settings:", err);
    }
  },

  simulateEvent: async (eventType) => {
    try {
      await axios.post('/api/demo/event', { eventType });
      await get().loadAll();
    } catch (err) {
      console.error("Error simulating event:", err);
    }
  },

  resetSimulation: async () => {
    try {
      await axios.post('/api/demo/reset');
      await get().loadAll();
    } catch (err) {
      console.error("Error resetting simulation:", err);
    }
  }
}));
