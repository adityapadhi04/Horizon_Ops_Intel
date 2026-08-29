import React, { useState } from 'react';
import { Bell, Search, RefreshCw, ChevronRight, User, Terminal } from 'lucide-react';

export const Header = ({ 
  lastUpdated, 
  alertCount = 0, 
  onTriggerSync, 
  syncing = false,
  onOpenAlerts,
  currentTab
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
      settings: 'Settings'
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
            className="w-8 h-8 rounded-lg bg-accent-blue/20 border border-accent-blue/40 text-accent-blue hover:border-accent-blue/60 flex items-center justify-center font-bold text-sm shadow-sm transition-all focus:outline-none"
          >
            SJ
          </button>
          
          {showProfileDropdown && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-white/5 bg-command-secondary/95 shadow-2xl backdrop-blur-xl p-2 z-50 animate-fade-in">
              <div className="p-3">
                <p className="text-xs font-semibold text-text-primary">Sarah Jenkins</p>
                <p className="text-[10px] text-text-secondary">s.jenkins@horizon.org</p>
              </div>
              <div className="h-px bg-white/5 my-1" />
              <button 
                onClick={() => { setShowProfileDropdown(false); }}
                className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-xs text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-lg transition-all"
              >
                <User className="w-3.5 h-3.5" />
                <span>Administrator Profile</span>
              </button>
              <button 
                onClick={() => { setShowProfileDropdown(false); }}
                className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-xs text-danger-red hover:bg-danger-red/10 rounded-lg transition-all"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Console Log Out</span>
              </button>
            </div>
          )}
        </div>

      </div>

    </header>
  );
};

export default Header;
