import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/Card';
import { Badge } from '../components/Badge';
import { useStore } from '../store/useStore';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  ShieldCheck, CheckCircle2, AlertTriangle, Database, UserCheck, RefreshCw, Sliders, ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const trustTrendData = [
  { day: 'Day 1', score: 85 },
  { day: 'Day 5', score: 86 },
  { day: 'Day 10', score: 85 },
  { day: 'Day 15', score: 87 },
  { day: 'Day 20', score: 88 },
  { day: 'Day 25', score: 87 },
  { day: 'Day 30', score: 88 }
];

export const TrustCenter = () => {
  const { trustScores } = useStore();

  const radius = 65;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (trustScores.overall / 100) * circumference;

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      
      {/* SECTION 1 — PAGE HEADER */}
      <div className="border-b border-white/5 pb-4">
        <h2 className="text-2xl font-extrabold tracking-tight text-white font-heading">
          Trust Center
        </h2>
        <p className="text-xs text-text-secondary mt-1">
          See how trustworthy today's operational data is and identify which sources need attention.
        </p>
      </div>

      {/* SECTION 2 — MAIN TRUST SCORE HERO */}
      <Card className="border-accent-cyan/10 bg-accent-cyan/[0.01] glow-cyan">
        <CardContent className="p-8 flex flex-col items-center text-center gap-6">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-extrabold text-text-secondary tracking-widest uppercase">
              Overall Data Trust
            </span>
            
            {/* Centered Circular Gauge */}
            <div className="relative flex items-center justify-center mt-4" style={{ width: radius * 2, height: radius * 2 }}>
              <div className="absolute inset-4 rounded-full bg-accent-cyan/5 blur-md" />
              
              <svg height={radius * 2} width={radius * 2} className="transform -rotate-90 overflow-visible z-10">
                {/* Base circle track */}
                <circle
                  stroke="rgba(255,255,255,0.03)"
                  fill="transparent"
                  strokeWidth={stroke}
                  r={normalizedRadius}
                  cx={radius}
                  cy={radius}
                />
                {/* Progress arc */}
                <motion.circle
                  stroke="#22D3EE"
                  fill="transparent"
                  strokeWidth={stroke}
                  strokeDasharray={circumference + ' ' + circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  strokeLinecap="round"
                  r={normalizedRadius}
                  cx={radius}
                  cy={radius}
                  className="drop-shadow-[0_0_10px_rgba(34,211,238,0.4)]"
                />
              </svg>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                <span className="text-3xl font-extrabold text-white font-heading tracking-tighter">
                  {trustScores.overall}
                </span>
                <span className="text-[9px] font-bold text-text-secondary uppercase">/ 100</span>
              </div>
            </div>

            <div className="mt-4 flex flex-col items-center">
              <span className="text-sm font-extrabold text-accent-cyan tracking-wider flex items-center gap-1.5">
                ✓ HIGHLY RELIABLE
              </span>
              <span className="text-[10px] font-bold text-success-green mt-1 flex items-center gap-1">
                ↑ Improved by 3 points this week
              </span>
            </div>
          </div>

          <p className="text-xs text-text-secondary max-w-md leading-relaxed">
            "Most hospital operational data is consistent and reliable. Some bed records need attention."
          </p>

          <span className="w-full h-px bg-white/5" />

          {/* Simple range indicator scale */}
          <div className="flex items-center gap-6 text-[10px] font-bold text-text-secondary uppercase">
            <span className="opacity-40">Critical</span>
            <span className="text-white/20">➔</span>
            <span className="opacity-40">Attention</span>
            <span className="text-white/20">➔</span>
            <span className="opacity-40">Good</span>
            <span className="text-white/20">➔</span>
            <span className="text-accent-cyan border border-accent-cyan/20 bg-accent-cyan/10 px-2 py-0.5 rounded-full glow-cyan">
              Highly Reliable
            </span>
          </div>

        </CardContent>
      </Card>

      {/* SECTION 3 — SOURCE HEALTH */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-4 bg-accent-cyan rounded-full" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">Source Health</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Card 1: HIS Admissions */}
          <Card>
            <CardContent className="p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-text-primary uppercase">HIS Admissions</span>
                <span className="text-xs font-mono font-bold text-success-green">{trustScores.his}%</span>
              </div>
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                <div className="bg-success-green h-full rounded-full" style={{ width: `${trustScores.his}%` }} />
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-text-secondary">
                <CheckCircle2 className="w-3.5 h-3.5 text-success-green" />
                <span>Reliable. No significant issues.</span>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Laboratory Results */}
          <Card>
            <CardContent className="p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-text-primary uppercase">Lab Results</span>
                <span className="text-xs font-mono font-bold text-success-green">{trustScores.lab}%</span>
              </div>
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                <div className="bg-success-green h-full rounded-full" style={{ width: `${trustScores.lab}%` }} />
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-text-secondary">
                <CheckCircle2 className="w-3.5 h-3.5 text-success-green" />
                <span>Reliable. Data is consistent.</span>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Bed Management */}
          <Card className="border-warning-amber/20 bg-warning-amber/[0.01]">
            <CardContent className="p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-text-primary uppercase">Nursing Bed Board</span>
                <span className="text-xs font-mono font-bold text-warning-amber">{trustScores.bed}%</span>
              </div>
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                <div className="bg-warning-amber h-full rounded-full" style={{ width: `${trustScores.bed}%` }} />
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-warning-amber">
                <AlertTriangle className="w-3.5 h-3.5 text-warning-amber animate-pulse" />
                <span>Needs Attention. 14 conflicts recently.</span>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* SECTION 4 — WHY IS TRUST SCORE 88? */}
      <Card>
        <CardHeader>
          <CardTitle>Why is the Trust Score 88?</CardTitle>
          <CardDescription>Direct insights explaining current operations health</CardDescription>
        </CardHeader>
        <CardContent className="p-6 flex flex-col gap-3">
          
          <div className="flex items-center gap-4 text-xs">
            <CheckCircle2 className="w-4.5 h-4.5 text-success-green flex-shrink-0" />
            <div className="flex-1">
              <strong className="text-text-primary">HIS Admissions: </strong>
              <span className="text-text-secondary">Highly consistent and reliable records matches Epic register.</span>
            </div>
          </div>

          <span className="h-px bg-white/5" />

          <div className="flex items-center gap-4 text-xs">
            <CheckCircle2 className="w-4.5 h-4.5 text-success-green flex-shrink-0" />
            <div className="flex-1">
              <strong className="text-text-primary">Laboratory Results: </strong>
              <span className="text-text-secondary">Few data conflicts detected. Turnaround intervals align with targets.</span>
            </div>
          </div>

          <span className="h-px bg-white/5" />

          <div className="flex items-center gap-4 text-xs">
            <AlertTriangle className="w-4.5 h-4.5 text-warning-amber flex-shrink-0" />
            <div className="flex-1">
              <strong className="text-text-primary">Nursing Bed Board: </strong>
              <span className="text-text-secondary">Recurring update delays during shift transitions are reducing overall trust.</span>
            </div>
          </div>

        </CardContent>
      </Card>

      {/* SECTION 5 — TRUST TREND */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4 border-b border-white/5">
          <div>
            <CardTitle>Trust Score Over Time</CardTitle>
            <CardDescription>Overall trust index timeline tracking past 30 days</CardDescription>
          </div>
          
          <div className="flex items-center gap-4 text-[10px] font-bold uppercase text-text-secondary">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-accent-cyan" />
              <span>Current Score: <strong className="text-white">88</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
              <span>Previous Week: <strong className="text-white">85</strong></span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="py-5">
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trustTrendData}>
                <defs>
                  <linearGradient id="colorTrustCenter" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#22D3EE" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="rgba(255,255,255,0.12)" fontSize={9} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.12)" fontSize={9} domain={[80, 95]} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0d1321', border: '1px solid rgba(255,255,255,0.06)' }} />
                <Area type="monotone" dataKey="score" stroke="#22D3EE" fillOpacity={1} fill="url(#colorTrustCenter)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-3 text-center text-[10px] text-text-secondary">
            "Overall trust has improved over the last 7 days."
          </div>
        </CardContent>
      </Card>

      {/* SECTION 6 — HOW THE SYSTEM IMPROVES */}
      <Card>
        <CardContent className="p-6 flex flex-col gap-4 text-center">
          <div className="flex items-center justify-between flex-wrap gap-2 text-xs font-bold text-text-secondary max-w-xl mx-auto">
            
            <div className="flex items-center gap-1.5">
              <Database className="w-4 h-4 text-accent-cyan" />
              <span>Data Sources</span>
            </div>
            
            <ArrowRight className="w-3.5 h-3.5 opacity-30" />
            
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-warning-amber" />
              <span>Conflict Detected</span>
            </div>

            <ArrowRight className="w-3.5 h-3.5 opacity-30" />

            <div className="flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-accent-blue" />
              <span>Human Review</span>
            </div>

            <ArrowRight className="w-3.5 h-3.5 opacity-30" />

            <div className="flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-accent-purple" />
              <span>Reliability Updated</span>
            </div>

            <ArrowRight className="w-3.5 h-3.5 opacity-30" />

            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-success-green animate-pulse" />
              <span>Trust Improves</span>
            </div>

          </div>
          
          <p className="text-[10px] text-text-secondary max-w-lg mx-auto leading-relaxed">
            "Every verified conflict helps the system better understand which operational data sources are reliable."
          </p>
        </CardContent>
      </Card>

    </div>
  );
};

export default TrustCenter;
