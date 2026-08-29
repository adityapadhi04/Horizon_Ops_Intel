import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { useStore } from '../store/useStore';
import { 
  Bell, AlertTriangle, Info, CheckCircle, Plus, Eye, Check, X, ShieldAlert, Beaker, CornerDownRight, ToggleRight, ToggleLeft, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

// Static historical alerts loaded on "Load More"
const HISTORICAL_ALERTS = [
  { id: 'hist-1', title: 'Ward A Capacity Updated', message: 'Occupancy returned to nominal levels (10 / 12 occupied).', severity: 'resolved', department: 'Ward A', timeAgo: '1 hour ago' },
  { id: 'hist-2', title: 'Emergency Dept Wait Time Increased', message: 'Average intake latency exceeded 45 minutes.', severity: 'warning', department: 'Emergency', timeAgo: '2 hours ago' },
  { id: 'hist-3', title: 'Blood Inventory Low', message: 'O-negative blood supplies fell below preferred baseline units.', severity: 'critical', department: 'Blood Bank', timeAgo: '3 hours ago' },
  { id: 'hist-4', title: 'Laboratory Queue Cleared', message: 'Pending SLA backlog reconciled successfully.', severity: 'resolved', department: 'Laboratory', timeAgo: '4 hours ago' }
];

export const AlertsView = ({ setCurrentTab, currentUser, activeRole }) => {
  const { alerts, clearAlert, resolveAlert, activeConflicts, resolveConflict } = useStore();

  const [activeSubTab, setActiveSubTab] = useState('active'); // active, resolved, rules
  const [severityFilter, setSeverityFilter] = useState('all'); // all, critical, warning, info
  const [searchTerm, setSearchTerm] = useState('');

  const handleResolveAlert = async (alertId) => {
    const userLabel = currentUser ? `${currentUser.name} (${currentUser.role})` : 'Akshaya (Nursing Supervisor)';
    await resolveAlert(alertId, userLabel);
    setToastMsg('✓ Alert resolved successfully');
    setTimeout(() => setToastMsg(''), 4000);
  };
  
  // Custom states
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState({});
  const [resolvedCount, setResolvedCount] = useState(12);
  const [selectedAlertDetails, setSelectedAlertDetails] = useState(null);
  const [resolvingConflictObj, setResolvingConflictObj] = useState(null);
  const [showCreateRuleModal, setShowCreateRuleModal] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Loaded historical alerts
  const [loadedMore, setLoadedMore] = useState(false);
  const [extraAlerts, setExtraAlerts] = useState([]);

  // Alert rules state
  const [alertRules, setAlertRules] = useState([
    { id: 'rule-1', name: 'Low Bed Capacity', when: 'Available beds fall below 3', location: 'All wards', action: 'Create High Priority Alert', enabled: true },
    { id: 'rule-2', name: 'Lab Report Delay', when: 'Lab turnaround exceeds 5 hours', location: 'Laboratory', action: 'Create Warning Alert', enabled: true },
    { id: 'rule-3', name: 'Data Trust Drop', when: 'Trust score falls below 80', location: 'System-wide', action: 'Create Critical Alert', enabled: true }
  ]);

  // Create rule form values
  const [ruleMonitor, setRuleMonitor] = useState('Bed Availability');
  const [ruleCondition, setRuleCondition] = useState('Less Than');
  const [ruleValue, setRuleValue] = useState('3');
  const [ruleLocation, setRuleLocation] = useState('All Hospital');
  const [rulePriority, setRulePriority] = useState('High');

  // Seeded active alerts
  const SEEDED_ALERTS = [
    {
      id: 'seed-al-1',
      title: 'Ward C - Bed Capacity',
      message: 'Only 2 beds are currently available.',
      severity: 'critical',
      department: 'Ward C',
      timeAgo: '2 minutes ago',
      isSeed: true
    },
    {
      id: 'seed-al-2',
      title: 'Laboratory Results Delayed',
      message: '18 lab reports have exceeded the expected turnaround time.',
      severity: 'warning',
      department: 'Laboratory',
      timeAgo: '8 minutes ago',
      isSeed: true
    },
    {
      id: 'seed-al-3',
      title: 'Bed C301 Data Conflict',
      message: 'HIS shows Vacant while Nursing Board shows Occupied.',
      severity: 'attention',
      department: 'Ward C',
      timeAgo: '12 minutes ago',
      isSeed: true
    },
    {
      id: 'seed-al-4',
      title: 'New Patient Admissions',
      message: '6 patients admitted in the last hour.',
      severity: 'info',
      department: 'Ward A',
      timeAgo: '18 minutes ago',
      isSeed: true
    }
  ];

  // Map dynamic backend database alerts to card structures
  const dynamicAlertsMapped = alerts.map(a => {
    let dept = 'General';
    let timeLabel = 'Recent';

    if (a.message.includes('Ward C') || a.message.includes('C-204')) dept = 'Ward C';
    if (a.message.includes('Radiology') || a.title.includes('Lab') || a.message.includes('Lab')) dept = 'Laboratory';
    if (a.message.includes('Trust')) dept = 'Trust Center';

    return {
      id: a.id,
      title: a.title,
      message: a.message,
      severity: a.severity.toLowerCase(),
      department: dept,
      timeAgo: timeLabel,
      backendAlert: true,
      status: a.status || 'ACTIVE',
      recommendedAction: a.recommendedAction || 'Review system logs for details.'
    };
  });

  const allActiveAlerts = [...dynamicAlertsMapped, ...SEEDED_ALERTS, ...extraAlerts];

  // Filters application
  const filteredAlerts = allActiveAlerts.filter(a => {
    // 1. Tab filtering
    if (activeSubTab === 'resolved') {
      return a.status === 'RESOLVED' || a.severity === 'resolved' || a.id.toString().includes('hist');
    }
    if (activeSubTab === 'active' && (a.status === 'RESOLVED' || a.severity === 'resolved')) {
      return false; // don't show resolved alerts under active
    }

    // 2. Severity Filters
    if (severityFilter !== 'all') {
      if (a.severity.toLowerCase() !== severityFilter.toLowerCase()) return false;
    }

    // 3. Search Keyword query
    const term = searchTerm.toLowerCase();
    return (
      a.title.toLowerCase().includes(term) ||
      a.message.toLowerCase().includes(term) ||
      a.department.toLowerCase().includes(term)
    );
  });

  // Action: Acknowledge Alert
  const handleAcknowledge = (id) => {
    setAcknowledgedAlerts(prev => ({ ...prev, [id]: true }));
  };

  // Action: Open Conflict Resolver Modal
  const handleOpenConflictResolver = (alert) => {
    const conflict = activeConflicts.find(c => c.mrn && alert.message.includes(c.mrn)) || activeConflicts[0] || {
      id: 'CF-2041',
      mrn: '29381',
      patientName: 'John Davis',
      type: 'Bed Occupancy Mismatch',
      description: 'Patient John Davis is discharged in HIS register, but Bed-302 remains occupied in Bed Board.',
      sourceData: { his: 'Discharged', bed: 'Occupied' }
    };
    setResolvingConflictObj({ ...conflict, alertId: alert.id });
  };

  // Action: Confirm Conflict resolution
  const handleConfirmResolution = async (action) => {
    if (!resolvingConflictObj) return;
    
    // 1. Resolve conflict on backend database
    const userLabel = currentUser ? `${currentUser.name} (${currentUser.role})` : 'Sarah Miller (Nursing Lead)';
    await resolveConflict(resolvingConflictObj.id, action, '', userLabel);
    
    // 2. Clear related alerts
    if (resolvingConflictObj.alertId) {
      await clearAlert(resolvingConflictObj.alertId);
    }
    
    // 3. Update local counters
    setResolvedCount(prev => prev + 1);
    setResolvingConflictObj(null);
    setToastMsg('✓ Data conflict resolved and recorded in Audit Trail');
    setTimeout(() => setToastMsg(''), 4000);
  };

  // Action: Load more historical alerts
  const handleLoadMore = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setExtraAlerts(prev => [...prev, ...HISTORICAL_ALERTS]);
      setLoadedMore(true);
      setLoadingMore(false);
    }, 600);
  };

  const [loadingMore, setLoadingMore] = useState(false);

  // Action: Save alert rule in modal
  const handleSaveRule = (e) => {
    e.preventDefault();
    const newRule = {
      id: `rule-${Date.now()}`,
      name: `${ruleMonitor} threshold rule`,
      when: `${ruleMonitor} matches ${ruleCondition} ${ruleValue}`,
      location: ruleLocation,
      action: `Create ${rulePriority} Alert`,
      enabled: true
    };
    setAlertRules(prev => [...prev, newRule]);
    setShowCreateRuleModal(false);
    setToastMsg('✓ Custom alert rule created successfully');
    setTimeout(() => setToastMsg(''), 4000);
  };

  const toggleRuleEnabled = (id) => {
    setAlertRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  // Summary Metrics calculations
  const activeAlertsCount = allActiveAlerts.filter(a => a.status !== 'RESOLVED' && a.severity !== 'resolved').length;
  const criticalHighCount = allActiveAlerts.filter(a => a.status !== 'RESOLVED' && (a.severity === 'critical' || a.severity === 'high' || a.severity === 'warning')).length;

  return (
    <div className="flex flex-col gap-6 relative">
      
      {/* PAGE HEADER */}
      <div className="border-b border-white/5 pb-4 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white font-heading">
            Operational Alerts
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Monitor important hospital events that need attention.
          </p>
        </div>
        
        {/* Breathing live indicator */}
        <div className="flex items-center gap-2 bg-success-green/10 border border-success-green/20 px-3 py-1.5 rounded-lg text-[10px] font-bold text-success-green tracking-wider uppercase">
          <span className="w-2 h-2 bg-success-green rounded-full animate-pulse" />
          <span>● LIVE MONITORING</span>
          <span className="text-text-secondary/80 lowercase font-medium border-l border-white/10 pl-2">Hospital systems connected</span>
        </div>
      </div>

      {/* ALERT SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="h-20 flex flex-col justify-between p-4">
          <span className="text-[9px] font-bold text-text-secondary uppercase tracking-wider">Needs Attention</span>
          <h3 className="text-xl font-extrabold text-danger-red font-heading">{activeAlertsCount}</h3>
          <span className="text-[9px] text-text-secondary">Require action</span>
        </Card>

        <Card className="h-20 flex flex-col justify-between p-4">
          <span className="text-[9px] font-bold text-text-secondary uppercase tracking-wider">High Priority</span>
          <h3 className="text-xl font-extrabold text-warning-amber font-heading">{criticalHighCount}</h3>
          <span className="text-[9px] text-text-secondary">Immediate review</span>
        </Card>

        <Card className="h-20 flex flex-col justify-between p-4">
          <span className="text-[9px] font-bold text-text-secondary uppercase tracking-wider">Resolved Today</span>
          <h3 className="text-xl font-extrabold text-success-green font-heading">{resolvedCount}</h3>
          <span className="text-[9px] text-text-secondary">Handled successfully</span>
        </Card>

        <Card className="h-20 flex flex-col justify-between p-4 border-success-green/10 bg-success-green/[0.01]">
          <span className="text-[9px] font-bold text-success-green uppercase tracking-wider">System Status</span>
          <h3 className="text-sm font-bold text-success-green font-heading mt-1">NORMAL</h3>
          <span className="text-[9px] text-text-secondary">All core systems connected</span>
        </Card>
      </div>

      {/* TOP NAVIGATION TABS */}
      <div className="flex border-b border-white/5 pb-2 justify-between items-center flex-wrap gap-4 mt-2">
        <div className="flex gap-2 bg-command-secondary border border-white/5 p-1 rounded-xl">
          <button
            onClick={() => setActiveSubTab('active')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeSubTab === 'active' 
                ? 'bg-command-card text-accent-cyan border border-accent-cyan/15 shadow-sm' 
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            ACTIVE ({activeAlertsCount})
          </button>
          <button
            onClick={() => setActiveSubTab('resolved')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeSubTab === 'resolved' 
                ? 'bg-command-card text-accent-cyan border border-accent-cyan/15 shadow-sm' 
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            RESOLVED ({resolvedCount})
          </button>
          <button
            onClick={() => setActiveSubTab('rules')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeSubTab === 'rules' 
                ? 'bg-command-card text-accent-cyan border border-accent-cyan/15 shadow-sm' 
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            ALERT RULES
          </button>
        </div>

        {/* Filters strip (only visible when in alerts tab) */}
        {activeSubTab !== 'rules' && (
          <div className="flex items-center gap-3">
            <div className="flex bg-command-secondary border border-white/5 p-1 rounded-xl text-[10px] font-bold uppercase">
              {['all', 'critical', 'high', 'medium', 'low'].map(sev => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    severityFilter === sev 
                      ? 'bg-command-card text-accent-cyan shadow-sm' 
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
            <div className="relative w-40">
              <input
                type="text"
                placeholder="Search alerts..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/5 hover:border-white/10 rounded-lg pl-8 pr-3 py-1 text-xs text-text-primary outline-none transition-all placeholder:text-text-secondary/40"
              />
              <Search className="w-3.5 h-3.5 text-text-secondary absolute left-2.5 top-2" />
            </div>
          </div>
        )}
      </div>

      {/* TAB SCREEN: ACTIVE ALERTS */}
      {activeSubTab !== 'rules' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">
              {activeSubTab === 'active' ? 'Active Alerts' : 'Resolved Alerts'}
            </h3>
            <p className="text-[10px] text-text-secondary">{filteredAlerts.length} events matching filter</p>
          </div>

          <Card>
            <CardContent className="p-0 flex flex-col">
              {filteredAlerts.length === 0 ? (
                <div className="text-center py-10 text-xs text-text-secondary">
                  No alerts currently require attention matching selected filter parameters.
                </div>
              ) : (
                filteredAlerts.map((alert) => {
                  const isCritical = alert.severity === 'critical';
                  const isWarning = alert.severity === 'warning';
                  const isAttention = alert.severity === 'attention';
                  const isInfo = alert.severity === 'info';
                  
                  let dotColor = 'bg-accent-blue';
                  let borderGlow = 'border-white/5';
                  if (isCritical) {
                    dotColor = 'bg-danger-red';
                    borderGlow = 'border-danger-red/10 bg-danger-red/[0.005]';
                  } else if (isWarning) {
                    dotColor = 'bg-warning-amber';
                    borderGlow = 'border-warning-amber/10 bg-warning-amber/[0.005]';
                  } else if (isAttention) {
                    dotColor = 'bg-warning-amber/60';
                  } else if (alert.severity === 'resolved') {
                    dotColor = 'bg-success-green';
                  }

                  const isAcked = acknowledgedAlerts[alert.id];

                  return (
                    <div 
                      key={alert.id}
                      className={`px-6 py-4 flex items-center justify-between border-b border-white/5 last:border-b-0 hover:bg-white/[0.01] transition-all text-xs ${borderGlow}`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="pt-1.5">
                          <span className={`w-2.5 h-2.5 rounded-full block ${dotColor}`} />
                        </div>

                        <div className="flex flex-col gap-0.5">
                          <h4 className="font-bold text-text-primary uppercase tracking-wide flex items-center gap-2">
                            <span>{alert.title}</span>
                            {isAcked && <Badge variant="neutral" className="text-[8px] py-0">Acknowledged</Badge>}
                          </h4>
                          <p className="text-text-secondary text-[11px] leading-relaxed">{alert.message}</p>
                          
                          {isAcked && (
                            <span className="text-[10px] text-accent-cyan font-bold italic mt-1">
                              ✓ Alert acknowledged by Operations Lead.
                            </span>
                          )}

                          <div className="flex items-center gap-2 mt-1 text-[10px] text-text-secondary/70">
                            <span>Department: <strong className="text-text-secondary font-semibold">{alert.department}</strong></span>
                            <span>•</span>
                            <span>{alert.timeAgo}</span>
                          </div>
                        </div>
                      </div>

                      {/* Card actions buttons */}
                      {alert.status !== 'RESOLVED' && alert.severity !== 'resolved' && (
                        <div className="flex items-center gap-2 ml-4">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => setSelectedAlertDetails(alert)}
                          >
                            View Details
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleResolveAlert(alert.id)}
                            className="border-accent-cyan/20 hover:border-accent-cyan/40 text-accent-cyan"
                          >
                            Resolve
                          </Button>
                        </div>
                      )}

                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Load More Button */}
          {activeSubTab === 'active' && (
            <div className="flex justify-center mt-2">
              {loadedMore ? (
                <button 
                  disabled 
                  className="w-full max-w-md py-3 text-xs font-semibold text-text-secondary bg-white/[0.01] border border-white/5 rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <span>All alerts loaded</span>
                </button>
              ) : (
                <button 
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="w-full max-w-md py-3 text-xs font-semibold text-text-primary bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  {loadingMore ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin" />
                      <span>Loading Alerts...</span>
                    </>
                  ) : (
                    <span>Load More Alerts</span>
                  )}
                </button>
              )}
            </div>
          )}

        </div>
      )}

      {/* TAB SCREEN: ALERT RULES */}
      {activeSubTab === 'rules' && (
        <div className="flex flex-col gap-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">Alert Rules</h3>
              <p className="text-[10px] text-text-secondary">Automatically notify administrators when important conditions occur.</p>
            </div>
            <Button size="sm" onClick={() => setShowCreateRuleModal(true)} icon={Plus}>
              Create Alert Rule
            </Button>
          </div>

          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.01] text-text-secondary">
                    <th className="p-3 font-bold uppercase tracking-wider">Rule Target</th>
                    <th className="p-3 font-bold uppercase tracking-wider">Condition Criteria</th>
                    <th className="p-3 font-bold uppercase tracking-wider">Location Scope</th>
                    <th className="p-3 font-bold uppercase tracking-wider">Trigger Action</th>
                    <th className="p-3 font-bold uppercase tracking-wider text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {alertRules.map((rule) => (
                    <tr key={rule.id} className={`border-b border-white/5 hover:bg-white/[0.01] transition-all ${!rule.enabled ? 'opacity-50' : ''}`}>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${rule.enabled ? 'bg-success-green animate-pulse' : 'bg-white/10'}`} />
                          <span className="font-bold text-text-primary">{rule.name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-text-secondary">{rule.when}</td>
                      <td className="p-3">
                        <Badge variant="neutral">{rule.location}</Badge>
                      </td>
                      <td className="p-3 font-semibold text-accent-cyan">{rule.action}</td>
                      <td className="p-3 text-right">
                        <button 
                          onClick={() => toggleRuleEnabled(rule.id)}
                          className="focus:outline-none"
                        >
                          {rule.enabled ? (
                            <ToggleRight className="w-8 h-8 text-accent-cyan" />
                          ) : (
                            <ToggleLeft className="w-8 h-8 text-white/20" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* RESOLVE CONFLICT MODAL */}
      <AnimatePresence>
        {resolvingConflictObj && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setResolvingConflictObj(null)}
              className="fixed inset-0 bg-black z-45"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 m-auto w-full max-w-sm h-fit bg-command-secondary border border-white/5 rounded-xl p-5 shadow-2xl z-50 flex flex-col gap-4 text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-warning-amber/15 border border-warning-amber/20 flex items-center justify-center flex-shrink-0">
                  <ShieldAlert className="w-5 h-5 text-warning-amber" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-text-secondary uppercase">Resolution Center</span>
                  <h3 className="text-sm font-bold text-text-primary mt-0.5">Bed Conflict Resolver</h3>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[9px] text-text-secondary uppercase font-bold block">Description</span>
                <p className="text-text-primary leading-relaxed">{resolvingConflictObj.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div className="p-3 bg-command-card border border-white/5 rounded-lg">
                  <span className="text-[9px] text-text-secondary block font-bold">Epic HIS Admissions</span>
                  <strong className="text-xs text-text-primary mt-1 block uppercase">{resolvingConflictObj.sourceData?.his || 'Discharged'}</strong>
                  <span className="text-[9px] text-text-secondary/70 mt-0.5 block">10:24 AM update</span>
                </div>
                <div className="p-3 bg-command-card border border-white/5 rounded-lg">
                  <span className="text-[9px] text-text-secondary block font-bold">Nursing Bed Board</span>
                  <strong className="text-xs text-warning-amber mt-1 block uppercase">{resolvingConflictObj.sourceData?.bed || 'Occupied'}</strong>
                  <span className="text-[9px] text-text-secondary/70 mt-0.5 block">10:05 AM update</span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-accent-cyan/15 bg-accent-cyan/[0.02] flex flex-col gap-1 leading-relaxed">
                <span className="font-bold text-accent-cyan uppercase tracking-wide text-[9px] block">Recommended Action</span>
                <p className="text-text-secondary text-[11px]">
                  Prioritize Epic HIS because it contains the latest verified admissions update.
                </p>
              </div>

              <div className="flex gap-2 justify-end mt-2">
                <Button size="sm" variant="ghost" onClick={() => setResolvingConflictObj(null)}>Cancel</Button>
                <Button size="sm" variant="primary" onClick={() => handleConfirmResolution('approve_his')}>Resolve Conflict</Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* VIEW DETAILS SIDE DRAWER */}
      <AnimatePresence>
        {selectedAlertDetails && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAlertDetails(null)}
              className="fixed inset-0 bg-black z-45"
            />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-command-secondary border-l border-white/5 shadow-2xl z-50 p-6 flex flex-col justify-between overflow-y-auto text-xs"
            >
              <div className="flex flex-col gap-5">
                
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-danger-red">{selectedAlertDetails.severity}</span>
                    <h3 className="text-sm font-bold text-text-primary mt-1">{selectedAlertDetails.title}</h3>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => setSelectedAlertDetails(null)}>Close</Button>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-[9px] text-text-secondary uppercase font-bold tracking-wider">Operational Summary</span>
                  <p className="text-text-primary leading-relaxed">{selectedAlertDetails.message}</p>
                </div>

                {/* Capacity values simulation */}
                <div className="grid grid-cols-3 gap-3 text-center border-t border-b border-white/5 py-4 my-2">
                  <div>
                    <span className="text-[9px] text-text-secondary block font-bold uppercase">Capacity</span>
                    <strong className="text-lg font-extrabold text-white mt-1 block">20 beds</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-text-secondary block font-bold uppercase">Occupied</span>
                    <strong className="text-lg font-extrabold text-white mt-1 block">18</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-text-secondary block font-bold uppercase text-danger-red">Available</span>
                    <strong className="text-lg font-extrabold text-danger-red mt-1 block">2</strong>
                  </div>
                </div>

                {/* Recent Activities list */}
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] text-text-secondary uppercase font-bold tracking-wider">Recent Flow Activity</span>
                  <div className="flex flex-col gap-2 font-mono text-[10px] leading-relaxed">
                    <div className="flex justify-between text-text-secondary">
                      <span>10:22 AM</span>
                      <span>Patient admitted to Bed C304</span>
                    </div>
                    <div className="flex justify-between text-text-secondary">
                      <span>10:18 AM</span>
                      <span>Patient admitted to Bed C302</span>
                    </div>
                    <div className="flex justify-between text-text-secondary">
                      <span>10:05 AM</span>
                      <span>Bed C301 marked vacant</span>
                    </div>
                  </div>
                </div>

                {/* Action recommendations */}
                <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] flex flex-col gap-1">
                  <span className="font-bold text-text-primary uppercase tracking-wide text-[9px] block">Recommended Flow Action</span>
                  <p className="text-text-secondary text-[11px] leading-relaxed">
                    Review patient census flow maps and coordinate empty beds allocations in neighboring units.
                  </p>
                </div>

              </div>

              <div className="border-t border-white/5 pt-5 mt-6 flex flex-col gap-3">
                <Button 
                  variant="primary" 
                  className="w-full"
                  onClick={() => {
                    setSelectedAlertDetails(null);
                    setCurrentTab('operations');
                  }}
                >
                  View Operations
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    handleAcknowledge(selectedAlertDetails.id);
                    setSelectedAlertDetails(null);
                  }}
                >
                  Acknowledge Alert
                </Button>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* CREATE ALERT RULE MODAL */}
      <AnimatePresence>
        {showCreateRuleModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateRuleModal(false)}
              className="fixed inset-0 bg-black z-45"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 m-auto w-full max-w-sm h-fit bg-command-secondary border border-white/5 rounded-xl p-5 shadow-2xl z-50 flex flex-col gap-4 text-xs text-text-secondary"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2 text-text-primary">
                  <Plus className="w-4 h-4 text-accent-cyan" />
                  <h3 className="text-sm font-bold">Create Alert Rule</h3>
                </div>
                <button onClick={() => setShowCreateRuleModal(false)} className="text-text-secondary hover:text-text-primary">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveRule} className="flex flex-col gap-3">
                
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold uppercase text-text-secondary">What should we monitor?</label>
                  <select 
                    value={ruleMonitor}
                    onChange={e => setRuleMonitor(e.target.value)}
                    className="bg-command-card border border-white/5 rounded-lg p-2 text-text-primary outline-none"
                  >
                    <option value="Bed Availability">Bed Availability</option>
                    <option value="Laboratory Delay">Laboratory Delay</option>
                    <option value="Data Conflict Rate">Data Conflict Rate</option>
                    <option value="Data Trust Score">Data Trust Score</option>
                    <option value="Patient Admission Rate">Patient Admission Rate</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold uppercase text-text-secondary">Condition</label>
                    <select 
                      value={ruleCondition}
                      onChange={e => setRuleCondition(e.target.value)}
                      className="bg-command-card border border-white/5 rounded-lg p-2 text-text-primary outline-none"
                    >
                      <option value="Less Than">Less Than</option>
                      <option value="Greater Than">Greater Than</option>
                      <option value="Equals">Equals</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold uppercase text-text-secondary">Threshold Value</label>
                    <input 
                      type="text"
                      value={ruleValue}
                      onChange={e => setRuleValue(e.target.value)}
                      className="bg-command-card border border-white/5 rounded-lg p-2 text-text-primary outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold uppercase text-text-secondary">Location</label>
                    <select 
                      value={ruleLocation}
                      onChange={e => setRuleLocation(e.target.value)}
                      className="bg-command-card border border-white/5 rounded-lg p-2 text-text-primary outline-none"
                    >
                      <option value="All Hospital">All Hospital</option>
                      <option value="Ward A">Ward A</option>
                      <option value="Ward B">Ward B</option>
                      <option value="Ward C">Ward C</option>
                      <option value="ICU">ICU</option>
                      <option value="Laboratory">Laboratory</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold uppercase text-text-secondary">Alert Priority</label>
                    <select 
                      value={rulePriority}
                      onChange={e => setRulePriority(e.target.value)}
                      className="bg-command-card border border-white/5 rounded-lg p-2 text-text-primary outline-none"
                    >
                      <option value="Critical">Critical</option>
                      <option value="High">High</option>
                      <option value="Warning">Warning</option>
                      <option value="Information">Information</option>
                    </select>
                  </div>
                </div>

                <Button variant="primary" type="submit" className="w-full mt-2">Save Rule</Button>

              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Toast message notifications */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 bg-accent-cyan text-command-base font-bold text-xs px-4 py-2.5 rounded-lg shadow-xl shadow-accent-cyan/10 animate-fade-in z-55">
          {toastMsg}
        </div>
      )}

    </div>
  );
};

export default AlertsView;
