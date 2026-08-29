import React from 'react';
import { AreaChart, Area, ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Badge } from './Badge';

// 1. SourceTrustGauge: Circular animated gauge
export const SourceTrustGauge = ({ value = 88, title = 'Overall Trust', subtitle = 'Highly Reliable' }) => {
  const radius = 55;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative flex items-center justify-center" style={{ width: radius * 2, height: radius * 2 }}>
        {/* Glow effect background */}
        <div className="absolute inset-2 rounded-full bg-accent-cyan/5 blur-md" />
        
        <svg height={radius * 2} width={radius * 2} className="transform -rotate-90 overflow-visible z-10">
          {/* Base track circle */}
          <circle
            stroke="rgba(255,255,255,0.03)"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          {/* Active glow track */}
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
            className="drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]"
          />
        </svg>
        
        {/* Score Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
          <motion.span 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-2xl font-extrabold tracking-tight text-white font-heading"
          >
            {value}
          </motion.span>
          <span className="text-[9px] font-bold text-text-secondary uppercase">/ 100</span>
        </div>
      </div>
      
      {title && (
        <div className="mt-3 text-xs font-bold uppercase tracking-wider text-text-primary text-center">
          {title}
        </div>
      )}
      {subtitle && (
        <div className="text-[10px] text-accent-cyan font-bold tracking-widest uppercase mt-0.5">
          {subtitle}
        </div>
      )}
    </div>
  );
};

// 2. MetricSparkline: Mini Recharts Area Sparkline
export const MetricSparkline = ({ data = [50, 60, 45, 75, 80, 85, 90], color = '#22D3EE', height = 40 }) => {
  const chartData = data.map((val, idx) => ({ id: idx, value: val }));
  
  return (
    <div style={{ width: '120px', height: `${height}px` }} className="overflow-hidden">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <defs>
            <linearGradient id={`colorValue-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.2}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke={color} 
            strokeWidth={1.5} 
            fillOpacity={1} 
            fill={`url(#colorValue-${color.replace('#','')})`} 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// 3. ReconciliationFlowChart: Dynamic diagram connecting streams to unified ledger
export const ReconciliationFlowChart = ({ hisStatus = 96, labStatus = 94, bedStatus = 79 }) => {
  return (
    <div className="w-full bg-white/[0.01] border border-white/5 rounded-xl p-6 overflow-hidden">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative">
        
        {/* Source Nodes */}
        <div className="flex flex-col gap-4 w-full md:w-1/3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-command-secondary border border-white/5 hover:border-accent-blue/30 transition-all">
            <span className="text-xs font-bold text-text-primary uppercase tracking-wide">Epic HIS admissions</span>
            <Badge variant="success">{hisStatus}% Reliability</Badge>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-command-secondary border border-white/5 hover:border-accent-purple/30 transition-all">
            <span className="text-xs font-bold text-text-primary uppercase tracking-wide">LIS lab results</span>
            <Badge variant="success">{labStatus}% Reliability</Badge>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-command-secondary border border-white/5 hover:border-warning-amber/30 transition-all">
            <span className="text-xs font-bold text-text-primary uppercase tracking-wide">Nursing bed board</span>
            <Badge variant="warning">{bedStatus}% Reliability</Badge>
          </div>
        </div>

        {/* Center: Pipeline node */}
        <div className="flex flex-col items-center justify-center relative w-full md:w-1/4">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-accent-cyan/5 border border-accent-cyan/15 animate-ping opacity-70" />
          </div>
          <div className="w-14 h-14 rounded-full bg-command-base border border-accent-cyan/30 flex items-center justify-center z-10 shadow-lg shadow-accent-cyan/5">
            <Sparkles className="w-6 h-6 text-accent-cyan animate-pulse" />
          </div>
          <span className="text-[10px] font-extrabold uppercase text-accent-cyan tracking-widest mt-2">Reconciliation Engine</span>
        </div>

        {/* Right: Output Node */}
        <div className="w-full md:w-1/3 p-4 rounded-lg bg-command-card border border-accent-cyan/20 glow-cyan flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-accent-cyan tracking-wider">Unified Operational View</span>
            <span className="w-2 h-2 rounded-full bg-success-green animate-pulse" />
          </div>
          <p className="text-[10px] text-text-secondary leading-relaxed">
            Normalized, matched, and auto-resolved ledger verified. Discrepancies isolated for human review.
          </p>
        </div>

      </div>
    </div>
  );
};
