import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  TrendingUp, 
  GitCompare, 
  Brain, 
  ShieldCheck, 
  History, 
  Beaker, 
  Bell, 
  Sparkles, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  Activity as HospitalIcon,
  Check
} from 'lucide-react';

const sidebarItems = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'operations', label: 'Operations', icon: TrendingUp },
  { id: 'reconciliation', label: 'Reconciliation', icon: GitCompare },
  { id: 'predictive', label: 'Predictive Intelligence', icon: Sparkles },
  { id: 'conflicts', label: 'Conflict Intelligence', icon: Brain, badge: true },
  { id: 'trust', label: 'Trust Center', icon: ShieldCheck },
  { id: 'audit', label: 'Audit Trail', icon: History },
  { id: 'sandbox', label: 'Rule Sandbox', icon: Beaker },
  { id: 'alerts', label: 'Alerts', icon: Bell, alertBadge: true },
  { id: 'demo', label: 'Demo Live', icon: Sparkles, demoPulse: true },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar = ({ 
  currentTab, 
  setCurrentTab, 
  collapsed, 
  setCollapsed,
  conflictCount = 0,
  alertCount = 0,
  demoRunning = false,
  activeRole = 'administrator',
  currentUser = {},
  roles = {},
  onRoleChange
}) => {
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  return (
    <div 
      className={`h-screen bg-command-secondary border-r border-white/5 flex flex-col justify-between transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Top Header */}
      <div>
        <div className="p-4 flex items-center justify-between border-b border-white/5 relative">
          <div className="flex items-center gap-3 overflow-hidden select-none">
            <div className="w-8 h-8 rounded-lg bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center flex-shrink-0">
              <HospitalIcon className="w-4.5 h-4.5 text-accent-cyan animate-pulse" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-heading font-extrabold text-sm tracking-wider text-text-primary">HORIZON</span>
                <span className="text-[9px] font-bold text-accent-cyan tracking-widest leading-none">OPERATIONS INTEL</span>
              </div>
            )}
          </div>
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-md border border-white/5 bg-white/[0.02] text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation list */}
        <nav className="p-3 flex flex-col gap-1.5 overflow-y-auto max-h-[calc(100vh-160px)]">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            
            let count = 0;
            if (item.badge) count = conflictCount;
            if (item.alertBadge) count = alertCount;

            const emphasizedTabs = {
              administrator: ['overview', 'alerts', 'trust'],
              nursing: ['overview', 'operations', 'reconciliation'],
              bedManager: ['overview', 'operations', 'reconciliation'],
              dataAdmin: ['reconciliation', 'trust', 'audit']
            };
            const activeEmphasized = emphasizedTabs[activeRole] || [];
            const isEmphasized = activeEmphasized.includes(item.id);

            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full group flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all relative ${
                  isActive 
                    ? 'bg-command-card text-accent-cyan border-accent-cyan/20 glow-cyan font-semibold' 
                    : 'text-text-secondary border-transparent hover:text-text-primary hover:bg-white/[0.02]'
                }`}
              >
                {/* Active Left Indicator */}
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-accent-cyan glow-cyan" />
                )}

                <Icon className={`w-4.5 h-4.5 flex-shrink-0 transition-transform ${
                  isActive ? 'text-accent-cyan' : 'text-text-secondary group-hover:scale-105'
                }`} />

                {!collapsed && (
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs tracking-wide">{item.label}</span>
                    {isEmphasized && (
                      <span className="text-[8px] font-bold text-accent-cyan bg-accent-cyan/10 px-1 py-0.2 rounded uppercase border border-accent-cyan/25 flex-shrink-0">
                        Priority
                      </span>
                    )}
                  </div>
                )}

                {/* Badges */}
                {!collapsed && count > 0 && (
                  <span className={`ml-auto px-1.5 py-0.5 text-[9px] font-bold rounded-full border leading-none ${
                    item.alertBadge 
                      ? 'bg-danger-red/10 text-danger-red border-danger-red/20' 
                      : 'bg-warning-amber/10 text-warning-amber border-warning-amber/20'
                  }`}>
                    {count}
                  </span>
                )}

                {/* Demo Pulse */}
                {!collapsed && item.demoPulse && demoRunning && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-accent-cyan pulse-dot-cyan flex-shrink-0" />
                )}

                {/* Collapsed dot indicators */}
                {collapsed && count > 0 && (
                  <span className={`absolute top-1 right-1 w-2 h-2 rounded-full border border-command-secondary ${
                    item.alertBadge ? 'bg-danger-red' : 'bg-warning-amber'
                  }`} />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile card */}
      <div className="p-3 border-t border-white/5 bg-command-secondary/50 relative">
        {/* Role switching dropdown */}
        {showRoleDropdown && !collapsed && (
          <div className="absolute bottom-16 left-3 right-3 rounded-xl border border-white/5 bg-command-secondary/95 shadow-2xl backdrop-blur-xl p-2 z-50 animate-fade-in flex flex-col gap-1">
            <p className="text-[9px] font-extrabold text-accent-cyan uppercase tracking-wider px-2 py-1 select-none">Switch Persona</p>
            {Object.keys(roles).map((key) => {
              const roleItem = roles[key];
              const isCurrent = activeRole === key;
              return (
                <button
                  key={key}
                  onClick={() => {
                    if (onRoleChange) onRoleChange(key);
                    setShowRoleDropdown(false);
                  }}
                  className={`w-full text-left flex items-center justify-between px-2 py-1.5 rounded-lg transition-all border ${
                    isCurrent 
                      ? 'bg-accent-cyan/10 text-accent-cyan border-accent-cyan/25 font-bold' 
                      : 'text-text-secondary border-transparent hover:text-text-primary hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold ${
                      isCurrent ? 'bg-accent-cyan/20 text-accent-cyan' : 'bg-white/5 text-text-secondary'
                    }`}>
                      {roleItem.initials}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] leading-none">{roleItem.name}</span>
                      <span className="text-[8px] opacity-70 mt-0.5">{roleItem.role}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {!collapsed ? (
          <div 
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="flex flex-col gap-3 cursor-pointer hover:bg-white/[0.02] p-1.5 rounded-lg transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-accent-cyan/15 border border-accent-cyan/30 flex items-center justify-center font-bold text-accent-cyan text-sm shadow-sm select-none">
                {currentUser?.initials || 'AP'}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-text-primary truncate">{currentUser?.name || 'Aditya Parhi'}</span>
                <span className="text-[10px] text-text-secondary truncate">{currentUser?.role || 'Hospital Administrator'}</span>
              </div>
            </div>
            
            {/* Systems Operations Marker */}
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-success-green/5 border border-success-green/10 text-success-green select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-success-green animate-pulse" />
              <span className="text-[10px] font-bold tracking-wider uppercase">Systems Operational</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div 
              className="w-9 h-9 rounded-lg bg-accent-cyan/15 border border-accent-cyan/30 flex items-center justify-center font-bold text-accent-cyan text-sm cursor-pointer"
              title={`${currentUser?.name} (${currentUser?.role})`}
              onClick={() => {
                const roleKeys = Object.keys(roles);
                const currentIndex = roleKeys.indexOf(activeRole);
                const nextIndex = (currentIndex + 1) % roleKeys.length;
                if (onRoleChange) onRoleChange(roleKeys[nextIndex]);
              }}
            >
              {currentUser?.initials || 'AP'}
            </div>
            <span className="w-2 h-2 rounded-full bg-success-green animate-pulse" title="All Systems Operational" />
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
