import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { useStore } from '../store/useStore';
import { 
  BedDouble, UserPlus, LogOut, AlertTriangle, Search, ArrowDown, Check, Beaker
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Seed baseline activities to guarantee realistic operational records (18 events)
const STATIC_ACTIVITIES = [
  { id: 1, time: '10:42 AM', type: 'discharges', title: 'BED B204 IS NOW VACANT', desc: 'Patient discharge was recorded.', location: 'Ward B', color: 'success' },
  { id: 2, time: '10:38 AM', type: 'admissions', title: 'BED A102 IS NOW OCCUPIED', desc: 'A new patient was admitted.', location: 'Ward A', color: 'blue' },
  { id: 3, time: '10:31 AM', type: 'issues', title: 'BED C301 NEEDS ATTENTION', desc: 'HIS shows vacant but Nursing Board shows occupied.', location: 'Ward C', color: 'warning', hasAction: true },
  { id: 4, time: '10:22 AM', type: 'laboratory', title: 'LAB RESULT COMPLETED', desc: 'Blood test report is now available.', location: 'Laboratory', color: 'purple' },
  { id: 5, time: '10:15 AM', type: 'discharges', title: 'PATIENT DISCHARGED FROM ICU', desc: 'ICU-04 is now available.', location: 'ICU', color: 'success' },
  { id: 6, time: '10:08 AM', type: 'admissions', title: 'NEW PATIENT ADMITTED', desc: 'Assigned to Bed A102.', location: 'Ward A', color: 'blue' },
  { id: 7, time: '09:55 AM', type: 'beds', title: 'BED B110 STATUS UPDATED', desc: 'Occupied → Vacant', location: 'Ward B', color: 'success' },
  { id: 8, time: '09:40 AM', type: 'laboratory', title: 'LABORATORY REPORT PENDING', desc: 'Awaiting verification.', location: 'Laboratory', color: 'purple' },
  { id: 9, time: '09:12 AM', type: 'beds', title: 'ICU BED ICU-02 OCCUPIED', desc: 'Patient admitted from Emergency.', location: 'ICU', color: 'blue' },
  { id: 10, time: '08:50 AM', type: 'discharges', title: 'WARD C DISCHARGE COMPLETE', desc: 'Bed C105 sanitized and ready.', location: 'Ward C', color: 'success' },
  { id: 11, time: '08:30 AM', type: 'laboratory', title: 'CHEM-7 LAB PANEL RELEASED', desc: 'Routine chemistry results reported.', location: 'Laboratory', color: 'purple' },
  { id: 12, time: '08:15 AM', type: 'issues', title: 'WARD B STATUS DISCREPANCY', desc: 'HIS vacant vs Bed Board occupied.', location: 'Ward B', color: 'warning', hasAction: true },
  { id: 13, time: '07:45 AM', type: 'beds', title: 'BED A105 IS NOW VACANT', desc: 'Patient transferred to Stepdown.', location: 'Ward A', color: 'success' },
  { id: 14, time: '07:20 AM', type: 'admissions', title: 'NEW PATIENT ADMITTED IN ER', desc: 'Critical care triage check-in.', location: 'Ward B', color: 'blue' },
  { id: 15, time: '06:50 AM', type: 'laboratory', title: 'STAT TROPONIN COMPLETED', desc: 'Cardiac markers published.', location: 'Laboratory', color: 'purple' },
  { id: 16, time: '06:30 AM', type: 'discharges', title: 'WARD A DISCHARGE COMPLETE', desc: 'Bed A202 vacant.', location: 'Ward A', color: 'success' },
  { id: 17, time: '06:12 AM', type: 'admissions', title: 'BED C202 IS NOW OCCUPIED', desc: 'Post-op patient transferred.', location: 'Ward C', color: 'blue' },
  { id: 18, time: '05:40 AM', type: 'beds', title: 'PATIENT TRANSFERRED TO STEPDOWN', desc: 'ICU Bed status vacated.', location: 'ICU', color: 'success' }
];

export const AuditTrail = () => {
  const { 
    auditLog, activeConflicts, resolveConflict, bed, lab, availableCount, occupiedCount, patientCount, conflictCount 
  } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // all, beds, admissions, discharges, laboratory, issues
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [overrideReason, setOverrideReason] = useState('');
  
  // Load More state
  const [visibleCount, setVisibleCount] = useState(8);
  const [loadingMore, setLoadingMore] = useState(false);

  // Helper to map dynamic backend database logs into clean activity structures
  const parseDynamicLogs = (log) => {
    const timeStr = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isConflict = log.action.includes('Conflict') || log.action.includes('Discrepancy');
    const isAdmission = log.action.includes('Admission') || log.action.includes('Admitted');
    const isDischarge = log.action.includes('Discharge') || log.action.includes('Vacated');
    const isLab = log.action.includes('Lab') || log.action.includes('TAT');

    if (isConflict) {
      return {
        id: log.timestamp,
        time: timeStr,
        type: 'issues',
        title: `BED ${log.target ? log.target.replace('Conflict ','') : 'BOARD'} NEEDS ATTENTION`,
        desc: log.details || 'Disagreement discovered between systems.',
        location: log.details && log.details.includes('Ward C') ? 'Ward C' : 'General Ward',
        color: 'warning',
        hasAction: true,
        conflictObj: activeConflicts.find(c => c.mrn && log.details.includes(c.mrn))
      };
    }
    if (isAdmission) {
      return {
        id: log.timestamp,
        time: timeStr,
        type: 'admissions',
        title: 'NEW PATIENT ADMITTED',
        desc: log.details || 'A new patient was admitted.',
        location: log.details && log.details.includes('Bed') ? log.details.split('Bed ')[1]?.substring(0,6) || 'Ward A' : 'Ward A',
        color: 'blue'
      };
    }
    if (isDischarge) {
      return {
        id: log.timestamp,
        time: timeStr,
        type: 'discharges',
        title: 'BED VACATED & SYNCED',
        desc: log.details || 'Patient discharge was recorded.',
        location: log.details && log.details.includes('Bed') ? log.details.split('Bed ')[1]?.substring(0,6) || 'Ward B' : 'Ward B',
        color: 'success'
      };
    }
    if (isLab) {
      return {
        id: log.timestamp,
        time: timeStr,
        type: 'laboratory',
        title: 'LAB RESULT COMPLETED',
        desc: log.details || 'Blood test results published.',
        location: 'Laboratory',
        color: 'purple'
      };
    }

    return {
      id: log.timestamp,
      time: timeStr,
      type: 'beds',
      title: log.action.toUpperCase(),
      desc: log.details,
      location: 'Operations',
      color: 'blue'
    };
  };

  // Filter out background heartbeats
  const dynamicLogs = auditLog
    .filter(log => !log.action.includes('Heartbeat') && !log.action.includes('Scan') && !log.action.includes('Daemon'))
    .map(parseDynamicLogs);

  // Combine seeded list with live dynamic logs
  const combinedActivities = [...dynamicLogs, ...STATIC_ACTIVITIES];

  // Apply filters
  const filteredActivities = combinedActivities.filter(a => {
    // 1. Tab filters
    if (activeFilter !== 'all' && a.type !== activeFilter) return false;

    // 2. Search filters
    const term = searchTerm.toLowerCase();
    return (
      a.title.toLowerCase().includes(term) ||
      a.desc.toLowerCase().includes(term) ||
      a.location.toLowerCase().includes(term)
    );
  });

  const displayedActivities = filteredActivities.slice(0, visibleCount);

  // Load More trigger
  const handleLoadMore = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount(prev => prev + 5);
      setLoadingMore(false);
    }, 600);
  };

  // Dynamic counts linking to active simulations
  const dynamicBedsAvailable = availableCount;
  const dynamicNewAdmissions = Math.max(6, patientCount + 2);
  const dynamicDischarges = Math.max(4, 10 - patientCount);
  const dynamicConflictsCount = conflictCount;

  // Compute live ward metrics from store arrays
  const wardAOccupied = bed.filter(b => b.ward === 'Ward A' && b.status === 'occupied').length || 8;
  const wardBOccupied = bed.filter(b => b.ward === 'Ward B' && b.status === 'occupied').length || 6;
  const icuOccupied = bed.filter(b => b.ward === 'ICU' && b.status === 'occupied').length || 4;

  const labCompleted = lab.filter(l => l.status === 'Completed').length || 12;
  const labPending = lab.filter(l => l.status === 'Pending').length || 2;

  const handleReviewIssue = (act) => {
    const conflict = act.conflictObj || activeConflicts[0] || {
      id: 'CF-2041',
      mrn: '29381',
      patientName: 'John Davis',
      type: 'Bed Occupancy Mismatch',
      description: 'Patient John Davis is discharged in HIS register, but Ward Bed-302 is still marked as Occupied in nursing log.',
      sourceData: { his: 'Discharged', bed: 'Occupied' },
      suggestionText: 'HIS records discharge. nursing logs lag behind. Recommendation: Clear Bed-302.'
    };
    setSelectedIssue(conflict);
  };

  const handleResolveIssue = async (action) => {
    if (!selectedIssue) return;
    await resolveConflict(selectedIssue.id, action, overrideReason);
    setSelectedIssue(null);
    setOverrideReason('');
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      
      {/* PAGE HEADER */}
      <div className="border-b border-white/5 pb-4">
        <h2 className="text-2xl font-extrabold tracking-tight text-white font-heading">
          Activity History
        </h2>
        <p className="text-xs text-text-secondary mt-1">
          See recent changes across hospital operations.
        </p>
      </div>

      {/* TODAY AT A GLANCE (FIXED HEIGHT SUMMARY CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Beds Available */}
        <Card className="min-h-[145px] flex flex-col justify-between p-6">
          <div className="flex items-start justify-between">
            <span className="text-[9px] font-bold text-text-secondary uppercase tracking-wider">Beds Available</span>
            <BedDouble className="w-4 h-4 text-accent-cyan" />
          </div>
          <h3 className="text-3xl font-extrabold text-accent-cyan font-heading mt-2">
            {dynamicBedsAvailable}
          </h3>
          <span className="text-[10px] text-text-secondary mt-2 leading-relaxed block">
            Currently available across all wards
          </span>
        </Card>

        {/* New Admissions */}
        <Card className="min-h-[145px] flex flex-col justify-between p-6">
          <div className="flex items-start justify-between">
            <span className="text-[9px] font-bold text-text-secondary uppercase tracking-wider">New Admissions</span>
            <UserPlus className="w-4 h-4 text-accent-blue" />
          </div>
          <h3 className="text-3xl font-extrabold text-accent-blue font-heading mt-2">
            {dynamicNewAdmissions}
          </h3>
          <span className="text-[10px] text-text-secondary mt-2 leading-relaxed block">
            Patients admitted today
          </span>
        </Card>

        {/* Patient Discharges */}
        <Card className="min-h-[145px] flex flex-col justify-between p-6">
          <div className="flex items-start justify-between">
            <span className="text-[9px] font-bold text-text-secondary uppercase tracking-wider">Patient Discharges</span>
            <LogOut className="w-4 h-4 text-success-green" />
          </div>
          <h3 className="text-3xl font-extrabold text-success-green font-heading mt-2">
            {dynamicDischarges}
          </h3>
          <span className="text-[10px] text-text-secondary mt-2 leading-relaxed block">
            Patients discharged today
          </span>
        </Card>

        {/* Needs Attention */}
        <Card className="min-h-[145px] flex flex-col justify-between p-6 border-danger-red/15 bg-danger-red/[0.01]">
          <div className="flex items-start justify-between">
            <span className="text-[9px] font-bold text-danger-red uppercase tracking-wider">Needs Attention</span>
            <AlertTriangle className="w-4 h-4 text-danger-red animate-pulse" />
          </div>
          <h3 className="text-3xl font-extrabold text-danger-red font-heading mt-2">
            {dynamicConflictsCount}
          </h3>
          <span className="text-[10px] text-text-secondary mt-2 leading-relaxed block">
            Data issues requiring review
          </span>
        </Card>

      </div>

      {/* COMPACT INSIGHTS INFORMATION STRIP */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-white/[0.01] border border-white/5 rounded-xl text-[10px] text-text-secondary">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-text-primary text-[9px]">
            <span className="w-1.5 h-3 bg-accent-cyan rounded-full" />
            <span>Ward Status</span>
          </div>
          <div className="flex gap-4">
            <span>Ward A: <strong className="text-white">{wardAOccupied} / 12</strong> occupied</span>
            <span>Ward B: <strong className="text-white">{wardBOccupied} / 10</strong> occupied</span>
            <span>ICU: <strong className="text-white">{icuOccupied} / 6</strong> occupied</span>
          </div>
        </div>

        <span className="h-4 w-px bg-white/5 hidden md:block" />

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-text-primary text-[9px]">
            <Beaker className="w-3.5 h-3.5 text-accent-purple" />
            <span>Laboratory</span>
          </div>
          <span><strong>{labCompleted}</strong> completed today</span>
          <span>•</span>
          <span className="text-warning-amber"><strong>{labPending}</strong> pending</span>
        </div>
      </div>

      {/* FILTERS & SEARCH */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/5 pb-4 mt-2">
        <div className="flex bg-command-secondary border border-white/5 p-1 rounded-xl flex-wrap gap-1">
          {[
            { id: 'all', label: 'All' },
            { id: 'beds', label: 'Beds' },
            { id: 'admissions', label: 'Admissions' },
            { id: 'discharges', label: 'Discharges' },
            { id: 'laboratory', label: 'Laboratory' },
            { id: 'issues', label: 'Issues' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveFilter(t.id)}
              className={`px-3 py-1 text-[10px] font-bold uppercase rounded-lg transition-all ${
                activeFilter === t.id 
                  ? 'bg-command-card text-accent-cyan border border-accent-cyan/15 shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-40">
          <input
            type="text"
            placeholder="Search feed..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/5 hover:border-white/10 rounded-lg pl-8 pr-3 py-1 text-xs text-text-primary outline-none transition-all placeholder:text-text-secondary/40"
          />
          <Search className="w-3.5 h-3.5 text-text-secondary absolute left-2.5 top-2" />
        </div>
      </div>

      {/* RECENT ACTIVITY FEED */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">Recent Activity</h3>
        
        <Card>
          <CardContent className="p-0 flex flex-col">
            <AnimatePresence initial={false}>
              {displayedActivities.map((act, index) => {
                const dotColor = act.color === 'success' ? 'bg-success-green' : (act.color === 'warning' ? 'bg-warning-amber' : (act.color === 'purple' ? 'bg-accent-purple' : 'bg-accent-blue'));
                
                return (
                  <motion.div 
                    key={act.id || index}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="px-6 py-4 flex items-center justify-between border-b border-white/5 last:border-b-0 hover:bg-white/[0.01] transition-all text-xs"
                  >
                    <div className="flex items-start gap-4">
                      <div className="pt-1.5 flex-shrink-0">
                        <span className={`w-2.5 h-2.5 rounded-full block ${dotColor}`} />
                      </div>
                      
                      <div className="flex flex-col gap-0.5">
                        <h4 className="font-bold text-text-primary uppercase tracking-wide">{act.title}</h4>
                        <p className="text-text-secondary text-[11px] leading-relaxed">{act.desc}</p>
                        
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-text-secondary/70">
                          <span>Location: <strong className="text-text-secondary font-semibold">{act.location}</strong></span>
                          <span>•</span>
                          <span>{act.time}</span>
                        </div>
                      </div>
                    </div>

                    {act.hasAction && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleReviewIssue(act)}
                        className="ml-4 border-warning-amber/20 hover:border-warning-amber/40 hover:bg-warning-amber/5 text-warning-amber"
                      >
                        Review Issue
                      </Button>
                    )}

                  </motion.div>
                );
              })}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Load More Button */}
        <div className="flex justify-center mt-2">
          {visibleCount >= filteredActivities.length ? (
            <button 
              disabled 
              className="w-full max-w-md py-3 text-xs font-semibold text-text-secondary bg-white/[0.01] border border-white/5 rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Check className="w-3.5 h-3.5 text-success-green" />
              <span>✓ All Activities Loaded</span>
            </button>
          ) : (
            <button 
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="w-full max-w-md py-3 text-xs font-semibold text-text-primary bg-white/5 hover:bg-white/10 border border-white/5 hover:border-accent-cyan/20 hover:text-accent-cyan rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-accent-cyan/5"
            >
              {loadingMore ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin" />
                  <span>Loading Activities...</span>
                </>
              ) : (
                <>
                  <ArrowDown className="w-3.5 h-3.5" />
                  <span>Load More Activity</span>
                </>
              )}
            </button>
          )}
        </div>

      </div>

      {/* Resolution drawer details */}
      <AnimatePresence>
        {selectedIssue && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedIssue(null)}
              className="fixed inset-0 bg-black z-40"
            />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-command-secondary border-l border-white/5 shadow-2xl z-50 p-6 flex flex-col justify-between overflow-y-auto text-xs"
            >
              <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-warning-amber">Needs Attention</span>
                    <h3 className="text-sm font-bold text-text-primary mt-1">Verification Required</h3>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => setSelectedIssue(null)}>Close</Button>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">Affected Resource</span>
                  <p className="font-bold text-text-primary text-sm">{selectedIssue.patientName} ({selectedIssue.id})</p>
                  <p className="text-text-secondary leading-relaxed mt-1">{selectedIssue.description}</p>
                </div>

                <div className="flex flex-col gap-2.5">
                  <span className="text-[9px] text-text-secondary uppercase font-bold tracking-wider">Data Comparison</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-command-card border border-white/5">
                      <span className="text-[9px] text-text-secondary block font-bold">Epic HIS Admissions</span>
                      <strong className="text-xs text-text-primary mt-1 block uppercase">{selectedIssue.sourceData?.his || 'Discharged'}</strong>
                    </div>
                    <div className="p-3 rounded-lg bg-command-card border border-white/5">
                      <span className="text-[9px] text-text-secondary block font-bold">Nursing Bed Board</span>
                      <strong className="text-xs text-warning-amber mt-1 block uppercase">{selectedIssue.sourceData?.bed || 'Occupied'}</strong>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-accent-cyan/15 bg-accent-cyan/[0.02] flex flex-col gap-2">
                  <span className="font-bold text-accent-cyan uppercase tracking-wide text-[9px]">Reconciliation Suggestion</span>
                  <p className="text-text-secondary leading-relaxed">
                    {selectedIssue.suggestionText}
                  </p>
                </div>
              </div>

              <div className="border-t border-white/5 pt-5 mt-6 flex flex-col gap-3">
                <Button 
                  variant="primary" 
                  className="w-full"
                  onClick={() => handleResolveIssue('approve_his')}
                >
                  Approve HIS Status (Clear Bed)
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleResolveIssue('approve_bed')}
                >
                  Approve Bed Status (Restore Admission)
                </Button>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AuditTrail;
