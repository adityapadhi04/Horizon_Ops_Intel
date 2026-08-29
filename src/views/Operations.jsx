import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { useStore } from '../store/useStore';
import { 
  BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, LineChart, Line, AreaChart, Area 
} from 'recharts';
import { 
  BedDouble, TrendingUp, Beaker, MapPin, ClipboardList, CheckCircle2, AlertCircle, Clock
} from 'lucide-react';

const wardCensusData = [
  { name: 'Ward 3A', Occupied: 18, Available: 2 },
  { name: 'Ward 3B', Occupied: 20, Available: 5 },
  { name: 'Ward 4C', Occupied: 21, Available: 3 },
  { name: 'ICU 5D', Occupied: 14, Available: 1 },
  { name: 'ER Front', Occupied: 9, Available: 7 }
];

const flowTrendData = [
  { time: '00:00', admissions: 2, discharges: 1 },
  { time: '04:00', admissions: 1, discharges: 3 },
  { time: '08:00', admissions: 10, discharges: 5 },
  { time: '12:00', admissions: 15, discharges: 12 },
  { time: '16:00', admissions: 18, discharges: 14 },
  { time: '20:00', admissions: 8, discharges: 10 }
];

const labTatTrendData = [
  { name: '08:00', avgTat: 3.1 },
  { name: '10:00', avgTat: 3.3 },
  { name: '12:00', avgTat: 3.5 },
  { name: '14:00', avgTat: 3.2 },
  { name: '16:00', avgTat: 3.0 },
  { name: '18:00', avgTat: 3.1 }
];

export const Operations = () => {
  const [activeTab, setActiveTab] = useState('capacity');
  const { bed, his, lab } = useStore();

  // Capacity counts
  const occupiedCount = bed.filter(b => b.occupied).length;
  const totalBeds = 100;
  const availableCount = totalBeds - occupiedCount;
  const occupancyPercent = Math.round((occupiedCount / totalBeds) * 100);

  // Flow counts
  const totalAdmissions = his.filter(h => h.status === 'Admitted').length;
  const totalDischarges = his.filter(h => h.status === 'Discharged').length;

  // Lab counts
  const completedLabCount = lab.filter(l => l.status === 'completed').length;
  const pendingLabCount = lab.filter(l => l.status === 'pending').length;
  const delayedLabCount = lab.filter(l => l.status === 'pending' && l.elapsedTime > 40).length;

  return (
    <div className="flex flex-col gap-6">
      
      {/* Intro Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-white/5 pb-5">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white font-heading">
            Operations Dashboard
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Granular real-time tracking of patient flows, bed occupancy, and laboratory SLA diagnostics.
          </p>
        </div>

        {/* Dynamic sub tab selectors */}
        <div className="flex bg-command-secondary border border-white/5 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('capacity')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'capacity' 
                ? 'bg-command-card text-accent-cyan shadow-md shadow-accent-cyan/5 border border-accent-cyan/15' 
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Capacity & Beds
          </button>
          <button
            onClick={() => setActiveTab('flow')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'flow' 
                ? 'bg-command-card text-accent-cyan shadow-md shadow-accent-cyan/5 border border-accent-cyan/15' 
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Patient Flow
          </button>
          <button
            onClick={() => setActiveTab('lab')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'lab' 
                ? 'bg-command-card text-accent-cyan shadow-md shadow-accent-cyan/5 border border-accent-cyan/15' 
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Laboratory SLA
          </button>
        </div>
      </div>

      {/* Tab: Capacity & Beds */}
      {activeTab === 'capacity' && (
        <div className="flex flex-col gap-6 animate-fade-in">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="flex flex-col justify-between h-24">
                <span className="text-[10px] font-bold text-text-secondary tracking-wider uppercase">Active Occupancy</span>
                <h2 className="text-2xl font-extrabold text-white font-heading">{occupancyPercent}%</h2>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-accent-cyan h-full rounded-full" style={{ width: `${occupancyPercent}%` }} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex flex-col justify-between h-24">
                <span className="text-[10px] font-bold text-text-secondary tracking-wider uppercase">Occupied Beds</span>
                <h2 className="text-2xl font-extrabold text-white font-heading">{occupiedCount}</h2>
                <span className="text-[10px] text-text-secondary">Assigned current patients</span>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex flex-col justify-between h-24">
                <span className="text-[10px] font-bold text-text-secondary tracking-wider uppercase">Vacant Available</span>
                <h2 className="text-2xl font-extrabold text-accent-cyan font-heading">{availableCount}</h2>
                <span className="text-[10px] text-text-secondary">Ready for admission</span>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex flex-col justify-between h-24">
                <span className="text-[10px] font-bold text-text-secondary tracking-wider uppercase">Active Wards</span>
                <h2 className="text-2xl font-extrabold text-white font-heading">5 Wards</h2>
                <span className="text-[10px] text-text-secondary">Operational nodes online</span>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart: Ward Occupancy */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Ward Occupancy Comparison</CardTitle>
                <CardDescription>Beds distribution breakdown by ward</CardDescription>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={wardCensusData}>
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.15)" fontSize={10} tickLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.15)" fontSize={10} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#111a2c', border: '1px solid rgba(255,255,255,0.08)' }} />
                    <Bar dataKey="Occupied" fill="#22D3EE" stackId="a" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="Available" fill="rgba(255, 255, 255, 0.05)" stackId="a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* List: Bed layout states */}
            <Card>
              <CardHeader>
                <CardTitle>Bed Management Log</CardTitle>
                <CardDescription>Recent Bed allocation activities</CardDescription>
              </CardHeader>
              <CardContent className="max-h-64 overflow-y-auto p-4 flex flex-col gap-3">
                {bed.map((b) => (
                  <div key={b.bedId} className="flex items-center justify-between border-b border-white/5 pb-2.5 last:border-b-0 last:pb-0">
                    <div className="flex items-center gap-2">
                      <BedDouble className="w-4 h-4 text-accent-cyan" />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-text-primary">{b.bedId}</span>
                        <span className="text-[10px] text-text-secondary">Ward {b.ward}</span>
                      </div>
                    </div>
                    <Badge variant={b.occupied ? 'neutral' : 'success'}>
                      {b.occupied ? 'Occupied' : 'Available'}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

        </div>
      )}

      {/* Tab: Patient Flow */}
      {activeTab === 'flow' && (
        <div className="flex flex-col gap-6 animate-fade-in">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="flex flex-col justify-between h-24">
                <span className="text-[10px] font-bold text-text-secondary tracking-wider uppercase">Active Patient Census</span>
                <h2 className="text-2xl font-extrabold text-white font-heading">{totalAdmissions} Patients</h2>
                <span className="text-[10px] text-text-secondary">Registered active patients</span>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex flex-col justify-between h-24">
                <span className="text-[10px] font-bold text-text-secondary tracking-wider uppercase">Total Admissions</span>
                <h2 className="text-2xl font-extrabold text-accent-blue font-heading">{totalAdmissions}</h2>
                <span className="text-[10px] text-text-secondary">Admissions synced today</span>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex flex-col justify-between h-24">
                <span className="text-[10px] font-bold text-text-secondary tracking-wider uppercase">Discharges Synced</span>
                <h2 className="text-2xl font-extrabold text-accent-purple font-heading">{totalDischarges}</h2>
                <span className="text-[10px] text-text-secondary">Discharges logged</span>
              </CardContent>
            </Card>
          </div>

          {/* Chart: Patient Movement */}
          <Card>
            <CardHeader>
              <CardTitle>Hourly Movement Trend</CardTitle>
              <CardDescription>Hourly admissions vs discharges fluctuations</CardDescription>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={flowTrendData}>
                  <XAxis dataKey="time" stroke="rgba(255,255,255,0.15)" fontSize={10} tickLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.15)" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#111a2c', border: '1px solid rgba(255,255,255,0.08)' }} />
                  <Line type="monotone" dataKey="admissions" stroke="#3B82F6" strokeWidth={2} dot={{ r: 2 }} />
                  <Line type="monotone" dataKey="discharges" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

        </div>
      )}

      {/* Tab: Laboratory SLA */}
      {activeTab === 'lab' && (
        <div className="flex flex-col gap-6 animate-fade-in">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="flex flex-col justify-between h-24">
                <span className="text-[10px] font-bold text-text-secondary tracking-wider uppercase">Average Turnaround</span>
                <h2 className="text-2xl font-extrabold text-white font-heading">35m</h2>
                <span className="text-[10px] text-text-secondary">STAT panel turnaround</span>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex flex-col justify-between h-24">
                <span className="text-[10px] font-bold text-text-secondary tracking-wider uppercase">Completed Panels</span>
                <h2 className="text-2xl font-extrabold text-success-green font-heading">{completedLabCount}</h2>
                <span className="text-[10px] text-text-secondary">Results published</span>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex flex-col justify-between h-24">
                <span className="text-[10px] font-bold text-text-secondary tracking-wider uppercase">Pending Results</span>
                <h2 className="text-2xl font-extrabold text-warning-amber font-heading">{pendingLabCount}</h2>
                <span className="text-[10px] text-text-secondary">Currently running tests</span>
              </CardContent>
            </Card>

            <Card className={delayedLabCount > 0 ? 'border-danger-red/30' : ''}>
              <CardContent className="flex flex-col justify-between h-24">
                <span className="text-[10px] font-bold text-danger-red tracking-wider uppercase">SLA Overdue</span>
                <h2 className="text-2xl font-extrabold text-danger-red font-heading">{delayedLabCount}</h2>
                <span className="text-[10px] text-text-secondary">STAT tests delayed</span>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Chart: Lab SLA */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>STAT TAT Trend</CardTitle>
                <CardDescription>STAT testing turnaround duration timeline (hours)</CardDescription>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={labTatTrendData}>
                    <defs>
                      <linearGradient id="colorTat" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.15)" fontSize={10} tickLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.15)" fontSize={10} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#111a2c', border: '1px solid rgba(255,255,255,0.08)' }} />
                    <Area type="monotone" dataKey="avgTat" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorTat)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* List: Pathology queues */}
            <Card>
              <CardHeader>
                <CardTitle>Active STAT Queue</CardTitle>
                <CardDescription>Currently processing STAT orders</CardDescription>
              </CardHeader>
              <CardContent className="p-4 flex flex-col gap-3">
                {lab.map((l, index) => (
                  <div key={index} className="flex items-center justify-between border-b border-white/5 pb-2.5 last:border-b-0 last:pb-0">
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-text-primary truncate">{l.testType}</span>
                      <span className="text-[10px] text-text-secondary font-mono">MRN: {l.mrn}</span>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <Badge variant={l.status === 'completed' ? 'success' : (l.elapsedTime > 40 ? 'critical' : 'warning')}>
                        {l.status === 'completed' ? 'Completed' : `${l.elapsedTime}m elapsed`}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

          </div>

        </div>
      )}

    </div>
  );
};

export default Operations;
