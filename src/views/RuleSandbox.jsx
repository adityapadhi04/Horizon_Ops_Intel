import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { useStore } from '../store/useStore';
import { 
  Play, RotateCcw, AlertTriangle, CheckCircle, Info, Sliders, ArrowRight, Zap, RefreshCw, ToggleLeft, ToggleRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

// Simulation calculation outcomes mapped to configurations
const calculateOutcomes = (primary, secondary) => {
  if (primary === 'his' && secondary === 'bed') {
    return {
      resolved: 27,
      accuracy: 96,
      wrong: 1,
      safety: 'safe', // safe, review, dangerous
      title: 'SAFE TO DEPLOY',
      message: 'This rule performs reliably in previous similar situations.'
    };
  }
  if (primary === 'bed' && secondary === 'his') {
    return {
      resolved: 20,
      accuracy: 88,
      wrong: 4,
      safety: 'review',
      title: 'REVIEW RECOMMENDED',
      message: 'Some situations may require human verification.'
    };
  }
  if (primary === 'lab' && secondary === 'his') {
    return {
      resolved: 24,
      accuracy: 91,
      wrong: 2,
      safety: 'safe',
      title: 'SAFE TO DEPLOY',
      message: 'This rule performs reliably in previous similar situations.'
    };
  }
  // Fallbacks
  return {
    resolved: 15,
    accuracy: 78,
    wrong: 5,
    safety: 'dangerous',
    title: 'NOT RECOMMENDED',
    message: 'High risk detected. Accuracy fails safety threshold.'
  };
};

export const RuleSandbox = () => {
  const { loadAll } = useStore();

  // Rules variables
  const [primarySource, setPrimarySource] = useState('his');
  const [secondarySource, setSecondarySource] = useState('bed');
  const [location, setLocation] = useState('Ward C');
  const [shift, setShift] = useState('Night Shift');

  // Simulation states
  const [simulating, setSimulating] = useState(false);
  const [simulated, setSimulated] = useState(true);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Active deployed rules (session state)
  const [activeRules, setActiveRules] = useState([
    { id: 'ar-1', name: 'Ward C Night Shift Bed Conflict', primary: 'Epic HIS Admissions', location: 'Ward C', shift: 'Night Shift', accuracy: 96, enabled: true }
  ]);

  // Dynamic shift time description
  const getShiftTimeRange = () => {
    switch (shift) {
      case 'Morning Shift': return '06:00 – 14:00';
      case 'Afternoon Shift': return '14:00 – 22:00';
      case 'Night Shift': return '18:00 – 06:00';
      default: return 'All Day';
    }
  };

  // Quick templates triggers
  const applyTemplate = (type) => {
    if (type === 'bed') {
      setPrimarySource('his');
      setSecondarySource('bed');
      setLocation('Ward C');
      setShift('Night Shift');
    } else if (type === 'lab') {
      setPrimarySource('lab');
      setSecondarySource('his');
      setLocation('All Hospital');
      setShift('All Day');
    } else if (type === 'admission') {
      setPrimarySource('his');
      setSecondarySource('bed');
      setLocation('Ward A');
      setShift('Morning Shift');
    }
    // Re-simulate on template click
    setSimulating(true);
    setTimeout(() => {
      setSimulating(false);
      setSimulated(true);
    }, 400);
  };

  const handleRunSimulation = () => {
    setSimulating(true);
    setSimulated(false);
    setTimeout(() => {
      setSimulating(false);
      setSimulated(true);
    }, 1000);
  };

  const handleReset = () => {
    setPrimarySource('his');
    setSecondarySource('bed');
    setLocation('Ward C');
    setShift('Night Shift');
    setSimulated(false);
  };

  const handleDeploy = async () => {
    const outcomes = calculateOutcomes(primarySource, secondarySource);
    const newRuleName = `${location} ${shift} ${primarySource === 'his' ? 'HIS' : 'Bed'} Conflict`;

    // 1. Post deployment transaction log to Audit Trail
    try {
      await axios.post('/api/audit/log', {
        action: 'Reconciliation Rule Deployed',
        target: 'Rules Engine',
        details: `Deployed priority rule for ${location} (${shift}): Trust ${primarySource === 'his' ? 'Epic HIS Admissions' : 'Nursing Bed Board'} first. Expected Accuracy: ${outcomes.accuracy}%.`,
        resolvedBy: 'Sarah Jenkins (Operations)'
      });
      await loadAll();
    } catch (err) {
      console.error("Error logging rule deployment:", err);
    }

    // 2. Add to active rules state
    const newRule = {
      id: `ar-${Date.now()}`,
      name: newRuleName,
      primary: primarySource === 'his' ? 'Epic HIS Admissions' : (primarySource === 'lab' ? 'LIS Lab Results' : 'Nursing Bed Board'),
      location,
      shift,
      accuracy: outcomes.accuracy,
      enabled: true
    };
    setActiveRules(prev => [newRule, ...prev]);

    // 3. Clear modal and show success toast
    setShowDeployModal(false);
    setToastMsg('✓ Rule deployed successfully and recorded in Audit Trail');
    setTimeout(() => setToastMsg(''), 4000);
  };

  const toggleActiveRule = (id) => {
    setActiveRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  // Outcomes metrics
  const outcomes = calculateOutcomes(primarySource, secondarySource);
  const autoResolvedDiff = outcomes.resolved - 11;
  const accuracyDiff = outcomes.accuracy - 82;

  // Source names resolver
  const getSourceName = (src) => {
    if (src === 'his') return 'Epic HIS Admissions';
    if (src === 'lab') return 'LIS Lab Results';
    return 'Nursing Bed Board';
  };

  return (
    <div className="flex flex-col gap-6 relative">
      
      {/* PAGE HEADER */}
      <div className="border-b border-white/5 pb-4">
        <h2 className="text-2xl font-extrabold tracking-tight text-white font-heading">
          Rule Testing Center
        </h2>
        <p className="text-xs text-text-secondary mt-1 flex items-center gap-1.5">
          Test how the system should handle conflicting hospital data before applying the rule.
          <span data-tooltip="Rules help the system decide which data source to trust when hospital systems disagree.">
            <Info className="w-3.5 h-3.5 text-text-secondary cursor-help hover:text-text-primary" />
          </span>
        </p>
      </div>

      {/* QUICK RULE TEMPLATES */}
      <div className="flex flex-col gap-2">
        <span className="text-[9px] font-bold text-text-secondary uppercase tracking-widest">Quick Rule Templates</span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          
          <button 
            onClick={() => applyTemplate('bed')}
            className="p-3 text-left rounded-xl bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 hover:border-accent-cyan/20 transition-all flex items-start gap-3 cursor-pointer group"
          >
            <Zap className="w-4 h-4 text-accent-cyan mt-0.5 group-hover:scale-110 transition-transform" />
            <div>
              <strong className="text-xs text-text-primary font-bold block">🛏 Bed Status Conflict</strong>
              <span className="text-[10px] text-text-secondary mt-0.5 block">When two systems show different bed availability.</span>
            </div>
          </button>

          <button 
            onClick={() => applyTemplate('lab')}
            className="p-3 text-left rounded-xl bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 hover:border-accent-cyan/20 transition-all flex items-start gap-3 cursor-pointer group"
          >
            <Zap className="w-4 h-4 text-accent-purple mt-0.5 group-hover:scale-110 transition-transform" />
            <div>
              <strong className="text-xs text-text-primary font-bold block">🧪 Laboratory Delay</strong>
              <span className="text-[10px] text-text-secondary mt-0.5 block">When lab results are delayed between systems.</span>
            </div>
          </button>

          <button 
            onClick={() => applyTemplate('admission')}
            className="p-3 text-left rounded-xl bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 hover:border-accent-cyan/20 transition-all flex items-start gap-3 cursor-pointer group"
          >
            <Zap className="w-4 h-4 text-accent-blue mt-0.5 group-hover:scale-110 transition-transform" />
            <div>
              <strong className="text-xs text-text-primary font-bold block">👤 Admission Conflict</strong>
              <span className="text-[10px] text-text-secondary mt-0.5 block">When patient admission status differs across systems.</span>
            </div>
          </button>

        </div>
      </div>

      {/* TWO PANEL CONFIGURATION GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        
        {/* Left Column: Create Rule */}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle>Create a Rule</CardTitle>
            <CardDescription>Choose when and how the system should resolve a data conflict</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-xs">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-text-secondary uppercase">Data Source to Trust First</label>
                <select 
                  value={primarySource}
                  onChange={e => setPrimarySource(e.target.value)}
                  className="bg-command-card border border-white/5 rounded-lg p-2.5 text-text-primary outline-none transition-all focus:border-accent-cyan/20"
                >
                  <option value="his">Epic HIS Admissions</option>
                  <option value="bed">Nursing Bed Board</option>
                  <option value="lab">LIS Lab Results</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-text-secondary uppercase">Compare With</label>
                <select 
                  value={secondarySource}
                  onChange={e => setSecondarySource(e.target.value)}
                  className="bg-command-card border border-white/5 rounded-lg p-2.5 text-text-primary outline-none transition-all focus:border-accent-cyan/20"
                >
                  <option value="his">Epic HIS Admissions</option>
                  <option value="bed">Nursing Bed Board</option>
                  <option value="lab">LIS Lab Results</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-text-secondary uppercase">Apply this rule to</label>
                <select 
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="bg-command-card border border-white/5 rounded-lg p-2.5 text-text-primary outline-none transition-all focus:border-accent-cyan/20"
                >
                  <option value="All Hospital">All Hospital</option>
                  <option value="Ward A">Ward A</option>
                  <option value="Ward B">Ward B</option>
                  <option value="Ward C">Ward C</option>
                  <option value="ICU">ICU</option>
                  <option value="Emergency Department">Emergency Department</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-text-secondary uppercase">When should this rule apply?</label>
                <select 
                  value={shift}
                  onChange={e => setShift(e.target.value)}
                  className="bg-command-card border border-white/5 rounded-lg p-2.5 text-text-primary outline-none transition-all focus:border-accent-cyan/20"
                >
                  <option value="All Day">All Day</option>
                  <option value="Morning Shift">Morning Shift</option>
                  <option value="Afternoon Shift">Afternoon Shift</option>
                  <option value="Night Shift">Night Shift</option>
                </select>
                {shift !== 'All Day' && (
                  <span className="text-[9px] text-text-secondary/70 italic mt-0.5">Time window: {getShiftTimeRange()}</span>
                )}
              </div>
            </div>

            {/* RULE PREVIEW VISUAL BLOCK */}
            <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] flex flex-col gap-1 text-[10px] font-mono leading-relaxed">
              <span className="text-[9px] font-bold font-sans text-text-secondary uppercase block mb-1">Live Logic Preview</span>
              <div><span className="text-accent-purple font-bold">IF:</span> Ward = <span className="text-accent-cyan font-bold">"{location}"</span></div>
              <div><span className="text-accent-purple font-bold">AND:</span> Shift = <span className="text-accent-cyan font-bold">"{shift}"</span></div>
              <div><span className="text-accent-purple font-bold">AND:</span> {primarySource.toUpperCase()} and {secondarySource.toUpperCase()} disagree</div>
              <div><span className="text-accent-purple font-bold">THEN:</span> Prioritize <span className="text-success-green font-bold">"{getSourceName(primarySource)}"</span></div>
            </div>

            <div className="flex gap-3 mt-2">
              <Button 
                variant="outline" 
                onClick={handleReset} 
                className="flex-1"
                icon={RotateCcw}
              >
                Reset Rule
              </Button>
              <Button 
                variant="primary" 
                onClick={handleRunSimulation} 
                disabled={simulating}
                className="flex-2"
                icon={Play}
              >
                {simulating ? 'Running...' : 'Run Simulation'}
              </Button>
            </div>

          </CardContent>
        </Card>

        {/* Right Column: Simulation Outcomes */}
        <Card className="flex flex-col justify-between">
          <CardHeader className="border-b border-white/5 pb-4">
            <CardTitle>What Would Happen?</CardTitle>
            <CardDescription>Results based on similar hospital data conflicts</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col justify-between flex-1 py-5">
            {simulating ? (
              <div className="flex flex-col items-center justify-center flex-1 gap-3 py-14 text-center">
                <RefreshCw className="w-8 h-8 text-accent-cyan animate-spin" />
                <span className="text-xs font-semibold text-text-secondary">Testing rule against recent hospital conflicts...</span>
              </div>
            ) : simulated ? (
              <div className="flex flex-col gap-5 flex-1 justify-between">
                
                {/* 3 Main Metrics */}
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-white/[0.01] border border-white/5 rounded-lg flex flex-col justify-between h-20">
                    <span className="text-[9px] text-text-secondary uppercase font-bold">Conflicts Resolved</span>
                    <strong className="text-lg font-extrabold text-white">{outcomes.resolved}</strong>
                    <span className="text-[8.5px] text-success-green font-bold">+{autoResolvedDiff} improvements</span>
                  </div>

                  <div className="p-3 bg-white/[0.01] border border-white/5 rounded-lg flex flex-col justify-between h-20">
                    <span className="text-[9px] text-text-secondary uppercase font-bold">Expected Accuracy</span>
                    <strong className="text-lg font-extrabold text-accent-cyan">{outcomes.accuracy}%</strong>
                    <span className="text-[8.5px] text-text-secondary">Previous cases</span>
                  </div>

                  <div className="p-3 bg-white/[0.01] border border-white/5 rounded-lg flex flex-col justify-between h-20">
                    <span className="text-[9px] text-text-secondary uppercase font-bold">Wrong Decisions</span>
                    <strong className="text-lg font-extrabold text-danger-red">{outcomes.wrong}</strong>
                    <span className="text-[8.5px] text-text-secondary">Out of simulated</span>
                  </div>
                </div>

                {/* BEFORE VS AFTER COMPARISON */}
                <div className="p-3 bg-white/[0.01] border border-white/5 rounded-lg flex flex-col gap-2 text-[10px]">
                  <span className="font-bold text-text-primary uppercase tracking-wider text-[9px] block">Current Rule vs New Rule</span>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border-r border-white/5 pr-4">
                      <span className="text-text-secondary block uppercase">Current Rule</span>
                      <div className="flex justify-between mt-1 text-text-primary">
                        <span>Auto Resolved: <strong>11</strong></span>
                        <span>Accuracy: <strong>82%</strong></span>
                      </div>
                    </div>
                    <div>
                      <span className="text-accent-cyan block uppercase">Proposed Rule</span>
                      <div className="flex justify-between mt-1 text-accent-cyan">
                        <span>Auto Resolved: <strong>{outcomes.resolved}</strong></span>
                        <span>Accuracy: <strong>{outcomes.accuracy}%</strong></span>
                      </div>
                    </div>
                  </div>
                  
                  <span className="h-px bg-white/5 mt-1" />
                  
                  <div className="flex gap-4 font-bold text-success-green text-[9px]">
                    <span>↑ +{autoResolvedDiff} more conflicts resolved</span>
                    <span>↑ +{accuracyDiff}% better accuracy</span>
                  </div>
                </div>

                {/* IS THIS RULE SAFE SECTION */}
                <div className="flex items-center justify-between p-3 rounded-lg border flex-wrap gap-3 bg-white/[0.01] border-white/5">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-text-secondary uppercase font-bold">Is This Rule Safe?</span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`w-2 h-2 rounded-full ${outcomes.safety === 'safe' ? 'bg-success-green animate-pulse' : (outcomes.safety === 'review' ? 'bg-warning-amber' : 'bg-danger-red')}`} />
                      <span className="font-bold text-text-primary text-xs uppercase">{outcomes.title}</span>
                    </div>
                    <span className="text-[9px] text-text-secondary mt-1">{outcomes.message}</span>
                  </div>
                  {outcomes.safety !== 'dangerous' && (
                    <Button size="sm" onClick={() => setShowDeployModal(true)}>Deploy Rule</Button>
                  )}
                </div>

              </div>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 py-14 text-center text-text-secondary text-xs">
                Configure rule specifications and click Run Simulation.
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* EXAMPLE SCENARIO */}
      {simulated && (
        <Card>
          <CardHeader>
            <CardTitle>Example Scenario</CardTitle>
            <CardDescription>Visual demonstration of how this proposed rule handles a sample conflict</CardDescription>
          </CardHeader>
          <CardContent className="text-xs leading-relaxed flex flex-col gap-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-white/[0.01] border border-white/5">
              <div>
                <span className="text-[9px] text-text-secondary uppercase font-bold">Resource</span>
                <strong className="text-xs text-text-primary mt-1 block">Bed C301</strong>
              </div>
              <div>
                <span className="text-[9px] text-text-secondary uppercase font-bold">Epic HIS admissions</span>
                <strong className="text-xs text-text-primary mt-1 block uppercase text-success-green">Vacant</strong>
                <span className="text-[9px] text-text-secondary mt-0.5 block">Discharge logged: 10:24 AM</span>
              </div>
              <div>
                <span className="text-[9px] text-text-secondary uppercase font-bold">Nursing Bed Board</span>
                <strong className="text-xs text-warning-amber mt-1 block uppercase">Occupied</strong>
                <span className="text-[9px] text-text-secondary mt-0.5 block">Board updated: 10:05 AM</span>
              </div>
              <div>
                <span className="text-[9px] text-text-secondary uppercase font-bold">System Decision</span>
                <strong className="text-xs text-accent-cyan mt-1 block uppercase">Vacant (HIS Prioritized)</strong>
                <span className="text-[9px] text-text-secondary mt-0.5 block">Rules trust HIS during Night Shifts.</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* HOW WAS THIS RESULT CALCULATED */}
      <Card>
        <CardHeader>
          <CardTitle>How Was This Result Calculated?</CardTitle>
          <CardDescription>Rules validation algorithm flowchart</CardDescription>
        </CardHeader>
        <CardContent className="text-xs text-text-secondary leading-relaxed flex flex-col gap-2">
          <ol className="list-decimal pl-4 flex flex-col gap-1">
            <li>Similar past conflicts (such as Ward C shift overlaps) were compiled from database history.</li>
            <li>The proposed source priority rule was tested against them chronologically.</li>
            <li>The simulated outcome accuracies were compared directly with the active default rule.</li>
          </ol>
        </CardContent>
      </Card>

      {/* ACTIVE RECONCILIATION RULES */}
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">Active Reconciliation Rules</h3>
          <p className="text-[10px] text-text-secondary mt-0.5">Reconciliation triggers currently deployed in operations</p>
        </div>
        
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.01] text-text-secondary">
                  <th className="p-3 font-bold uppercase tracking-wider">Rule Name</th>
                  <th className="p-3 font-bold uppercase tracking-wider">Priority Authority</th>
                  <th className="p-3 font-bold uppercase tracking-wider">Target Scope</th>
                  <th className="p-3 font-bold uppercase tracking-wider">Historical Accuracy</th>
                  <th className="p-3 font-bold uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeRules.map((rule) => (
                  <tr key={rule.id} className={`border-b border-white/5 hover:bg-white/[0.01] transition-all ${!rule.enabled ? 'opacity-50' : ''}`}>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${rule.enabled ? 'bg-success-green animate-pulse' : 'bg-white/10'}`} />
                        <span className="font-bold text-text-primary">{rule.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-text-secondary">{rule.primary}</td>
                    <td className="p-3">
                      <Badge variant="neutral">{rule.location} • {rule.shift}</Badge>
                    </td>
                    <td className="p-3 font-semibold text-accent-cyan">{rule.accuracy}%</td>
                    <td className="p-3 text-right">
                      <button 
                        onClick={() => toggleActiveRule(rule.id)}
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

      {/* DEPLOY RULE CONFIRMATION MODAL */}
      <AnimatePresence>
        {showDeployModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeployModal(false)}
              className="fixed inset-0 bg-black z-45"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 m-auto w-full max-w-sm h-fit bg-command-secondary border border-white/5 rounded-xl p-5 shadow-2xl z-50 flex flex-col gap-4 text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent-cyan/15 border border-accent-cyan/20 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-accent-cyan" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-text-secondary uppercase">Confirmation</span>
                  <h3 className="text-sm font-bold text-text-primary">Deploy This Rule?</h3>
                </div>
              </div>
              
              <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-white/[0.01] border border-white/5 leading-relaxed text-[11px] text-text-secondary">
                <div>Rule: <strong className="text-text-primary">Prioritize {getSourceName(primarySource)}</strong></div>
                <div>Location: <strong className="text-text-primary">{location}</strong></div>
                <div>Shift: <strong className="text-text-primary">{shift}</strong></div>
                <div>Expected Accuracy: <strong className="text-accent-cyan">{outcomes.accuracy}%</strong></div>
              </div>

              <div className="flex gap-2 justify-end mt-2">
                <Button size="sm" variant="ghost" onClick={() => setShowDeployModal(false)}>Cancel</Button>
                <Button size="sm" variant="primary" onClick={handleDeploy}>Deploy Rule</Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Toast Success Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 bg-accent-cyan text-command-base font-bold text-xs px-4 py-2.5 rounded-lg shadow-xl shadow-accent-cyan/10 animate-fade-in z-50">
          {toastMsg}
        </div>
      )}

    </div>
  );
};

export default RuleSandbox;
