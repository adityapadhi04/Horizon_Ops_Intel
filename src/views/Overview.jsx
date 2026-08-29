import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { SourceTrustGauge, MetricSparkline } from '../components/Charts';
import { useStore } from '../store/useStore';
import { 
  AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import { 
  Users, Activity, Lock, AlertTriangle, Play, HelpCircle, CheckCircle2, RefreshCw, Clock, Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

// Mock charts dataset
const occupancyData = [
  { name: '08:00', rate: 78 },
  { name: '10:00', rate: 80 },
  { name: '12:00', rate: 82 },
  { name: '14:00', rate: 81 },
  { name: '16:00', rate: 83 },
  { name: '18:00', rate: 82 },
  { name: '20:00', rate: 82 }
];

const flowData = [
  { name: 'Mon', admissions: 12, discharges: 8 },
  { name: 'Tue', admissions: 18, discharges: 14 },
  { name: 'Wed', admissions: 22, discharges: 19 },
  { name: 'Thu', admissions: 14, discharges: 18 },
  { name: 'Fri', admissions: 25, discharges: 20 },
  { name: 'Sat', admissions: 16, discharges: 15 },
  { name: 'Sun', admissions: 10, discharges: 12 }
];

const labData = [
  { name: 'Troponin', STAT: 35, Target: 40 },
  { name: 'CBC', STAT: 50, Target: 60 },
  { name: 'Metabolic', STAT: 40, Target: 45 },
  { name: 'Lipid', STAT: 20, Target: 30 }
];

const sparkConflictData = [2, 3, 5, 8, 4, 7, 7];

export const Overview = ({ setCurrentTab, currentUser, activeRole = 'administrator' }) => {
  const { 
    occupiedCount, 
    availableCount, 
    patientCount, 
    conflictCount, 
    alerts, 
    trustScores, 
    activeConflicts,
    auditLog 
  } = useStore();

  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const [selectedWard, setSelectedWard] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const greetings = {
      administrator: {
        title: `Good morning, ${currentUser?.name || 'Aditya Parhi'} 👋`,
        subtitle: "Here's what's happening across the hospital today."
      },
      nursing: {
        title: `Good morning, ${currentUser?.name || 'Akshaya'} 👋`,
        subtitle: "Here's the latest update from wards and nursing operations."
      },
      bedManager: {
        title: `Good morning, ${currentUser?.name || 'Sparsh'} 👋`,
        subtitle: "Here's the current hospital capacity and bed availability."
      },
      dataAdmin: {
        title: `Good morning, ${currentUser?.name || 'Supriya'} 👋`,
        subtitle: "Here's the latest data quality and reconciliation status."
      }
    };
    return greetings[activeRole] || greetings.administrator;
  };

  const wards = [
    { name: 'WARD A', total: 20, occupied: 18, available: 2, status: 'nominal', conflicts: [] },
    { name: 'WARD B', total: 25, occupied: 20, available: 5, status: 'nominal', conflicts: [] },
    { name: 'WARD C', total: 24, occupied: 21, available: 3, status: 'conflict', conflicts: activeConflicts.filter(c => c.description.includes('Bed-302') || c.description.includes('Bed-404')) },
    { name: 'ICU', total: 15, occupied: 14, available: 1, status: 'nominal', conflicts: [] },
    { name: 'EMERGENCY', total: 16, occupied: 9, available: 7, status: 'nominal', conflicts: [] }
  ];

  const roleConfigs = {
    administrator: {
      subtitle: "Monitor hospital-wide operational performance.",
      insightTitle: "HOSPITAL OVERVIEW",
      insights: [
        { label: "Overall Trust", value: `${trustScores.overall}%`, desc: "System trust average" },
        { label: "Beds Available", value: `${availableCount}`, desc: "Wards A-D capacity" },
        { label: "Admissions Today", value: "12", desc: "Patient load" },
        { label: "Discharges Today", value: "8", desc: "Flow nominal" }
      ],
      recommendedAction: "Review active high-priority alerts.",
      emphasizedTabs: ['overview', 'alerts', 'trust'],
      cardOrder: ['dataTrust', 'patientLoad', 'bedOccupancy', 'availableBeds', 'activeConflicts', 'labTurnaround']
    },
    nursing: {
      subtitle: "Monitor ward activity, shift updates, and patient flow.",
      insightTitle: "NURSING OPERATIONS",
      insights: [
        { label: "Ward C Occupancy", value: "87%", desc: "High census alert" },
        { label: "Pending Bed Verification", value: "3", desc: "Requires physical sweep" },
        { label: "Shift Update Conflicts", value: "2", desc: "Mismatched Board register" },
        { label: "Nursing Board Reliability", value: `${trustScores.bed}%`, desc: "Needs calibration" }
      ],
      recommendedAction: "Review Ward C handover updates.",
      emphasizedTabs: ['overview', 'operations', 'reconciliation'],
      cardOrder: ['activeConflicts', 'bedOccupancy', 'availableBeds', 'patientLoad', 'labTurnaround', 'dataTrust']
    },
    bedManager: {
      subtitle: "Monitor bed availability and capacity.",
      insightTitle: "BED MANAGEMENT",
      insights: [
        { label: "Available Beds", value: `${availableCount}`, desc: "Across wards" },
        { label: "Occupied Beds", value: `${occupiedCount}`, desc: "Active census" },
        { label: "Under Cleaning", value: "4", desc: "Sanitation backlog" },
        { label: "Recently Vacated", value: "3", desc: "Ready for sweep" }
      ],
      recommendedAction: "Review Bed C-204.",
      emphasizedTabs: ['overview', 'operations', 'reconciliation'],
      cardOrder: ['availableBeds', 'bedOccupancy', 'activeConflicts', 'patientLoad', 'labTurnaround', 'dataTrust']
    },
    dataAdmin: {
      subtitle: "Monitor data reliability and reconciliation quality.",
      insightTitle: "DATA QUALITY",
      insights: [
        { label: "Overall Trust", value: `${trustScores.overall}%`, desc: "Data quality indicator" },
        { label: "HIS Reliability", value: `${trustScores.his}%`, desc: "Epic HIS source rating" },
        { label: "Lab Reliability", value: `${trustScores.lab}%`, desc: "Cerner LIS source rating" },
        { label: "Bed Board Reliability", value: `${trustScores.bed}%`, desc: "Nursing Board rating" }
      ],
      recommendedAction: "Review Bed Board reliability.",
      emphasizedTabs: ['reconciliation', 'trust', 'audit'],
      cardOrder: ['dataTrust', 'activeConflicts', 'labTurnaround', 'patientLoad', 'bedOccupancy', 'availableBeds']
    }
  };

  const activeConf = roleConfigs[activeRole] || roleConfigs.administrator;

  const cardsMap = {
    patientLoad: (
      <Card key="patientLoad" className="hover:border-accent-blue/20">
        <CardContent className="flex flex-col justify-between h-28">
          <span className="text-[10px] font-bold text-text-secondary tracking-widest uppercase">Patient Load</span>
          <div className="flex items-baseline gap-2">
            <h2 className="text-2xl font-extrabold text-white font-heading">{patientCount}</h2>
            <span className="text-[10px] font-bold text-success-green">+6 today</span>
          </div>
          <span className="text-[9px] text-text-secondary font-medium">Epic admissions record</span>
        </CardContent>
      </Card>
    ),
    bedOccupancy: (
      <Card key="bedOccupancy" className="hover:border-accent-purple/20">
        <CardContent className="flex flex-col justify-between h-28">
          <span className="text-[10px] font-bold text-text-secondary tracking-widest uppercase">Bed Occupancy</span>
          <div className="flex items-baseline gap-2">
            <h2 className="text-2xl font-extrabold text-white font-heading">82%</h2>
            <span className="text-[10px] font-mono text-text-secondary">82/100 beds</span>
          </div>
          <span className="text-[9px] text-text-secondary font-medium">Live board occupancy</span>
        </CardContent>
      </Card>
    ),
    availableBeds: (
      <Card key="availableBeds" className="hover:border-accent-cyan/20">
        <CardContent className="flex flex-col justify-between h-28">
          <span className="text-[10px] font-bold text-text-secondary tracking-widest uppercase">Available Beds</span>
          <div className="flex items-baseline gap-2">
            <h2 className="text-2xl font-extrabold text-white font-heading">{availableCount}</h2>
            <span className="text-[10px] text-accent-cyan font-bold">Wards A-D</span>
          </div>
          <span className="text-[9px] text-text-secondary font-medium">Across 5 departments</span>
        </CardContent>
      </Card>
    ),
    labTurnaround: (
      <Card key="labTurnaround" className="hover:border-white/15">
        <CardContent className="flex flex-col justify-between h-28">
          <span className="text-[10px] font-bold text-text-secondary tracking-widest uppercase">Lab Turnaround</span>
          <div className="flex items-baseline gap-2">
            <h2 className="text-2xl font-extrabold text-white font-heading">3.2h</h2>
            <span className="text-[10px] text-text-secondary">Limit &lt; 4h</span>
          </div>
          <span className="text-[9px] text-text-secondary font-medium">STAT chemistry average</span>
        </CardContent>
      </Card>
    ),
    activeConflicts: (
      <Card 
        key="activeConflicts"
        onClick={() => setCurrentTab('reconciliation')}
        className="hover:border-warning-amber/30 hover:bg-warning-amber/[0.02]"
      >
        <CardContent className="flex flex-col justify-between h-28 cursor-pointer">
          <span className="text-[10px] font-bold text-warning-amber tracking-widest uppercase">Active Conflicts</span>
          <div className="flex items-baseline gap-2">
            <h2 className="text-2xl font-extrabold text-warning-amber font-heading">{conflictCount}</h2>
            <span className="text-[10px] text-danger-red font-bold">Needs Review</span>
          </div>
          <MetricSparkline data={sparkConflictData} color="#F59E0B" height={20} />
        </CardContent>
      </Card>
    ),
    dataTrust: (
      <Card 
        key="dataTrust"
        onClick={() => setCurrentTab('trust')}
        className="glow-cyan border-accent-cyan/10 hover:border-accent-cyan/40 bg-accent-cyan/[0.01]"
      >
        <CardContent className="p-0 flex items-center justify-center cursor-pointer">
          <SourceTrustGauge value={trustScores.overall} title="Data Trust" subtitle="Reliable" />
        </CardContent>
      </Card>
    )
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Top Banner section */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-white/5 pb-5">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white font-heading">
            {getGreeting().title}
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            {activeConf.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-4 bg-command-secondary border border-white/5 rounded-xl px-4 py-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-text-secondary" />
            <span className="text-xs font-mono font-bold text-text-primary tracking-wider">{time}</span>
          </div>
          <span className="w-px h-4 bg-white/10" />
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success-green animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-success-green">Health Nominal</span>
          </div>
        </div>
      </div>

      {/* Recommended Action Banner */}
      <div className="bg-command-secondary border border-white/5 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-accent-cyan/15 border border-accent-cyan/25 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4.5 h-4.5 text-accent-cyan" />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-extrabold text-text-secondary uppercase tracking-widest">Recommended Action</span>
            <span className="text-xs font-bold text-text-primary mt-0.5">{activeConf.recommendedAction}</span>
          </div>
        </div>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => setCurrentTab(activeConf.emphasizedTabs[1] || 'reconciliation')}
          className="border-accent-cyan/20 hover:border-accent-cyan/40 text-accent-cyan"
        >
          Take Action →
        </Button>
      </div>

      {/* KPI summaries */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {activeConf.cardOrder.map(key => cardsMap[key])}
      </div>

      {/* Grid: Live map + Event feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Ward Census + Quick Insights */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Quick Insights panel */}
          <Card className="border-accent-cyan/10 bg-accent-cyan/[0.005]">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-3.5 bg-accent-cyan rounded-full animate-pulse" />
                <CardTitle>{activeConf.insightTitle}</CardTitle>
              </div>
              <CardDescription>Targeted operational indexes for active supervisor role</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {activeConf.insights.map((ins, i) => (
                  <div key={i} className="p-3 rounded-lg bg-command-secondary border border-white/5 flex flex-col justify-between min-h-16">
                    <span className="text-[9px] font-bold text-text-secondary uppercase tracking-wider">{ins.label}</span>
                    <strong className="text-base font-extrabold text-text-primary tracking-tight font-mono mt-1">{ins.value}</strong>
                    <span className="text-[8px] text-text-secondary mt-0.5">{ins.desc}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-4 bg-accent-cyan rounded-full" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">Live Hospital Operations Map</h3>
            </div>
            <span className="text-[10px] text-text-secondary">Click Wards to inspect detail logs</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            {wards.map((ward) => {
              const isConflict = ward.status === 'conflict';
              const isSelected = selectedWard?.name === ward.name;
              
              return (
                <Card 
                  key={ward.name}
                  onClick={() => setSelectedWard(isSelected ? null : ward)}
                  className={`cursor-pointer transition-all duration-200 ${
                    isConflict ? 'border-danger-red/35 bg-danger-red/[0.01]' : 'border-white/5 hover:border-white/10'
                  } ${isSelected ? 'border-accent-cyan/40 bg-accent-cyan/[0.02] scale-[1.02]' : ''}`}
                >
                  <CardHeader className="p-4 border-b-0 flex flex-row items-center justify-between">
                    <span className="text-xs font-bold text-text-primary">{ward.name}</span>
                    <span className={`w-2 h-2 rounded-full ${isConflict ? 'bg-danger-red animate-pulse' : 'bg-success-green'}`} />
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-[10px] text-text-secondary">
                        <span>Beds:</span>
                        <span className="font-bold text-text-primary">{ward.total}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-text-secondary">
                        <span>Occupied:</span>
                        <span className="font-bold text-text-primary">{ward.occupied}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-text-secondary">
                        <span>Available:</span>
                        <span className="font-bold text-accent-cyan">{ward.available}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Expanded Ward Inspector drawer */}
          {selectedWard && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-command-secondary border border-white/5 rounded-xl p-4 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-text-primary">INSPECTOR: {selectedWard.name}</span>
                <Button size="sm" variant="outline" onClick={() => setSelectedWard(null)}>Close</Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-[10px] text-text-secondary block">Total Capacity</span>
                  <span className="font-bold text-text-primary text-sm">{selectedWard.total} beds</span>
                </div>
                <div>
                  <span className="text-[10px] text-text-secondary block">Active Occupancy</span>
                  <span className="font-bold text-text-primary text-sm">{selectedWard.occupied} beds</span>
                </div>
                <div>
                  <span className="text-[10px] text-text-secondary block">Occupancy Rate</span>
                  <span className="font-bold text-accent-cyan text-sm">{Math.round((selectedWard.occupied/selectedWard.total)*100)}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-text-secondary block">Discrepancy Status</span>
                  <Badge variant={selectedWard.status === 'conflict' ? 'critical' : 'success'}>
                    {selectedWard.status === 'conflict' ? 'Data Conflict Detected' : 'Connected'}
                  </Badge>
                </div>
              </div>
              
              {selectedWard.status === 'conflict' && (
                <div className="p-3 rounded-lg bg-danger-red/5 border border-danger-red/10 mt-2 text-xs">
                  <span className="font-bold text-danger-red uppercase tracking-wider block mb-1">Mismatched beds board indices:</span>
                  <ul className="list-disc list-inside text-text-secondary flex flex-col gap-1">
                    {selectedWard.conflicts.map(c => (
                      <li key={c.id}>
                        {c.description} (Confidence: <strong className="text-text-primary">{c.confidence}%</strong>)
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}

        </div>

        {/* Right: Live activity timelines */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-4 bg-accent-purple rounded-full" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">Live Operations Feed</h3>
            </div>
            <span className="text-[9px] font-bold text-accent-cyan animate-pulse">● FEED ONLINE</span>
          </div>

          <Card className="max-h-[290px] overflow-y-auto">
            <CardContent className="p-4 flex flex-col gap-3">
              {auditLog.slice(0, 5).map((log, idx) => (
                <div key={idx} className="flex gap-3 text-xs relative">
                  {idx < 4 && (
                    <span className="absolute left-2 top-5 bottom-[-15px] w-0.5 bg-white/5" />
                  )}
                  <div className="w-4.5 h-4.5 rounded-full border border-white/10 bg-command-secondary flex items-center justify-center flex-shrink-0 z-10">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-purple" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-text-secondary">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                      <Badge variant="neutral" className="text-[8px] py-0">{log.action}</Badge>
                    </div>
                    <p className="text-text-primary text-[11px] font-medium mt-1 truncate">{log.details}</p>
                    <span className="text-[9px] text-text-secondary mt-0.5">Author: {log.resolvedBy}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Active Alerts Compact Card */}
          <Card 
            onClick={() => setCurrentTab('alerts')}
            className="border-danger-red/10 bg-danger-red/[0.005] hover:border-danger-red/30 cursor-pointer transition-all mt-3"
          >
            <CardHeader className="p-4 pb-2 border-b-0 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-3 bg-danger-red rounded-full" />
                <span className="text-[10px] font-bold text-text-primary uppercase tracking-wider">Active Alerts Breakdown</span>
              </div>
              <span className="text-[9px] font-bold text-accent-cyan hover:underline">View Alerts →</span>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-lg bg-command-secondary border border-white/5">
                  <span className="text-[9px] text-text-secondary block font-bold uppercase">Critical</span>
                  <span className="font-bold text-danger-red text-sm mt-0.5 block">{alerts.filter(a => a.status !== 'RESOLVED' && a.severity === 'critical').length}</span>
                </div>
                <div className="p-2 rounded-lg bg-command-secondary border border-white/5">
                  <span className="text-[9px] text-text-secondary block font-bold uppercase">High</span>
                  <span className="font-bold text-warning-amber text-sm mt-0.5 block">{alerts.filter(a => a.status !== 'RESOLVED' && a.severity === 'high').length}</span>
                </div>
                <div className="p-2 rounded-lg bg-command-secondary border border-white/5">
                  <span className="text-[9px] text-text-secondary block font-bold uppercase">Medium</span>
                  <span className="font-bold text-accent-blue text-sm mt-0.5 block">{alerts.filter(a => a.status !== 'RESOLVED' && a.severity === 'medium').length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

      </div>

      {/* Dark Charts Section using Recharts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
        
        {/* Card: Bed Occupancy Area Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Bed Occupancy Trend</CardTitle>
            <CardDescription>Overall ward census changes (Last 12 hours)</CardDescription>
          </CardHeader>
          <CardContent className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={occupancyData}>
                <defs>
                  <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#22D3EE" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} domain={[60, 100]} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#111a2c', border: '1px solid rgba(255,255,255,0.08)' }} labelStyle={{ color: '#fff' }} />
                <Area type="monotone" dataKey="rate" stroke="#22D3EE" fillOpacity={1} fill="url(#colorRate)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Card: Admissions vs Discharges line chart */}
        <Card>
          <CardHeader>
            <CardTitle>Admissions vs Discharges</CardTitle>
            <CardDescription>Dynamic patient movements (7-day timeline)</CardDescription>
          </CardHeader>
          <CardContent className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={flowData}>
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#111a2c', border: '1px solid rgba(255,255,255,0.08)' }} labelStyle={{ color: '#fff' }} />
                <Line type="monotone" dataKey="admissions" stroke="#3B82F6" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="discharges" stroke="#8B5CF6" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Card: Lab Turnaround STAT performance bar chart */}
        <Card>
          <CardHeader>
            <CardTitle>Laboratory Turnaround Times</CardTitle>
            <CardDescription>STAT testing turnaround duration vs standard targets (minutes)</CardDescription>
          </CardHeader>
          <CardContent className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={labData}>
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#111a2c', border: '1px solid rgba(255,255,255,0.08)' }} labelStyle={{ color: '#fff' }} />
                <Bar dataKey="STAT" fill="#22D3EE" radius={[4, 4, 0, 0]} maxBarSize={30} />
                <Bar dataKey="Target" fill="rgba(255,255,255,0.05)" radius={[4, 4, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Card: Small conflict trend */}
        <Card>
          <CardHeader>
            <CardTitle>Reconciliation Conflict Incidents</CardTitle>
            <CardDescription>Daily mismatch logs count (7-day timeline)</CardDescription>
          </CardHeader>
          <CardContent className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={occupancyData.map((d,i)=>({name:d.name, value: [1,2,3,4,3,2,1][i]}))}>
                <defs>
                  <linearGradient id="colorConflicts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#111a2c', border: '1px solid rgba(255,255,255,0.08)' }} labelStyle={{ color: '#fff' }} />
                <Area type="monotone" dataKey="value" stroke="#F59E0B" fillOpacity={1} fill="url(#colorConflicts)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      </div>

    </div>
  );
};

export default Overview;
