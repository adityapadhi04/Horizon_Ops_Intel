import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { useStore } from '../store/useStore';
import { 
  Heart, Database, Key, Sliders, ArrowDown, ArrowRight, CheckCircle, AlertTriangle, ShieldCheck, RefreshCw, Bell, User, Clock, Settings, ToggleRight, ToggleLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

export const SettingsView = ({ setCurrentTab }) => {
  const { loadAll } = useStore();

  // Baseline weights configuration
  const [weights, setWeights] = useState({ his: 40, lab: 40, bed: 20 });
  const [originalWeights, setOriginalWeights] = useState({ his: 40, lab: 40, bed: 20 });
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  // Connection testing states
  const [connectionTests, setConnectionTests] = useState({
    his: { status: 'idle', time: null, msg: '' },
    lab: { status: 'idle', time: null, msg: '' },
    bed: { status: 'idle', time: null, msg: '' }
  });

  // Modal configuration states
  const [activeModalConfig, setActiveModalConfig] = useState(null); // his, lab, bed
  const [endpointInput, setEndpointInput] = useState('');

  // Toggles states
  const [automation, setAutomation] = useState({ resolve: true, alerts: true, sync: true });
  const [notifications, setNotifications] = useState({ critical: true, warning: true, updates: false });

  // Settings Logs session state
  const [settingsLogs, setSettingsLogs] = useState([
    { id: 1, time: '2 minutes ago', text: 'Trust priority configuration updated' },
    { id: 2, time: 'Today, 10:24 AM', text: 'Epic HIS connection tested successfully' },
    { id: 3, time: 'Yesterday', text: 'Real-time alerts enabled' }
  ]);

  const [toastMsg, setToastMsg] = useState('');

  // Weight changes selectors
  const adjustWeight = (key, delta) => {
    setWeights(prev => {
      const newVal = Math.max(0, Math.min(100, prev[key] + delta));
      const nextWeights = { ...prev, [key]: newVal };
      setUnsavedChanges(true);
      return nextWeights;
    });
  };

  const totalWeight = weights.his + weights.lab + weights.bed;
  const isBalanced = totalWeight === 100;

  // Connection testing action
  const handleTestConnection = (serviceKey) => {
    setConnectionTests(prev => ({
      ...prev,
      [serviceKey]: { status: 'testing', time: null, msg: 'Testing connection...' }
    }));

    setTimeout(() => {
      const delay = Math.random() > 0.8;
      setConnectionTests(prev => ({
        ...prev,
        [serviceKey]: { 
          status: delay ? 'warning' : 'success', 
          time: delay ? '1.8s' : '124ms', 
          msg: delay ? 'Connection Delayed' : 'Connection Successful'
        }
      }));

      // Log settings activity
      const logName = serviceKey === 'his' ? 'Epic HIS' : (serviceKey === 'lab' ? 'Cerner Laboratory' : 'Nursing Bed Board');
      setSettingsLogs(prev => [
        { id: Date.now(), time: 'Just now', text: `${logName} connection tested successfully` },
        ...prev
      ]);
    }, 1200);
  };

  // Open endpoint configuration modal
  const handleOpenConfig = (serviceKey) => {
    setActiveModalConfig(serviceKey);
    if (serviceKey === 'his') setEndpointInput('https://api.epic-sync.horizon.org/v2/admissions');
    else if (serviceKey === 'lab') setEndpointInput('https://api.cerner-lis.horizon.org/hl7/v1/orders');
    else setEndpointInput('https://api.bed-sync.horizon.org/v1/layout');
  };

  // Save Modal Endpoint settings
  const handleSaveConfig = () => {
    setActiveModalConfig(null);
    setToastMsg('✓ Connection endpoints saved successfully');
    setTimeout(() => setToastMsg(''), 4000);
  };

  // Reset Changes
  const handleDiscardChanges = () => {
    setWeights(originalWeights);
    setUnsavedChanges(false);
  };

  // Save Settings
  const handleSaveAll = async () => {
    if (!isBalanced) return;

    // 1. Send configuration transaction log to Audit Trail
    try {
      await axios.post('/api/audit/log', {
        action: 'Settings Configuration Saved',
        target: 'System Settings',
        details: `Overall trust prioritizations updated: HIS ${weights.his}%, Labs ${weights.lab}%, Bed Board ${weights.bed}%.`,
        resolvedBy: 'Sarah Jenkins (Operations Lead)'
      });
      await loadAll();
    } catch (err) {
      console.error("Error logging settings updates:", err);
    }

    // 2. Append settings log
    setSettingsLogs(prev => [
      { id: Date.now(), time: 'Just now', text: 'Trust priority configuration updated' },
      ...prev
    ]);

    setOriginalWeights(weights);
    setUnsavedChanges(false);
    setToastMsg('✓ Settings saved successfully and recorded in Audit Trail');
    setTimeout(() => setToastMsg(''), 4000);
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto pb-20 relative">
      
      {/* PAGE HEADER */}
      <div className="border-b border-white/5 pb-4 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white font-heading">
            System Control Center
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Manage system intelligence, connected hospital services, and administrator preferences.
          </p>
        </div>

        {/* Systems status strip */}
        <div className="flex items-center gap-2 bg-success-green/10 border border-success-green/20 px-3 py-1.5 rounded-lg text-[10px] font-bold text-success-green tracking-wider uppercase">
          <span className="w-2 h-2 bg-success-green rounded-full animate-pulse" />
          <span>● ALL SYSTEMS HEALTHY</span>
          <span className="text-text-secondary/80 lowercase font-medium border-l border-white/10 pl-2">3 services connected</span>
        </div>
      </div>

      {/* SYSTEM HEALTH OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-success-green/15 border border-success-green/20 flex items-center justify-center text-success-green">
            <ShieldCheck className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex flex-col text-xs">
            <span className="text-[9px] font-bold text-text-secondary uppercase">System Health</span>
            <strong className="text-text-primary mt-0.5">● Operational</strong>
            <span className="text-[9px] text-text-secondary">All services running normally</span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-accent-cyan/15 border border-accent-cyan/20 flex items-center justify-center text-accent-cyan">
            <Database className="w-5 h-5" />
          </div>
          <div className="flex flex-col text-xs">
            <span className="text-[9px] font-bold text-text-secondary uppercase">Connected Services</span>
            <strong className="text-text-primary mt-0.5">3 / 3</strong>
            <span className="text-[9px] text-text-secondary">HIS, Laboratory, Bed Board</span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-accent-purple/15 border border-accent-purple/20 flex items-center justify-center text-accent-purple">
            <Clock className="w-5 h-5" />
          </div>
          <div className="flex flex-col text-xs">
            <span className="text-[9px] font-bold text-text-secondary uppercase">Last Configuration</span>
            <strong className="text-text-primary mt-0.5">2 minutes ago</strong>
            <span className="text-[9px] text-text-secondary">Changes saved successfully</span>
          </div>
        </Card>
      </div>

      {/* DATA TRUST PRIORITIES */}
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">Data Trust Priorities</h3>
          <p className="text-[10px] text-text-secondary mt-0.5">Control how much each hospital system influences automated decisions.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Epic HIS Admissions Priority Card */}
          <Card className="p-5 flex flex-col justify-between min-h-[140px] text-xs">
            <div>
              <div className="flex justify-between items-center">
                <strong className="text-text-primary font-bold">🏥 EPIC HIS ADMISSIONS</strong>
                <span className="font-mono font-bold text-accent-cyan">{weights.his}%</span>
              </div>
              <p className="text-[10px] text-text-secondary mt-1">Primary patient and admission data</p>
            </div>
            
            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-3">
              <div className="bg-accent-cyan h-full rounded-full" style={{ width: `${weights.his}%` }} />
            </div>

            <div className="flex justify-between items-center mt-3">
              <button onClick={() => adjustWeight('his', -5)} className="w-7 h-7 bg-white/5 hover:bg-white/10 border border-white/5 text-text-primary font-bold rounded-lg cursor-pointer flex items-center justify-center">-</button>
              <span className="text-[10px] font-bold text-text-primary">{weights.his}%</span>
              <button onClick={() => adjustWeight('his', 5)} className="w-7 h-7 bg-white/5 hover:bg-white/10 border border-white/5 text-text-primary font-bold rounded-lg cursor-pointer flex items-center justify-center">+</button>
            </div>
          </Card>

          {/* Cerner LIS Laboratory Priority Card */}
          <Card className="p-5 flex flex-col justify-between min-h-[140px] text-xs">
            <div>
              <div className="flex justify-between items-center">
                <strong className="text-text-primary font-bold">🧪 CERNER LIS LABORATORY</strong>
                <span className="font-mono font-bold text-accent-purple">{weights.lab}%</span>
              </div>
              <p className="text-[10px] text-text-secondary mt-1">Laboratory orders and results</p>
            </div>
            
            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-3">
              <div className="bg-accent-purple h-full rounded-full" style={{ width: `${weights.lab}%` }} />
            </div>

            <div className="flex justify-between items-center mt-3">
              <button onClick={() => adjustWeight('lab', -5)} className="w-7 h-7 bg-white/5 hover:bg-white/10 border border-white/5 text-text-primary font-bold rounded-lg cursor-pointer flex items-center justify-center">-</button>
              <span className="text-[10px] font-bold text-text-primary">{weights.lab}%</span>
              <button onClick={() => adjustWeight('lab', 5)} className="w-7 h-7 bg-white/5 hover:bg-white/10 border border-white/5 text-text-primary font-bold rounded-lg cursor-pointer flex items-center justify-center">+</button>
            </div>
          </Card>

          {/* Nursing Bed Board Priority Card */}
          <Card className="p-5 flex flex-col justify-between min-h-[140px] text-xs">
            <div>
              <div className="flex justify-between items-center">
                <strong className="text-text-primary font-bold">🛏 NURSING BED BOARD</strong>
                <span className="font-mono font-bold text-success-green">{weights.bed}%</span>
              </div>
              <p className="text-[10px] text-text-secondary mt-1">Bed availability and ward updates</p>
            </div>
            
            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-3">
              <div className="bg-success-green h-full rounded-full" style={{ width: `${weights.bed}%` }} />
            </div>

            <div className="flex justify-between items-center mt-3">
              <button onClick={() => adjustWeight('bed', -5)} className="w-7 h-7 bg-white/5 hover:bg-white/10 border border-white/5 text-text-primary font-bold rounded-lg cursor-pointer flex items-center justify-center">-</button>
              <span className="text-[10px] font-bold text-text-primary">{weights.bed}%</span>
              <button onClick={() => adjustWeight('bed', 5)} className="w-7 h-7 bg-white/5 hover:bg-white/10 border border-white/5 text-text-primary font-bold rounded-lg cursor-pointer flex items-center justify-center">+</button>
            </div>
          </Card>

        </div>

        {/* Dynamic Total Configuration Validation banner */}
        <div className={`p-4 rounded-xl border flex items-center justify-between text-xs font-bold ${
          isBalanced 
            ? 'bg-success-green/5 border-success-green/10 text-success-green' 
            : 'bg-danger-red/5 border-danger-red/10 text-danger-red animate-pulse'
        }`}>
          <span>TOTAL CONFIGURATION WEIGHT: {totalWeight}%</span>
          <span>{isBalanced ? '✓ Configuration Balanced' : `⚠ Total must equal 100% (currently ${totalWeight}%)`}</span>
        </div>
      </div>

      {/* HOW THE SYSTEM USES THESE PRIORITIES */}
      <Card>
        <CardHeader>
          <CardTitle>How the System Uses These Priorities</CardTitle>
          <CardDescription>Decision weighting flowchart</CardDescription>
        </CardHeader>
        <CardContent className="p-5 flex flex-col gap-4 text-center text-xs text-text-secondary">
          <div className="flex items-center justify-between flex-wrap gap-2 text-[10px] font-bold text-text-secondary max-w-xl mx-auto">
            <span>Epic HIS ({weights.his}%)</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-20" />
            <span>Cerner LIS ({weights.lab}%)</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-20" />
            <span>Nursing Board ({weights.bed}%)</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-20" />
            <span className="text-accent-cyan">DATA RECONCILIATION ENGINE</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-20" />
            <span className="text-success-green">FINAL DECISION</span>
          </div>
          <p className="text-[10px] text-text-secondary max-w-md mx-auto leading-relaxed border-t border-white/5 pt-3">
            "Higher priority sources have greater influence when hospital systems provide conflicting information."
          </p>
        </CardContent>
      </Card>

      {/* CONNECTED HOSPITAL SYSTEMS */}
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">Connected Hospital Systems</h3>
          <p className="text-[10px] text-text-secondary mt-0.5">Monitor and manage systems sharing operational data.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { key: 'his', title: '🏥 EPIC HIS', desc: 'Admissions and patient records', lastSync: '2 seconds ago' },
            { key: 'lab', title: '🧪 CERNER LABORATORY', desc: 'Laboratory orders and results', lastSync: '5 seconds ago' },
            { key: 'bed', title: '🛏 NURSING BED BOARD', desc: 'Bed availability and ward updates', lastSync: '8 seconds ago' }
          ].map(sys => {
            const test = connectionTests[sys.key];
            return (
              <Card key={sys.key} className="p-5 flex flex-col justify-between min-h-[150px] text-xs">
                <div>
                  <div className="flex justify-between items-center">
                    <strong className="text-text-primary font-bold">{sys.title}</strong>
                    <span className="w-2.5 h-2.5 rounded-full bg-success-green block animate-pulse" />
                  </div>
                  <span className="text-[9px] text-success-green uppercase font-bold mt-1 block">● Connected</span>
                  <p className="text-[10px] text-text-secondary mt-2">{sys.desc}</p>
                  <span className="text-[9px] text-text-secondary/70 italic mt-1 block">Last Sync: {sys.lastSync}</span>
                  
                  {test.status !== 'idle' && (
                    <div className="mt-2 p-2 rounded-lg bg-white/5 border border-white/5 text-[9px] leading-relaxed">
                      {test.status === 'testing' ? (
                        <div className="flex items-center gap-1.5 text-text-secondary">
                          <span className="w-2.5 h-2.5 border border-accent-cyan border-t-transparent rounded-full animate-spin" />
                          <span>Testing connection...</span>
                        </div>
                      ) : (
                        <div className="flex justify-between font-semibold">
                          <span className={test.status === 'success' ? 'text-success-green' : 'text-warning-amber'}>
                            {test.msg}
                          </span>
                          <span className="text-text-secondary">Latency: {test.time}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-4 pt-3 border-t border-white/5">
                  <Button size="sm" variant="ghost" onClick={() => handleTestConnection(sys.key)} className="flex-1">Test Link</Button>
                  <Button size="sm" variant="outline" onClick={() => handleOpenConfig(sys.key)} className="flex-1">Configure</Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* AUTOMATION SETTINGS & NOTIFICATIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Automation Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Automation Settings</CardTitle>
            <CardDescription>Control how the platform responds to operational events</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-xs">
            {[
              { key: 'resolve', label: 'AUTO-RESOLVE CONFLICTS', desc: 'Allow high-confidence conflicts to be resolved automatically.' },
              { key: 'alerts', label: 'REAL-TIME ALERTS', desc: 'Notify administrators when important operational thresholds are reached.' },
              { key: 'sync', label: 'LIVE DATA SYNCHRONIZATION', desc: 'Continuously update hospital operational data.' }
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between gap-4 py-2 border-b border-white/5 last:border-b-0">
                <div className="flex flex-col">
                  <span className="font-bold text-text-primary">{item.label}</span>
                  <span className="text-[10px] text-text-secondary mt-0.5">{item.desc}</span>
                </div>
                <button 
                  onClick={() => setAutomation(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                  className="focus:outline-none"
                >
                  {automation[item.key] ? <ToggleRight className="w-8 h-8 text-accent-cyan" /> : <ToggleLeft className="w-8 h-8 text-white/10" />}
                </button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>Configure telemetry alerts triggers schedules</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-xs">
            {[
              { key: 'critical', label: '🔔 Critical Alerts', desc: 'Always notify operations leads immediately' },
              { key: 'warning', label: '⚠ Warning Alerts', desc: 'Notify only during shift hours' },
              { key: 'updates', label: 'ℹ System Updates', desc: 'Show minor updates in notifications center' }
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between gap-4 py-2 border-b border-white/5 last:border-b-0">
                <div className="flex flex-col">
                  <span className="font-bold text-text-primary">{item.label}</span>
                  <span className="text-[10px] text-text-secondary mt-0.5">{item.desc}</span>
                </div>
                <button 
                  onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                  className="focus:outline-none"
                >
                  {notifications[item.key] ? <ToggleRight className="w-8 h-8 text-accent-cyan" /> : <ToggleLeft className="w-8 h-8 text-white/10" />}
                </button>
              </div>
            ))}
          </CardContent>
        </Card>

      </div>

      {/* ADMINISTRATOR PROFILE */}
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">Administrator Profile</h3>
          <p className="text-[10px] text-text-secondary mt-0.5">Verify Operations Director security parameters.</p>
        </div>

        <Card>
          <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6 text-xs">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent-blue/15 border border-accent-blue/30 flex items-center justify-center font-bold text-accent-blue text-lg shadow-sm">
                OL
              </div>
              <div className="flex flex-col">
                <h4 className="font-bold text-text-primary text-sm">Sarah Jenkins</h4>
                <span className="text-[10px] text-text-secondary">Operations Lead • Hospital Administrator</span>
              </div>
            </div>

            <div className="flex gap-6 flex-wrap">
              <div className="flex flex-col">
                <span className="text-[9px] text-text-secondary uppercase">Access Level</span>
                <strong className="text-text-primary font-bold mt-0.5">Administrator</strong>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] text-text-secondary uppercase">Security</span>
                <strong className="text-success-green font-bold mt-0.5">MFA Enabled ✓</strong>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] text-text-secondary uppercase">Last Login</span>
                <strong className="text-text-primary font-bold mt-0.5">Today, 10:42 AM</strong>
              </div>
            </div>

            <Button variant="outline">Manage Profile</Button>
          </CardContent>
        </Card>
      </div>

      {/* RECENT SETTINGS ACTIVITY */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Settings Activity</CardTitle>
          <CardDescription>Configuration transactions updates ledger log</CardDescription>
        </CardHeader>
        <CardContent className="p-5 flex flex-col gap-3 text-xs">
          {settingsLogs.map((log) => (
            <div key={log.id} className="flex justify-between border-b border-white/5 pb-2 last:border-0 last:pb-0">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-text-secondary" />
                <span className="text-text-primary">{log.text}</span>
              </div>
              <span className="text-text-secondary/70 font-mono text-[10px]">{log.time}</span>
            </div>
          ))}
          <div className="border-t border-white/5 pt-3 mt-2 flex justify-end">
            <button 
              onClick={() => setCurrentTab('audit')} 
              className="text-[10px] font-bold text-accent-cyan hover:underline transition-all"
            >
              View Full Audit Trail →
            </button>
          </div>
        </CardContent>
      </Card>

      {/* FLOATING SAVE BAR */}
      <AnimatePresence>
        {unsavedChanges && (
          <motion.div 
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-6 left-0 right-0 mx-auto w-full max-w-lg bg-command-secondary border border-white/10 rounded-xl p-4 shadow-2xl z-40 flex items-center justify-between text-xs"
          >
            <div className="flex flex-col">
              <span className="font-bold text-text-primary">Unsaved Configuration Changes</span>
              <span className="text-[10px] text-text-secondary mt-0.5">Trust weights have been modified.</span>
            </div>

            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={handleDiscardChanges}>Discard</Button>
              <Button 
                size="sm" 
                variant="primary" 
                onClick={handleSaveAll}
                disabled={!isBalanced}
              >
                Save All Changes
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ENDPOINT CONFIGURE MODAL */}
      <AnimatePresence>
        {activeModalConfig && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModalConfig(null)}
              className="fixed inset-0 bg-black z-45"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 m-auto w-full max-w-sm h-fit bg-command-secondary border border-white/5 rounded-xl p-5 shadow-2xl z-50 flex flex-col gap-4 text-xs text-text-secondary"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2 text-text-primary uppercase font-bold">
                  <Settings className="w-4 h-4 text-accent-cyan" />
                  <span>Configure {activeModalConfig.toUpperCase()} Connection</span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold uppercase text-text-secondary">Connection Status</label>
                <div className="flex items-center gap-1.5 text-success-green font-bold">
                  <span className="w-2 h-2 rounded-full bg-success-green animate-pulse" />
                  <span>● Connected</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold uppercase text-text-secondary">API Sync Endpoint URI</label>
                <input 
                  type="text"
                  value={endpointInput}
                  onChange={e => setEndpointInput(e.target.value)}
                  className="bg-command-card border border-white/5 rounded-lg p-2.5 text-text-primary outline-none"
                />
              </div>

              <div className="flex gap-2 justify-end mt-2">
                <Button size="sm" variant="ghost" onClick={() => setActiveModalConfig(null)}>Cancel</Button>
                <Button size="sm" variant="primary" onClick={handleSaveConfig}>Save Changes</Button>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Success Toast messages */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 bg-accent-cyan text-command-base font-bold text-xs px-4 py-2.5 rounded-lg shadow-xl shadow-accent-cyan/10 animate-fade-in z-50">
          {toastMsg}
        </div>
      )}

    </div>
  );
};

export default SettingsView;
