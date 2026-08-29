import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { useStore } from '../store/useStore';
import { ReconciliationFlowChart } from '../components/Charts';
import { 
  GitCompare, ShieldAlert, CheckCircle, Search, HelpCircle, Eye, CornerDownRight, ArrowRight, UserCheck, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Reconciliation = ({ currentUser, activeRole }) => {
  const { 
    activeConflicts, 
    resolveConflict, 
    trustScores, 
    bed, 
    his, 
    lab 
  } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConflict, setSelectedConflict] = useState(null);
  const [overrideOption, setOverrideOption] = useState('approve_his');
  const [overrideReason, setOverrideReason] = useState('');
  const [showOverrideForm, setShowOverrideForm] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const filteredConflicts = activeConflicts.filter(c => 
    c.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleResolve = async (action) => {
    if (!selectedConflict) return;
    const userLabel = currentUser ? `${currentUser.name} (${currentUser.role})` : 'Sarah Miller (Nursing Lead)';
    await resolveConflict(selectedConflict.id, action, action === 'override' ? overrideReason : '', userLabel);
    setSelectedConflict(null);
    setShowOverrideForm(false);
    setOverrideReason('');
    setToastMsg('✓ Conflict resolved successfully. Data reliability scores updated.');
    setTimeout(() => setToastMsg(''), 4000);
  };

  return (
    <div className="flex flex-col gap-6 relative">
      
      {/* Top Welcome */}
      <div className="border-b border-white/5 pb-5">
        <h2 className="text-2xl font-extrabold tracking-tight text-white font-heading">
          Reconciliation Engine
        </h2>
        <p className="text-xs text-text-secondary mt-1">
          Transform fragmented Epic HIS admissions, LIS lab results, and manual bed logs into one explainable operations view.
        </p>
      </div>

      {/* Pipeline component */}
      <ReconciliationFlowChart 
        hisStatus={trustScores.his} 
        labStatus={trustScores.lab} 
        bedStatus={trustScores.bed} 
      />

      {/* Grid: Diagnostics Streams + Conflicts ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Diagnostics Stream Panel */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-accent-cyan rounded-full" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">Data Source Streams</h3>
          </div>
          
          <Card>
            <CardContent className="flex flex-col gap-4 p-5">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-text-primary uppercase tracking-wide">Epic HIS admissions</span>
                  <span className="text-[10px] text-success-green font-bold">● Connected</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-text-primary block">{trustScores.his}%</span>
                  <span className="text-[9px] text-text-secondary uppercase">Reliability Index</span>
                </div>
              </div>

              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-text-primary uppercase tracking-wide">LIS lab results</span>
                  <span className="text-[10px] text-success-green font-bold">● Connected</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-text-primary block">{trustScores.lab}%</span>
                  <span className="text-[9px] text-text-secondary uppercase">Reliability Index</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-text-primary uppercase tracking-wide">Nursing bed board</span>
                  <span className="text-[10px] text-warning-amber font-bold">● Sync Latency (14m)</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-warning-amber block">{trustScores.bed}%</span>
                  <span className="text-[9px] text-text-secondary uppercase">Needs Attention</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Conflicts Ledger Grid */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-4 bg-accent-blue rounded-full" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">Conflicts Ledger</h3>
            </div>
            
            {/* Search Input */}
            <div className="relative w-48">
              <input
                type="text"
                placeholder="Search ledger..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/5 hover:border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-text-primary outline-none transition-all placeholder:text-text-secondary/50"
              />
              <Search className="w-3.5 h-3.5 text-text-secondary absolute left-2.5 top-2.5" />
            </div>
          </div>

          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.01] text-text-secondary">
                    <th className="p-3 font-bold uppercase tracking-wider">Entity</th>
                    <th className="p-3 font-bold uppercase tracking-wider">Patient Name</th>
                    <th className="p-3 font-bold uppercase tracking-wider">Conflict</th>
                    <th className="p-3 font-bold uppercase tracking-wider">Recommendation</th>
                    <th className="p-3 font-bold uppercase tracking-wider">Confidence</th>
                    <th className="p-3 font-bold uppercase tracking-wider">Status</th>
                    <th className="p-3 font-bold uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredConflicts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-text-secondary font-medium">
                        No active conflicts detected. All systems reconciled.
                      </td>
                    </tr>
                  ) : (
                    filteredConflicts.map((c) => {
                      const bedNum = c.description.match(/Bed-\d+|Bed\s+[A-Z]-\d+/i)?.[0] || c.id;
                      return (
                        <tr key={c.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                          <td className="p-3 font-mono font-bold text-accent-cyan">{bedNum}</td>
                          <td className="p-3 font-semibold text-text-primary">{c.patientName}</td>
                          <td className="p-3 text-text-secondary font-mono">{c.valueA} ↔ {c.valueB}</td>
                          <td className="p-3 font-medium text-text-primary">{c.recommendedSource}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider ${
                              c.confidence === 'HIGH' ? 'bg-success-green/10 text-success-green border border-success-green/20' :
                              c.confidence === 'MEDIUM' ? 'bg-warning-amber/10 text-warning-amber border border-warning-amber/20' :
                              'bg-danger-red/10 text-danger-red border border-danger-red/20'
                            }`}>
                              {c.confidence}
                            </span>
                          </td>
                          <td className="p-3"><Badge variant="info">OPEN</Badge></td>
                          <td className="p-3 text-right">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => setSelectedConflict(c)}
                              icon={Eye}
                            >
                              View Details
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Sliding Investigation side panel */}
      <AnimatePresence>
        {selectedConflict && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => { setSelectedConflict(null); setShowOverrideForm(false); }}
              className="fixed inset-0 bg-black z-40"
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-command-secondary border-l border-white/5 shadow-2xl z-50 p-6 flex flex-col justify-between overflow-y-auto"
            >
              
              <div className="flex flex-col gap-5">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-extrabold uppercase tracking-widest text-danger-red">⚠ DATA CONFLICT</span>
                    <h3 className="text-base font-bold text-text-primary mt-1 font-heading">
                      {selectedConflict.description.match(/Bed-\d+|Bed\s+[A-Z]-\d+/i)?.[0]?.toUpperCase() || selectedConflict.id}
                    </h3>
                    <span className="text-[10px] text-text-secondary mt-0.5">{selectedConflict.ward}</span>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => { setSelectedConflict(null); setShowOverrideForm(false); }}>
                    Dismiss
                  </Button>
                </div>

                {/* Patient overview */}
                <div className="flex flex-col gap-1 text-xs">
                  <span className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">Incident Subject</span>
                  <p className="text-sm font-bold text-text-primary">{selectedConflict.patientName} (MRN: {selectedConflict.mrn})</p>
                  <p className="text-text-secondary leading-relaxed mt-1">{selectedConflict.description}</p>
                </div>

                {/* Comparison Grid */}
                <div className="flex flex-col gap-2.5">
                  <span className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">Source Comparison</span>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-command-card border border-white/5">
                      <span className="text-[10px] text-text-secondary block font-bold">{selectedConflict.sourceA}</span>
                      <strong className="text-sm text-text-primary mt-1 block uppercase">{selectedConflict.valueA}</strong>
                      <span className="text-[9px] text-text-secondary block mt-1">Reliability: {selectedConflict.sourceAReliability}%</span>
                    </div>
                    <div className="p-3 rounded-lg bg-command-card border border-white/5">
                      <span className="text-[10px] text-text-secondary block font-bold">{selectedConflict.sourceB}</span>
                      <strong className="text-sm text-warning-amber mt-1 block uppercase">{selectedConflict.valueB}</strong>
                      <span className="text-[9px] text-text-secondary block mt-1">Reliability: {selectedConflict.sourceBReliability}%</span>
                    </div>
                  </div>
                </div>

                {/* System Recommendation */}
                <div className="p-4 rounded-xl border border-accent-cyan/15 bg-accent-cyan/[0.02] flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-success-green font-bold">✓</span>
                      <span className="font-bold text-accent-cyan uppercase tracking-wide">SYSTEM RECOMMENDATION</span>
                    </div>
                    <div className="relative group flex items-center gap-1 cursor-help">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider ${
                        selectedConflict.confidence === 'HIGH' ? 'bg-success-green/10 text-success-green border border-success-green/20' :
                        selectedConflict.confidence === 'MEDIUM' ? 'bg-warning-amber/10 text-warning-amber border border-warning-amber/20' :
                        'bg-danger-red/10 text-danger-red border border-danger-red/20'
                      }`}>
                        {selectedConflict.confidence} CONFIDENCE
                      </span>
                      <span className="text-[9px] text-text-secondary/50 font-bold bg-white/5 w-3.5 h-3.5 rounded-full flex items-center justify-center">?</span>
                      <div className="absolute right-0 bottom-6 hidden group-hover:block bg-command-card border border-white/10 p-2.5 rounded-lg w-48 text-[9px] leading-relaxed text-text-secondary shadow-xl z-55">
                        Confidence indicates how strongly the available data supports the system recommendation.
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-text-primary leading-relaxed mt-1">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] text-text-secondary uppercase">Recommended Status</span>
                      <strong className="text-sm text-text-primary uppercase tracking-wide">{selectedConflict.recommendedValue}</strong>
                    </div>
                    <div className="flex flex-col gap-0.5 mt-2">
                      <span className="text-[9px] text-text-secondary uppercase">Recommended Source</span>
                      <strong className="text-xs text-accent-cyan uppercase tracking-wide">{selectedConflict.recommendedSource}</strong>
                    </div>
                  </div>
                </div>

                {/* Why decision panel */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">Why?</span>
                  <div className="p-3.5 rounded-xl bg-white/[0.01] border border-white/5 text-xs text-text-secondary leading-relaxed">
                    {selectedConflict.explanation}
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="border-t border-white/5 pt-5 mt-6 flex flex-col gap-3">
                {!showOverrideForm ? (
                  <>
                    <Button 
                      variant="primary" 
                      className="w-full" 
                      onClick={async () => {
                        const action = selectedConflict.recommendedSource === 'Epic HIS' ? 'approve_his' : 'approve_bed';
                        await handleResolve(action);
                      }}
                      icon={CheckCircle}
                    >
                      Accept Recommendation
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setShowOverrideForm(true)}
                      icon={AlertTriangle}
                    >
                      Review Manually
                    </Button>
                  </>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col gap-3 w-full"
                  >
                    <span className="text-[10px] font-bold text-text-secondary uppercase">Which source is correct?</span>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => handleResolve('approve_his')}
                      >
                        Epic HIS — {selectedConflict.valueA}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => handleResolve('approve_bed')}
                      >
                        Bed Board — {selectedConflict.valueB}
                      </Button>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="w-full mt-1"
                      onClick={() => setShowOverrideForm(false)}
                    >
                      Cancel Manual Review
                    </Button>
                  </motion.div>
                )}
              </div>

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

export default Reconciliation;
