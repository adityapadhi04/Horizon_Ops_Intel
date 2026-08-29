import React, { useState } from 'react';
import { Bell, Search, RefreshCw, ChevronRight, User, Terminal } from 'lucide-react';

export const Header = ({ 
  lastUpdated, 
  alertCount = 0, 
  onTriggerSync, 
  syncing = false,
  onOpenAlerts,
  currentTab,
  activeRole,
  currentUser,
  roles = {},
  onRoleChange
}) => {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const getTabLabel = (tabId) => {
    const labels = {
      overview: 'Overview',
      operations: 'Operations',
      reconciliation: 'Reconciliation',
      conflicts: 'Conflict Intelligence',
      trust: 'Trust Center',
      audit: 'Audit Trail',
      sandbox: 'Rule Sandbox',
      alerts: 'Alerts',
      demo: 'Demo Live',
      settings: 'Settings',
      predictive: 'Predictive Intelligence'
    };
    return labels[tabId] || tabId;
  };

  return (
    <header className="h-16 border-b border-white/5 bg-command-base/60 backdrop-blur-md px-6 flex items-center justify-between select-none z-10">
      
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-text-secondary font-medium">Operations</span>
        <ChevronRight className="w-3.5 h-3.5 text-white/20" />
        <span className="text-accent-cyan font-bold tracking-wide">{getTabLabel(currentTab)}</span>
      </div>

      {/* Center: Live Sync Pulse */}
      <div className="hidden md:flex items-center gap-4 border border-white/5 bg-white/[0.01] px-3.5 py-1.5 rounded-full">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-success-green animate-pulse" />
          <span className="text-[10px] font-extrabold uppercase text-success-green tracking-widest">● LIVE</span>
        </div>
        <span className="text-[10px] text-text-secondary font-medium tracking-wide">Operational Data Streaming</span>
        <span className="w-px h-3 bg-white/10" />
        <div className="flex items-center gap-2 text-[10px] text-text-secondary">
          <span className="font-semibold">Last Sync:</span>
          <span className="font-mono">2s ago</span>
          <button 
            onClick={onTriggerSync}
            disabled={syncing}
            className={`text-accent-cyan hover:text-accent-cyan-light transition-colors ml-1 ${
              syncing ? 'animate-spin' : ''
            }`}
            title="Force Data Sync"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Right: Search, Alerts & User Bubble */}
      <div className="flex items-center gap-4">
        {/* Search Command palette shortcut */}
        <div className="relative hidden lg:flex items-center bg-white/[0.02] border border-white/5 hover:border-white/10 rounded-lg px-3 py-1.5 transition-all w-48">
          <Search className="w-3.5 h-3.5 text-text-secondary mr-2" />
          <span className="text-xs text-text-secondary select-none">Quick Search...</span>
          <span className="ml-auto text-[9px] font-bold text-text-secondary bg-white/5 border border-white/10 rounded-md px-1.5 py-0.5 leading-none">
            ⌘K
          </span>
        </div>

        {/* Alerts Notification Button */}
        <button 
          onClick={onOpenAlerts}
          className="p-2 rounded-lg border border-white/5 bg-white/[0.01] text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all relative"
        >
          <Bell className="w-4.5 h-4.5" />
          {alertCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-danger-red text-white text-[9px] font-extrabold rounded-full px-1.5 py-0.5 border border-command-base min-w-5 h-5 flex items-center justify-center shadow-lg">
              {alertCount}
            </span>
          )}
        </button>

        {/* User profile dropdown bubble */}
        <div className="relative">
          <button 
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="w-8 h-8 rounded-lg bg-accent-blue/20 border border-accent-blue/40 text-accent-blue hover:border-accent-blue/60 flex items-center justify-center font-bold text-xs shadow-sm transition-all focus:outline-none"
            title={`Active Role: ${currentUser?.role || 'Hospital Administrator'}`}
          >
            {currentUser?.initials || 'AP'}
          </button>
          
          {showProfileDropdown && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl border border-white/5 bg-command-secondary/95 shadow-2xl backdrop-blur-xl p-2.5 z-50 animate-fade-in">
              <div className="p-2 border-b border-white/5 mb-2">
                <p className="text-xs font-bold text-text-primary">{currentUser?.name || 'Aditya Parhi'}</p>
                <p className="text-[10px] text-text-secondary">{currentUser?.role || 'Hospital Administrator'}</p>
              </div>
              
              <div className="flex flex-col gap-1">
                <p className="text-[9px] font-extrabold text-accent-cyan uppercase tracking-wider px-2 py-0.5 select-none">Switch Active Persona</p>
                {Object.keys(roles).map((key) => {
                  const roleItem = roles[key];
                  const isCurrent = activeRole === key;
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        if (onRoleChange) onRoleChange(key);
                        setShowProfileDropdown(false);
                      }}
                      className={`w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-all border ${
                        isCurrent 
                          ? 'bg-accent-cyan/10 text-accent-cyan border-accent-cyan/20 font-bold' 
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
                          <span className="text-xs leading-none">{roleItem.name}</span>
                          <span className="text-[8px] opacity-70 mt-0.5">{roleItem.role}</span>
                        </div>
                      </div>
                      {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan glow-cyan" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

      </div>

    </header>
  );
};

export default Header;
