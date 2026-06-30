import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  ShieldAlert, 
  Heart, 
  Sparkles, 
  Users, 
  MessageSquare, 
  User, 
  Settings, 
  Crown, 
  Lock, 
  Menu, 
  X, 
  Bell, 
  AlertOctagon, 
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface AppShellProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  activeTab,
  onTabChange,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, role: 'USER' },
    { id: 'safety', label: 'Safety Hub', icon: ShieldAlert, role: 'USER', highlight: true },
    { id: 'health', label: 'Health Tracker', icon: Heart, role: 'USER' },
    { id: 'wellness', label: 'Wellness', icon: Sparkles, role: 'USER' },
    { id: 'community', label: 'Community', icon: Users, role: 'USER' },
    { id: 'experts', label: 'Expert Booking', icon: UserCheck, role: 'USER' },
    { id: 'chat', label: 'AI Chat', icon: MessageSquare, role: 'USER' },
    { id: 'profile', label: 'Profile', icon: User, role: 'USER' },
    { id: 'settings', label: 'Settings', icon: Settings, role: 'USER' },
    { id: 'premium', label: 'Premium', icon: Crown, role: 'USER', premium: true },
    { id: 'admin', label: 'Admin Panel', icon: Lock, role: 'ADMIN' },
  ];

  const handleSosTrigger = () => {
    alert('SOS Triggered! Dispatching location and notifying emergency contacts...');
  };

  return (
    <div className="min-h-screen flex bg-bg-surface text-text-primary overflow-x-hidden font-sans">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-bg-border bg-white sticky top-0 h-screen z-20">
        {/* Brand */}
        <div className="h-16 flex items-center px-6 border-b border-bg-border gap-2 bg-gradient-to-r from-primary-violet/5 to-transparent">
          <ShieldAlert className="h-6 w-6 text-primary-violet" />
          <span className="font-display font-bold text-lg text-primary-violet">SheNova AI</span>
        </div>

        {/* Quick SOS Trigger */}
        <div className="p-4 border-b border-bg-border">
          <button
            onClick={handleSosTrigger}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-state-error text-white font-bold hover:bg-red-600 transition-colors shadow-lg shadow-state-error/25 animate-pulse"
          >
            <AlertOctagon className="h-5 w-5" />
            <span>TRIGGER SOS</span>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 group
                  ${isActive 
                    ? 'bg-primary-violet text-white shadow-md shadow-primary-violet/10' 
                    : item.highlight
                    ? 'text-state-error hover:bg-state-error/5'
                    : 'text-text-secondary hover:bg-bg-surface hover:text-text-primary'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : item.highlight ? 'text-state-error' : 'text-text-secondary group-hover:text-primary-violet'}`} />
                  <span>{item.label}</span>
                </div>
                {item.premium && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">PRO</span>
                )}
                {isActive && <ChevronRight className="h-4 w-4 text-white" />}
              </button>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="p-6 border-t border-bg-border flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary-lavender flex items-center justify-center text-primary-violet font-bold font-display">
            JD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-text-primary truncate">Jane Doe</p>
            <p className="text-xs text-text-secondary truncate">jane@shenova.ai</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen pb-16 lg:pb-0">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-4 md:px-8 border-b border-bg-border bg-white/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-bg-surface lg:hidden text-text-primary"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-2 lg:hidden">
              <ShieldAlert className="h-6 w-6 text-primary-violet" />
              <span className="font-display font-bold text-lg text-primary-violet">SheNova AI</span>
            </div>
            <h2 className="hidden lg:block font-display font-bold text-lg text-text-primary">
              {menuItems.find(i => i.id === activeTab)?.label || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick SOS Header button - Mobile Only */}
            <button
              onClick={handleSosTrigger}
              className="lg:hidden p-2 rounded-full bg-state-error text-white hover:bg-red-600 transition-colors animate-pulse"
              aria-label="Trigger SOS"
            >
              <AlertOctagon className="h-5 w-5" />
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-full hover:bg-bg-surface text-text-secondary hover:text-text-primary transition-colors"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-state-error" />
              </button>

              {/* Notification Dropdown */}
              <AnimatePresence>
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-bg-border shadow-xl z-50 p-4"
                    >
                      <h4 className="font-display font-bold text-sm text-text-primary mb-3">Notifications</h4>
                      <div className="space-y-3">
                        <div className="p-2.5 rounded-lg bg-primary-blush/20 border border-primary-blush/10 text-xs">
                          <p className="font-semibold text-pink-700">Safety Check-In Reminder</p>
                          <p className="text-text-secondary mt-1">Please confirm you reached your destination safely.</p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-bg-surface text-xs">
                          <p className="font-semibold text-text-primary">Daily Cycle Insights</p>
                          <p className="text-text-secondary mt-1">Your follicular phase begins today. Read tips on nutrition.</p>
                        </div>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* User Profile */}
            <div className="h-8 w-8 rounded-full bg-primary-lavender flex items-center justify-center text-primary-violet text-xs font-bold font-display">
              JD
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Drawer Navigation Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black backdrop-blur-sm lg:hidden"
            />
            {/* Sidebar drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-64 bg-white z-50 flex flex-col border-r border-bg-border lg:hidden"
            >
              <div className="h-16 flex items-center justify-between px-6 border-b border-bg-border bg-gradient-to-r from-primary-violet/5 to-transparent">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-6 w-6 text-primary-violet" />
                  <span className="font-display font-bold text-lg text-primary-violet">SheNova AI</span>
                </div>
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1 rounded-full hover:bg-bg-surface text-text-secondary"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Quick SOS Mobile Drawer */}
              <div className="p-4 border-b border-bg-border">
                <button
                  onClick={handleSosTrigger}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-state-error text-white font-bold hover:bg-red-600 transition-colors shadow-lg"
                >
                  <AlertOctagon className="h-5 w-5" />
                  <span>TRIGGER SOS</span>
                </button>
              </div>

              {/* Drawer Menu Items */}
              <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onTabChange(item.id);
                        setIsSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200
                        ${isActive 
                          ? 'bg-primary-violet text-white shadow-md' 
                          : item.highlight
                          ? 'text-state-error hover:bg-state-error/5'
                          : 'text-text-secondary hover:bg-bg-surface hover:text-text-primary'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`h-5 w-5 ${isActive ? 'text-white' : item.highlight ? 'text-state-error' : 'text-text-secondary'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.premium && (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">PRO</span>
                      )}
                    </button>
                  );
                })}
              </nav>

              <div className="p-6 border-t border-bg-border flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary-lavender flex items-center justify-center text-primary-violet font-bold font-display">
                  JD
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-text-primary truncate">Jane Doe</p>
                  <p className="text-xs text-text-secondary truncate">jane@shenova.ai</p>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Tab Bar (Quick Access) */}
      <div className="fixed bottom-0 left-0 right-0 h-16 border-t border-bg-border bg-white/95 backdrop-blur-md flex items-center justify-around px-2 z-40 lg:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
        {[
          { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
          { id: 'safety', label: 'Safety', icon: ShieldAlert, highlight: true },
          { id: 'health', label: 'Health', icon: Heart },
          { id: 'chat', label: 'AI Chat', icon: MessageSquare },
          { id: 'profile', label: 'Profile', icon: User },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 rounded-xl transition-all duration-200
                ${isActive 
                  ? 'text-primary-violet font-semibold scale-105' 
                  : item.highlight
                  ? 'text-state-error font-medium'
                  : 'text-text-secondary hover:text-text-primary'
                }
              `}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
