import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { useStore } from '../store/useStore';
import { 
  Play, Pause, RotateCcw, UserPlus, LogOut, ShieldAlert, Clock, Sparkles, AlertTriangle, ArrowRight, Beaker
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const DemoLiveMode = () => {
  const { simulateEvent, toggleSetting, resetSimulation, settings, loadAll } = useStore();

  const [pipelineStep, setPipelineStep] = useState(-1);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const [logs, setLogs] = useState([
    { time: '10:24:12', message: 'Patient Sarah Miller Admitted', type: 'info' },
    { time: '10:24:13', message: 'Bed Bed-101 Checked', type: 'info' },
    { time: '10:24:14', message: 'HL7 Sync Completed', type: 'success' }
  ]);

  const pipeline = [
    'EVENT RECEIVED',
    'DATA UPDATED',
    'RECONCILIATION CHECK',
    'CONFLICT DETECTION',
    'HUMAN REVIEW',
    'TRUST UPDATED',
    'DASHBOARD UPDATED'
  ];

  const animatePipeline = (msg, type = 'info', cb) => {
    const timeNow = new Date().toLocaleTimeString();
    setLogs(prev => [{ time: timeNow, message: msg, type }, ...prev].slice(0, 8));

    let current = 0;
    setPipelineStep(0);

    const interval = setInterval(() => {
      current += 1;
      if (current <= 6) {
        setPipelineStep(current);
        if (current === 2) {
          setLogs(prev => [{ time: new Date().toLocaleTimeString(), message: 'Running 3-way reconciliation audit check...', type: 'info' }, ...prev]);
        }
        if (current === 5) {
          setLogs(prev => [{ time: new Date().toLocaleTimeString(), message: 'Recalculating overall Data Trust Score...', type: 'neutral' }, ...prev]);
        }
      } else {
        clearInterval(interval);
        setPipelineStep(-1);
        setLogs(prev => [{ time: new Date().toLocaleTimeString(), message: 'Operational Data sync pipeline: Refreshed & Synced.', type: 'success' }, ...prev]);
        if (cb) cb();
      }
    }, 300);
  };

  const handleSimulate = async (type, logMsg, logType) => {
    animatePipeline(logMsg, logType, async () => {
      try {
        await simulateEvent(type);
      } catch (err) {
        console.error("Simulation error:", err);
      }
    });
  };

  const handleConfirmReset = async () => {
    try {
      await resetSimulation();
      setLogs([
        { time: new Date().toLocaleTimeString(), message: 'Demo environment reset successfully.', type: 'success' }
      ]);
      setShowResetConfirm(false);
      setToastMsg('✓ Demo environment reset successfully');
      setTimeout(() => setToastMsg(''), 4000);
    } catch (err) {
      console.error("Reset error:", err);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Intro Header */}
      <div className="border-b border-white/5 pb-5">
        <h2 className="text-2xl font-extrabold tracking-tight text-white font-heading">
          Demo Live Mode
        </h2>
        <p className="text-xs text-text-secondary mt-1">
          Simulate incoming HL7 patient events, LIS chemistry outcomes, and Bed status updates to watch reconciliation in real time.
        </p>
      </div>

      {/* Control Center Card */}
      <Card className="border-accent-cyan/20">
        <CardHeader className="flex flex-row items-center justify-between border-b border-white/5">
          <div>
            <CardTitle>Simulation Control Center</CardTitle>
            <CardDescription>Launch automated scenarios or manual events overrides</CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant={settings.running ? 'outline' : 'primary'}
              onClick={() => toggleSetting('running')}
              icon={settings.running ? Pause : Play}
            >
              {settings.running ? 'Pause Daemon' : 'Resume Daemon'}
            </Button>
            
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setShowResetConfirm(true)}
              icon={RotateCcw}
            >
              Reset Demo Environment
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          
          {/* Action trigger buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              size="sm"
              variant="outline"
              onClick={() => handleSimulate('admission', 'Simulating Patient Admission Webhook...', 'info')}
              icon={UserPlus}
            >
              + New Admission
            </Button>
            <Button 
              size="sm"
              variant="outline"
              onClick={() => handleSimulate('discharge', 'Simulating Patient Discharge Webhook...', 'info')}
              icon={LogOut}
            >
              Patient Discharge
            </Button>
            <Button 
              size="sm"
              variant="outline"
              onClick={() => handleSimulate('conflict', 'Injecting Bed C-204 status conflict...', 'critical')}
              icon={ShieldAlert}
              className="border-danger-red/20 text-danger-red hover:border-danger-red/40"
            >
              ⚠ Inject Bed Conflict
            </Button>
            <Button 
              size="sm"
              variant="outline"
              onClick={() => handleSimulate('lab_delay', 'Injecting Laboratory turnaround delay...', 'warning')}
              icon={Beaker}
              className="border-warning-amber/20 text-warning-amber hover:border-warning-amber/40"
            >
              🧪 Inject Lab Delay
            </Button>
          </div>

        </CardContent>
      </Card>

      {/* Predictive Intelligence Simulations */}
      <Card className="border-accent-blue/20">
        <CardHeader>
          <CardTitle>Predictive Intelligence Simulations</CardTitle>
          <CardDescription>Simulate epidemiological patterns, seasonal variations, and resource bottlenecks</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              size="sm"
              variant="outline"
              onClick={() => handleSimulate('disease_cluster', 'Simulating Dengue disease cluster in Patia...', 'warning')}
              icon={Sparkles}
            >
              🦠 Disease Cluster
            </Button>
            <Button 
              size="sm"
              variant="outline"
              onClick={() => handleSimulate('seasonal_surge', 'Simulating Rainy Season Dengue surge...', 'info')}
              icon={Sparkles}
            >
              🌧️ Seasonal Surge
            </Button>
            <Button 
              size="sm"
              variant="outline"
              onClick={() => handleSimulate('medicine_shortage', 'Simulating IV Fluids & Test Kits shortage...', 'critical')}
              icon={Sparkles}
              className="border-danger-red/20 text-danger-red hover:border-danger-red/40"
            >
              💊 Medicine Shortage
            </Button>
            <Button 
              size="sm"
              variant="outline"
              onClick={() => handleSimulate('patient_surge', 'Simulating Emergency Ward admissions surge...', 'critical')}
              icon={Sparkles}
              className="border-danger-red/20 text-danger-red hover:border-danger-red/40"
            >
              🏥 Patient Surge
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Visual Pipeline cascades */}
      <Card>
        <CardHeader>
          <CardTitle>Reconciliation Pipeline Sync Pulse</CardTitle>
          <CardDescription>Cascading status updates as events process through rules engines</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-command-secondary border border-white/5 relative overflow-hidden">
            
            {pipeline.map((step, idx) => {
              const isActive = pipelineStep === idx;
              const isPassed = pipelineStep > idx;
              
              return (
                <React.Fragment key={idx}>
                  <div className={`flex flex-col items-center text-center transition-all duration-300 ${
                    isActive ? 'scale-105 opacity-100' : (isPassed ? 'opacity-85' : 'opacity-40')
                  }`}>
                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs ${
                      isActive 
                        ? 'bg-accent-cyan/15 border-accent-cyan text-accent-cyan shadow-[0_0_12px_rgba(34,211,238,0.4)] animate-pulse' 
                        : (isPassed ? 'bg-success-green/10 border-success-green text-success-green' : 'bg-white/5 border-white/10 text-text-secondary')
                    }`}>
                      {idx + 1}
                    </div>
                    <span className={`text-[9px] font-bold mt-2 uppercase tracking-wider ${
                      isActive ? 'text-accent-cyan' : 'text-text-secondary'
                    }`}>
                      {step}
                    </span>
                  </div>

                  {idx < 6 && (
                    <ArrowRight className={`w-4 h-4 hidden md:block ${
                      isPassed ? 'text-success-green' : 'text-white/10'
                    }`} />
                  )}
                </React.Fragment>
              );
            })}

          </div>
        </CardContent>
      </Card>

      {/* Dynamic Logging feed */}
      <Card>
        <CardHeader>
          <CardTitle>Live Event Timeline</CardTitle>
          <CardDescription>Streaming log capture of simulation events timeline (latest 5-8 events)</CardDescription>
        </CardHeader>
        <CardContent className="max-h-[320px] overflow-y-auto p-4 flex flex-col gap-2">
          {logs.map((l, index) => (
            <div 
              key={index}
              className={`p-3 rounded-lg border flex items-center gap-3 text-xs animate-fade-in ${
                l.type === 'critical' 
                  ? 'bg-danger-red/5 border-danger-red/10 text-danger-red' 
                  : (l.type === 'warning' ? 'bg-warning-amber/5 border-warning-amber/10 text-warning-amber' : (l.type === 'success' ? 'bg-success-green/5 border-success-green/10 text-success-green' : 'bg-white/[0.01] border-white/5 text-text-secondary'))
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-text-secondary/70 flex-shrink-0" />
              <span className="font-mono font-bold text-[10px] text-text-secondary/70">{l.time}</span>
              <span className="font-medium text-text-primary">{l.message}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* RESET CONFIRMATION MODAL */}
      <AnimatePresence>
        {showResetConfirm && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowResetConfirm(false)}
              className="fixed inset-0 bg-black z-45"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 m-auto w-full max-w-sm h-fit bg-command-secondary border border-white/5 rounded-xl p-5 shadow-2xl z-50 flex flex-col gap-4 text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-danger-red/15 border border-danger-red/20 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-danger-red" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-text-secondary uppercase">Database Reset</span>
                  <h3 className="text-sm font-bold text-text-primary mt-0.5">Reset Demo Environment?</h3>
                </div>
              </div>

              <p className="text-text-secondary leading-relaxed">
                Are you sure you want to restore the initial database state? This will clear all custom conflicts, rule simulations, and settings audits.
              </p>

              <div className="flex gap-2 justify-end mt-2">
                <Button size="sm" variant="ghost" onClick={() => setShowResetConfirm(false)}>Cancel</Button>
                <Button size="sm" variant="danger" onClick={handleConfirmReset}>Confirm Reset</Button>
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

export default DemoLiveMode;
