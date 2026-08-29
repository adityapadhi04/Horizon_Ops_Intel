import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { useStore } from '../store/useStore';
import { 
  BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, AreaChart, Area 
} from 'recharts';
import { 
  Brain, AlertTriangle, Play, HelpCircle, MapPin, BarChart3, TrendingUp, Sparkles
} from 'lucide-react';

const wardDiscrepancies = [
  { ward: 'Ward 3A', conflicts: 2 },
  { ward: 'Ward 3B', conflicts: 3 },
  { ward: 'Ward 4C', conflicts: 14 },
  { ward: 'ICU 5D', conflicts: 1 },
  { ward: 'ER Front', conflicts: 4 }
];

const timeDiscrepancies = [
  { hour: '07:00', conflicts: 12 },
  { hour: '11:00', conflicts: 3 },
  { hour: '15:00', conflicts: 15 },
  { hour: '19:00', conflicts: 4 },
  { hour: '23:00', conflicts: 8 },
  { hour: '03:00', conflicts: 2 }
];

const patternsTable = [
  { pattern: 'Shift Change Batching Delay', source: 'Bed Board log vs HIS', location: 'Ward 4C', rate: '70%', lag: '46 mins', severity: 'High' },
  { pattern: 'Lab STAT SLA Overflow', source: 'LIS STAT result vs HIS', location: 'Pathology', rate: '25%', lag: '12 mins', severity: 'Warning' },
  { pattern: 'Admission Sync Latency', source: 'HIS admissions vs Bed log', location: 'Emergency Room', rate: '42%', lag: '8 mins', severity: 'Warning' }
];

export const ConflictIntel = () => {
  const { patterns } = useStore();

  return (
    <div className="flex flex-col gap-6">
      
      {/* Welcome Intro */}
      <div className="border-b border-white/5 pb-5">
        <h2 className="text-2xl font-extrabold tracking-tight text-white font-heading">
          Conflict Intelligence
        </h2>
        <p className="text-xs text-text-secondary mt-1">
          Detect recurring operational data problems and pinpoint systematic processes bottlenecks.
        </p>
      </div>

      {/* KPI summaries */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex flex-col justify-between h-24">
            <span className="text-[10px] font-bold text-text-secondary tracking-wider uppercase">Recurring Patterns</span>
            <h2 className="text-2xl font-extrabold text-white font-heading">{patterns.recurringPatterns}</h2>
            <span className="text-[10px] text-success-green font-bold">Active algorithms online</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col justify-between h-24">
            <span className="text-[10px] font-bold text-text-secondary tracking-wider uppercase">High-Risk Wards</span>
            <h2 className="text-2xl font-extrabold text-danger-red font-heading">{patterns.highRiskDepts} Wards</h2>
            <span className="text-[10px] text-text-secondary">Ward C & ICU</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col justify-between h-24">
            <span className="text-[10px] font-bold text-text-secondary tracking-wider uppercase">Bottleneck Source</span>
            <h2 className="text-sm font-extrabold text-white font-heading truncate">{patterns.mostUnreliableSource}</h2>
            <span className="text-[10px] text-text-secondary">Lagging stream</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col justify-between h-24">
            <span className="text-[10px] font-bold text-text-secondary tracking-wider uppercase">Avg Conflict Lag</span>
            <h2 className="text-2xl font-extrabold text-white font-heading">{patterns.averageLag}</h2>
            <span className="text-[10px] text-text-secondary">Discrepancy delta time</span>
          </CardContent>
        </Card>
      </div>

      {/* Prominent pattern warnings */}
      <Card className="border-warning-amber/20 bg-warning-amber/[0.01]">
        <CardContent className="p-6 flex flex-col md:flex-row items-start justify-between gap-4">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-lg bg-warning-amber/10 border border-warning-amber/20 flex items-center justify-center flex-shrink-0">
              <Brain className="w-5 h-5 text-warning-amber animate-pulse" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="warning">POSSIBLE PATTERN DETECTED</Badge>
                <span className="text-[10px] text-text-secondary font-mono">ID: PAT-04</span>
              </div>
              <h3 className="text-sm font-bold text-text-primary mt-2">
                Ward C: 5 Bed Status Conflicts. Most common disagreement: HIS Available vs Nursing Board Occupied.
              </h3>
              <p className="text-xs text-text-secondary mt-1 max-w-xl">
                <strong>Likely Operational Cause: </strong>
                Delayed manual updates. Updates are being batched during shift transitions (surges logged at 07:00 and 15:00 swaps). Physical beds remain vacant, locking out admissions.
              </p>
            </div>
          </div>
          
          <div className="flex gap-2.5 flex-shrink-0">
            <Button size="sm" variant="outline">Suggested Investigation: Review nursing shift handover updates</Button>
          </div>
        </CardContent>
      </Card>

      {/* Grid: Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Ward discrepancies bar */}
        <Card>
          <CardHeader>
            <CardTitle>Conflicts by Ward</CardTitle>
            <CardDescription>Incidents frequency across locations</CardDescription>
          </CardHeader>
          <CardContent className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wardDiscrepancies}>
                <XAxis dataKey="ward" stroke="rgba(255,255,255,0.15)" fontSize={10} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.15)" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#111a2c', border: '1px solid rgba(255,255,255,0.08)' }} />
                <Bar dataKey="conflicts" fill="#8B5CF6" radius={[4, 4, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Time of day line */}
        <Card>
          <CardHeader>
            <CardTitle>Conflicts by Time of Day</CardTitle>
            <CardDescription>Visualizing peak operational sync lag hours</CardDescription>
          </CardHeader>
          <CardContent className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeDiscrepancies}>
                <defs>
                  <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#22D3EE" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="hour" stroke="rgba(255,255,255,0.15)" fontSize={10} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.15)" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#111a2c', border: '1px solid rgba(255,255,255,0.08)' }} />
                <Area type="monotone" dataKey="conflicts" stroke="#22D3EE" fillOpacity={1} fill="url(#colorTime)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      </div>

      {/* Table: Systematic ledger */}
      <Card>
        <CardHeader>
          <CardTitle>Aggregated Bottlenecks Log</CardTitle>
          <CardDescription>Scanned systematic conflicts registered in rules engine</CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.01] text-text-secondary">
                <th className="p-3 font-bold uppercase tracking-wider">Pattern Description</th>
                <th className="p-3 font-bold uppercase tracking-wider">Ingestion Streams</th>
                <th className="p-3 font-bold uppercase tracking-wider">Location / Dept</th>
                <th className="p-3 font-bold uppercase tracking-wider">Occurrence Rate</th>
                <th className="p-3 font-bold uppercase tracking-wider">Average Latency</th>
                <th className="p-3 font-bold uppercase tracking-wider">Severity</th>
              </tr>
            </thead>
            <tbody>
              {patternsTable.map((p, idx) => (
                <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.01] transition-all">
                  <td className="p-3 font-bold text-text-primary">{p.pattern}</td>
                  <td className="p-3 text-text-secondary">{p.source}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-text-secondary" />
                      <span>{p.location}</span>
                    </div>
                  </td>
                  <td className="p-3 font-mono font-bold text-accent-cyan">{p.rate}</td>
                  <td className="p-3 font-mono text-text-primary">{p.lag}</td>
                  <td className="p-3">
                    <Badge variant={p.severity === 'High' ? 'critical' : 'warning'}>
                      {p.severity}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

    </div>
  );
};

export default ConflictIntel;
