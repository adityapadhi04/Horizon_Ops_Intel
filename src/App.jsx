import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { useStore } from './store/useStore';
import ErrorBoundary from './components/ErrorBoundary';

// Import Views
import { Overview } from './views/Overview';
import { Operations } from './views/Operations';
import { Reconciliation } from './views/Reconciliation';
import { ConflictIntel } from './views/ConflictIntel';
import { TrustCenter } from './views/TrustCenter';
import { AuditTrail } from './views/AuditTrail';
import { RuleSandbox } from './views/RuleSandbox';
import { AlertsView } from './views/AlertsView';
import { DemoLiveMode } from './views/DemoLiveMode';
import { SettingsView } from './views/SettingsView';
import { Predictive } from './views/Predictive';

export const roles = {
  administrator: {
    key: "administrator",
    name: "Aditya Parhi",
    role: "Hospital Administrator",
    initials: "AP"
  },
  nursing: {
    key: "nursing",
    name: "Akshaya",
    role: "Nursing Supervisor",
    initials: "AK"
  },
  bedManager: {
    key: "bedManager",
    name: "Sparsh",
    role: "Bed Manager",
    initials: "SS"
  },
  dataAdmin: {
    key: "dataAdmin",
    name: "Supriya",
    role: "Data Administrator",
    initials: "SU"
  }
};

export const App = () => {
  const [currentTab, setCurrentTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Global User Role State
  const [activeRole, setActiveRole] = useState(() => {
    return localStorage.getItem("activeHospitalRole") || "administrator";
  });

  const currentUser = roles[activeRole] || roles.administrator;

  const [roleToast, setRoleToast] = useState(null);

  const handleRoleChange = (roleKey) => {
    setActiveRole(roleKey);
    localStorage.setItem("activeHospitalRole", roleKey);

    const u = roles[roleKey];
    setRoleToast({
      message: `👋 Switched to ${u.name}`,
      subtitle: `${u.role} mode enabled`
    });

    setTimeout(() => {
      setRoleToast(null);
    }, 4000);
  };

  // Restricted Routing Redirect checks
  useEffect(() => {
    const allowedMap = {
      administrator: ['overview', 'operations', 'reconciliation', 'conflicts', 'trust', 'audit', 'sandbox', 'alerts', 'demo', 'settings', 'predictive'],
      nursing: ['overview', 'operations', 'reconciliation', 'alerts', 'audit', 'demo', 'predictive'],
      bedManager: ['overview', 'operations', 'reconciliation', 'alerts', 'demo', 'predictive'],
      dataAdmin: ['overview', 'reconciliation', 'conflicts', 'trust', 'audit', 'sandbox', 'alerts', 'settings', 'demo', 'predictive']
    };
    const allowed = allowedMap[activeRole] || allowedMap.administrator;
    if (!allowed.includes(currentTab)) {
      setCurrentTab('overview');
    }
  }, [activeRole, currentTab]);

  // Zustand State hooks
  const loadAll = useStore(state => state.loadAll);
  const activeConflicts = useStore(state => state.activeConflicts);
  const alerts = useStore(state => state.alerts);
  const settings = useStore(state => state.settings);

  // Initialize and Poll
  useEffect(() => {
    loadAll();
    const interval = setInterval(() => {
      loadAll();
    }, 2000); // Poll every 2 seconds
    return () => clearInterval(interval);
  }, [loadAll]);

  const renderViewContent = () => {
    let view;
    switch (currentTab) {
      case 'overview':
        view = <Overview setCurrentTab={setCurrentTab} currentUser={currentUser} activeRole={activeRole} />;
        break;
      case 'operations':
        view = <Operations currentUser={currentUser} activeRole={activeRole} />;
        break;
      case 'reconciliation':
        view = <Reconciliation currentUser={currentUser} activeRole={activeRole} />;
        break;
      case 'conflicts':
        view = <ConflictIntel currentUser={currentUser} activeRole={activeRole} />;
        break;
      case 'trust':
        view = <TrustCenter currentUser={currentUser} activeRole={activeRole} />;
        break;
      case 'audit':
        view = <AuditTrail currentUser={currentUser} activeRole={activeRole} />;
        break;
      case 'sandbox':
        view = <RuleSandbox currentUser={currentUser} activeRole={activeRole} />;
        break;
      case 'alerts':
        view = <AlertsView setCurrentTab={setCurrentTab} currentUser={currentUser} activeRole={activeRole} />;
        break;
      case 'demo':
        view = <DemoLiveMode currentUser={currentUser} activeRole={activeRole} />;
        break;
      case 'settings':
        view = <SettingsView setCurrentTab={setCurrentTab} currentUser={currentUser} activeRole={activeRole} />;
        break;
      case 'predictive':
        view = <Predictive currentUser={currentUser} activeRole={activeRole} />;
        break;
      default:
        view = <Overview setCurrentTab={setCurrentTab} currentUser={currentUser} activeRole={activeRole} />;
    }

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={currentTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
          className="h-full"
        >
          <ErrorBoundary>
            {view}
          </ErrorBoundary>
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className="flex bg-command-base min-h-screen text-text-primary overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        collapsed={sidebarCollapsed} 
        setCollapsed={setSidebarCollapsed}
        conflictCount={activeConflicts.length}
        alertCount={alerts.length}
        demoRunning={settings.running}
        activeRole={activeRole}
        currentUser={currentUser}
        roles={roles}
        onRoleChange={handleRoleChange}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header 
          lastUpdated={Date.now()} 
          alertCount={alerts.length} 
          onTriggerSync={loadAll}
          syncing={false}
          onOpenAlerts={() => setCurrentTab('alerts')}
          currentTab={currentTab}
          activeRole={activeRole}
          currentUser={currentUser}
          roles={roles}
          onRoleChange={handleRoleChange}
        />

        {/* View wrapper */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {renderViewContent()}
        </main>
      </div>

      {/* Toast Switch Indicator */}
      <AnimatePresence>
        {roleToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-6 right-6 bg-accent-cyan text-command-base font-bold text-xs px-4 py-3 rounded-lg shadow-xl shadow-accent-cyan/15 z-55 flex flex-col gap-0.5"
          >
            <span>{roleToast.message}</span>
            <span className="text-[10px] text-command-base/80 font-normal">{roleToast.subtitle}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
