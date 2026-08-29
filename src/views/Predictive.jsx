import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid 
} from 'recharts';
import { 
  Activity, Sparkles, AlertTriangle, ShieldCheck, Thermometer, Box, TrendingUp, AlertCircle, Info, Calendar, UserCheck
} from 'lucide-react';

export const Predictive = ({ currentUser, activeRole }) => {
  const [overview, setOverview] = useState(null);
  const [clusters, setClusters] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [preparedness, setPreparedness] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [overviewRes, clustersRes, forecastRes, preparednessRes] = await Promise.all([
        axios.get('/api/predictive/overview'),
        axios.get('/api/predictive/clusters'),
        axios.get('/api/predictive/forecast'),
        axios.get('/api/predictive/preparedness')
      ]);
      setOverview(overviewRes.data);
      setClusters(clustersRes.data);
      setForecast(forecastRes.data);
      setPreparedness(preparednessRes.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching predictive data:", err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  const getStatusConfig = (status = 'Safe') => {
    const configs = {
      Safe: { border: 'border-success-green/20 bg-success-green/5', variant: 'success', text: 'Safe' },
      Attention: { border: 'border-accent-blue/20 bg-accent-blue/5', variant: 'info', text: 'Attention' },
      Warning: { border: 'border-warning-amber/20 bg-warning-amber/5', variant: 'warning', text: 'Warning' },
      Critical: { border: 'border-danger-red/20 bg-danger-red/5', variant: 'critical', text: 'Critical' }
    };
    return configs[status] || configs.Safe;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-accent-cyan border-t-transparent animate-spin" />
        <span className="text-xs text-text-secondary">Synthesizing predictive models...</span>
      </div>
    );
  }

  const summary = overview?.summary || {};
  const forecastData = forecast?.forecast || [];

  // Generate 7-day admissions surge projection chart data dynamically
  const minSurge = summary.minPredictedSurge || 2;
  const maxSurge = summary.maxPredictedSurge || 6;
  const baseAdmissions = 15;
  const chartData = [
    { day: 'Day 1', baseline: baseAdmissions, surge: baseAdmissions + Math.round(minSurge * 0.8) },
    { day: 'Day 2', baseline: baseAdmissions, surge: baseAdmissions + Math.round(minSurge * 1.1) },
    { day: 'Day 3', baseline: baseAdmissions, surge: baseAdmissions + Math.round(maxSurge * 0.9) },
    { day: 'Day 4', baseline: baseAdmissions, surge: baseAdmissions + Math.round(maxSurge * 1.2) },
    { day: 'Day 5', baseline: baseAdmissions, surge: baseAdmissions + Math.round(maxSurge * 1.0) },
    { day: 'Day 6', baseline: baseAdmissions, surge: baseAdmissions + Math.round(minSurge * 1.3) },
    { day: 'Day 7', baseline: baseAdmissions, surge: baseAdmissions + Math.round(minSurge * 0.9) }
  ];

  return (
    <div className="flex flex-col gap-6">
      
      {/* Page Header */}
      <div className="border-b border-white/5 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white font-heading">
            Predictive Intelligence
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Detect geographical clusters, project seasonal epidemiological trends, and assess real-time bed and inventory readiness.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-text-secondary bg-white/[0.02] border border-white/5 px-3 py-1.5 rounded-full select-none self-start">
          <Calendar className="w-3.5 h-3.5 text-accent-cyan" />
          <span className="font-semibold uppercase">Surveillance Window:</span>
          <span className="font-mono text-white">Next 7 Days</span>
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Active Clusters */}
        <Card className={`border ${getStatusConfig(summary.highRiskClustersCount > 0 ? 'Warning' : 'Safe').border}`}>
          <CardContent className="flex flex-col justify-between h-28 p-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-text-secondary tracking-widest uppercase">Active Disease Clusters</span>
              <Badge variant={summary.highRiskClustersCount > 0 ? 'warning' : 'success'}>
                {summary.highRiskClustersCount > 0 ? 'Warning' : 'Safe'}
              </Badge>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <h2 className="text-2xl font-extrabold text-white font-heading">{summary.activeClustersCount}</h2>
              <span className="text-[10px] text-text-secondary">active outbreaks</span>
            </div>
            <p className="text-[10px] text-text-secondary truncate mt-1">
              {summary.highRiskClustersCount} high-risk hot zones identified
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Surge Projections */}
        <Card className={`border ${getStatusConfig(summary.surgeRiskLevel).border}`}>
          <CardContent className="flex flex-col justify-between h-28 p-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-text-secondary tracking-widest uppercase">Daily Surge Forecast</span>
              <Badge variant={getStatusConfig(summary.surgeRiskLevel).variant}>
                {summary.surgeRiskLevel}
              </Badge>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <h2 className="text-2xl font-extrabold text-white font-heading">+{summary.percentageIncrease}%</h2>
              <span className="text-[10px] text-text-secondary">avg daily growth</span>
            </div>
            <p className="text-[10px] text-text-secondary truncate mt-1">
              Proj. {summary.predictedDailySurge} daily admissions
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Bed Preparedness */}
        <Card className={`border ${getStatusConfig(summary.bedStatus).border}`}>
          <CardContent className="flex flex-col justify-between h-28 p-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-text-secondary tracking-widest uppercase">Bed Preparedness</span>
              <Badge variant={getStatusConfig(summary.bedStatus).variant}>
                {getStatusConfig(summary.bedStatus).text}
              </Badge>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <h2 className="text-2xl font-extrabold text-white font-heading">{summary.availableBeds}</h2>
              <span className="text-[10px] text-text-secondary">vacant beds available</span>
            </div>
            <p className="text-[10px] text-text-secondary truncate mt-1">
              Peak demand projection: {summary.maxPredictedSurge} beds
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Inventory Readiness */}
        <Card className={`border ${getStatusConfig(summary.inventoryStatus).border}`}>
          <CardContent className="flex flex-col justify-between h-28 p-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-text-secondary tracking-widest uppercase">Inventory Readiness</span>
              <Badge variant={getStatusConfig(summary.inventoryStatus).variant}>
                {getStatusConfig(summary.inventoryStatus).text}
              </Badge>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <h2 className="text-2xl font-extrabold text-white font-heading">
                {summary.inventoryCount - summary.criticalInventoryItems}/{summary.inventoryCount}
              </h2>
              <span className="text-[10px] text-text-secondary">supply lines clear</span>
            </div>
            <p className="text-[10px] text-text-secondary truncate mt-1">
              {summary.criticalInventoryItems} critical stock shortage warnings
            </p>
          </CardContent>
        </Card>

      </div>

      {/* Grid: Clusters + Weather Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Clusters Table */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-accent-cyan rounded-full animate-pulse" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-text-primary">Geographic Outbreak Tracker</h3>
          </div>
          
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs select-none">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.01] text-text-secondary font-bold text-[10px] uppercase tracking-wider">
                    <th className="p-4">Geographic Area</th>
                    <th className="p-4">Disease Variant</th>
                    <th className="p-4">Active Cases</th>
                    <th className="p-4">Trend Slope</th>
                    <th className="p-4 text-right">Risk Assessment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {clusters.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-text-secondary">
                        No active disease clusters detected in surveillance zones.
                      </td>
                    </tr>
                  ) : (
                    clusters.map((c) => (
                      <tr key={c.id} className="hover:bg-white/[0.01] transition-all">
                        <td className="p-4 font-bold text-text-primary">{c.area}</td>
                        <td className="p-4 font-medium text-text-secondary">
                          <span className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent-purple" />
                            {c.disease}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-text-primary">{c.cases}</td>
                        <td className="p-4">
                          <span className={`flex items-center gap-1 font-bold ${
                            c.trend === 'Increasing' ? 'text-danger-red' : 'text-text-secondary'
                          }`}>
                            {c.trend === 'Increasing' ? '📈 Increasing' : '➡️ Stable'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <Badge variant={c.risk === 'High' ? 'critical' : 'warning'}>
                            {c.risk} Risk
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right: Weather / Season Forecast */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-4 bg-accent-cyan rounded-full animate-pulse" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-text-primary">Seasonal Weather Forecast</h3>
            </div>
            <Badge variant="info">
              ⛅ Season: {forecast?.season}
            </Badge>
          </div>

          <Card className="flex-1 flex flex-col justify-between">
            <CardContent className="flex flex-col gap-4 p-5">
              <div className="flex flex-col gap-3">
                {forecastData.map((f, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-command-secondary border border-white/5 hover:border-white/10 transition-all">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-text-primary">{f.disease}</span>
                      <span className="text-[9px] text-text-secondary mt-0.5">Historical Baseline: {f.historicalRate}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <Badge variant={f.risk === 'High' ? 'critical' : 'warning'}>
                        {f.risk} RISK
                      </Badge>
                      <span className="text-[8px] text-danger-red font-bold mt-1">📈 {f.trend}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Forecast disclaimer warning box */}
              <div className="p-3 rounded-lg bg-warning-amber/5 border border-warning-amber/15 text-warning-amber text-[10px] leading-relaxed flex gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <div>
                  <span className="font-bold block uppercase tracking-wider">Operational Forecast</span>
                  Projections are rule-based aggregates combining historic seasonality matrices and local disease triggers. Not clinical ML models.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Grid: Admissions Chart + Bed/Inventory status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Admissions Chart */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-accent-cyan rounded-full animate-pulse" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-text-primary">7-Day Admissions Surge Projections</h3>
          </div>

          <Card className="p-5 flex flex-col justify-between h-[320px]">
            <ResponsiveContainer width="100%" height="95%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="surgeColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="baselineColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0d1321', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}
                  labelStyle={{ color: '#94a3b8', fontSize: '10px', fontWeight: 'bold' }}
                />
                <Area type="monotone" name="Baseline Load" dataKey="baseline" stroke="#22d3ee" strokeWidth={1.5} fillOpacity={1} fill="url(#baselineColor)" />
                <Area type="monotone" name="Projected Surge" dataKey="surge" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#surgeColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Preparedness Bed & Supply levels */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-accent-cyan rounded-full animate-pulse" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-text-primary">Resource Preparedness Assessment</h3>
          </div>

          <Card className="flex-1 flex flex-col justify-between">
            <CardContent className="p-5 flex flex-col gap-4">
              
              {/* Bed warning status bar */}
              <div className={`p-3 rounded-xl border flex gap-3 ${
                summary.bedStatus === 'Critical' ? 'bg-danger-red/5 border-danger-red/15 text-danger-red' : (summary.bedStatus === 'Warning' ? 'bg-warning-amber/5 border-warning-amber/15 text-warning-amber' : 'bg-success-green/5 border-success-green/10 text-success-green')
              }`}>
                {summary.bedStatus === 'Critical' || summary.bedStatus === 'Warning' ? (
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                ) : (
                  <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex flex-col text-[10px]">
                  <span className="font-extrabold uppercase tracking-wider">Bed Status: {summary.bedMessage}</span>
                  <span className="text-text-secondary mt-1 font-medium">
                    Available beds: {summary.availableBeds} units. Expected surge: {summary.minPredictedSurge}-{summary.maxPredictedSurge} beds.
                  </span>
                </div>
              </div>

              {/* Medicine levels */}
              <div className="flex flex-col gap-2">
                <span className="text-[9px] font-bold text-text-secondary uppercase tracking-wider mb-1 block">Supply Inventory Tracker</span>
                {preparedness?.inventory.map((inv) => {
                  const isShortage = inv.available < inv.required;
                  return (
                    <div key={inv.id} className="flex items-center justify-between p-2 border border-white/5 hover:border-white/10 rounded-lg transition-all text-[11px] bg-white/[0.01]">
                      <div className="flex items-center gap-2">
                        <Box className={`w-3.5 h-3.5 ${isShortage ? 'text-danger-red' : 'text-text-secondary'}`} />
                        <span className="font-semibold text-text-primary">{inv.item}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className={`font-bold block ${isShortage ? 'text-danger-red' : 'text-text-primary'}`}>
                            {inv.available} / {inv.required}
                          </span>
                          <span className="text-[8px] text-text-secondary uppercase">{inv.unit}</span>
                        </div>
                        <Badge variant={isShortage ? 'critical' : 'success'}>
                          {isShortage ? 'SHORTAGE' : 'SAFE'}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>

            </CardContent>
          </Card>
        </div>

      </div>

      {/* Role-Based Recommendations */}
      <Card className="border-accent-cyan/20">
        <CardHeader className="flex flex-row items-center justify-between bg-white/[0.01]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center flex-shrink-0">
              <UserCheck className="w-5 h-5 text-accent-cyan" />
            </div>
            <div>
              <CardTitle>Role-Based Recommendations</CardTitle>
              <CardDescription>Preparedness measures customized for the selected operations role</CardDescription>
            </div>
          </div>
          <Badge variant="info">
            👤 Active Profile: {currentUser?.name}
          </Badge>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Personas overview summary column selector */}
            <div className="md:col-span-1 flex flex-col gap-2 border-r border-white/5 pr-4">
              <p className="text-[9px] font-bold text-text-secondary uppercase tracking-wider mb-1">Surveillance Team roles</p>
              <div className="flex flex-col gap-1.5">
                <div className={`p-2 rounded-lg text-xs font-semibold ${activeRole === 'administrator' ? 'bg-accent-cyan/15 border border-accent-cyan/35 text-accent-cyan' : 'text-text-secondary bg-white/[0.01] border border-transparent'}`}>
                  🏥 Aditya Parhi
                </div>
                <div className={`p-2 rounded-lg text-xs font-semibold ${activeRole === 'nursing' ? 'bg-accent-cyan/15 border border-accent-cyan/35 text-accent-cyan' : 'text-text-secondary bg-white/[0.01] border border-transparent'}`}>
                  👩⚕️ Akshaya
                </div>
                <div className={`p-2 rounded-lg text-xs font-semibold ${activeRole === 'bedManager' ? 'bg-accent-cyan/15 border border-accent-cyan/35 text-accent-cyan' : 'text-text-secondary bg-white/[0.01] border border-transparent'}`}>
                  🛏️ Sparsh
                </div>
                <div className={`p-2 rounded-lg text-xs font-semibold ${activeRole === 'dataAdmin' ? 'bg-accent-cyan/15 border border-accent-cyan/35 text-accent-cyan' : 'text-text-secondary bg-white/[0.01] border border-transparent'}`}>
                  💻 Supriya
                </div>
              </div>
            </div>

            {/* Dynamic Recommendations content column */}
            <div className="md:col-span-3 pl-2 flex flex-col justify-center">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-accent-cyan mb-2.5 block">
                🎯 Required Preparedness Directives ({currentUser?.role})
              </span>
              <div className="flex flex-col gap-3">
                {(overview?.recommendations[activeRole] || []).map((rec, index) => (
                  <div key={index} className="flex items-start gap-3 text-xs leading-relaxed hover:translate-x-1 transition-all">
                    <span className="w-1.5 h-1.5 bg-accent-cyan rounded-full mt-1.5 flex-shrink-0 glow-cyan" />
                    <span className="text-text-primary font-medium">{rec}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </CardContent>
      </Card>

    </div>
  );
};
