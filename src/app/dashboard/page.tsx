'use client';

import React, { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useStore } from '@/store/useStore';
import { AppShell } from '@/components/layout/AppShell';
import { SafetyHubView } from '@/components/views/SafetyHubView';
import { HealthTrackerView } from '@/components/views/HealthTrackerView';
import { WellnessHubView } from '@/components/views/WellnessHubView';
import { CommunityView } from '@/components/views/CommunityView';
import { PrivacyCenterView } from '@/components/views/PrivacyCenterView';
import { ExpertMarketplaceView } from '@/components/views/ExpertMarketplaceView';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ShieldAlert, 
  MapPin, 
  Heart, 
  Sparkles, 
  Activity, 
  Compass, 
  Calendar, 
  Bell, 
  ArrowRight,
  TrendingUp,
  Brain,
  MessageSquare,
  LogOut,
  Users
} from 'lucide-react';

export default function DashboardPage() {
  const { data: session } = useSession();
  const { 
    activeTab, 
    setActiveTab, 
    isTracking, 
    setTracking, 
    latitude, 
    longitude, 
    setCoordinates 
  } = useStore();

  const handleToggleTracking = () => {
    if (!isTracking) {
      // Simulate reading GPS coordinates
      setCoordinates(37.7749, -122.4194);
      setTracking(true);
    } else {
      setTracking(false);
    }
  };

  const handleLogout = () => {
    signOut({ callbackUrl: '/auth/signin' });
  };

  const renderDashboardHome = () => {
    return (
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-primary-violet/10 via-primary-lavender/5 to-transparent p-6 rounded-2xl border border-primary-lavender/30">
          <div>
            <h1 className="text-2xl font-bold font-display text-text-primary">
              Welcome back, {session?.user?.name || 'Jane'}
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              Your security and well-being metrics are looking optimal today.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="primary" className="py-1 px-3">
              Premium Tier Active
            </Badge>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-xs flex items-center gap-1.5 border border-bg-border bg-white">
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Safety Hub */}
          <Card hoverEffect className="relative overflow-hidden">
            <div className="absolute top-0 right-0 h-24 w-24 bg-state-error/5 rounded-full blur-xl translate-x-4 -translate-y-4" />
            <CardHeader className="pb-2">
              <div className="h-8 w-8 rounded-lg bg-state-error/10 flex items-center justify-center text-state-error mb-2">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <CardTitle>Active Safety Shield</CardTitle>
              <CardDescription>Live GPS coordinates monitoring status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between py-1.5 border-b border-bg-border/60">
                  <span className="text-xs text-text-secondary">GPS Tracker Status</span>
                  <Badge variant={isTracking ? 'success' : 'secondary'}>
                    {isTracking ? 'TRANSMITTING' : 'OFFLINE'}
                  </Badge>
                </div>
                {isTracking && (
                  <div className="p-2 bg-bg-surface rounded-lg text-xs space-y-1 font-mono text-text-secondary border border-bg-border/60">
                    <p>Lat: {latitude}</p>
                    <p>Lng: {longitude}</p>
                  </div>
                )}
                <Button 
                  onClick={handleToggleTracking} 
                  variant={isTracking ? 'secondary' : 'primary'}
                  size="sm"
                  className="w-full mt-1.5"
                >
                  {isTracking ? 'Disable Live GPS Sharing' : 'Enable Live GPS Sharing'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Health Tracker */}
          <Card hoverEffect className="relative overflow-hidden">
            <div className="absolute top-0 right-0 h-24 w-24 bg-primary-blush/20 rounded-full blur-xl translate-x-4 -translate-y-4" />
            <CardHeader className="pb-2">
              <div className="h-8 w-8 rounded-lg bg-primary-blush text-pink-700 flex items-center justify-center mb-2">
                <Heart className="h-5 w-5" />
              </div>
              <CardTitle>Hormonal Health</CardTitle>
              <CardDescription>Cycle progress and forecasts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between py-1.5 border-b border-bg-border/60">
                  <span className="text-xs text-text-secondary">Current Phase</span>
                  <span className="text-xs font-bold text-pink-700 bg-primary-blush px-2 py-0.5 rounded-full">Follicular</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-bg-border/60">
                  <span className="text-xs text-text-secondary">Next Forecast (Flow)</span>
                  <span className="text-xs font-semibold text-text-primary">14 Days Left</span>
                </div>
                <Button 
                  onClick={() => setActiveTab('health')} 
                  variant="secondary"
                  size="sm"
                  className="w-full mt-1.5 flex items-center justify-center gap-1"
                >
                  <span>Log Symptoms</span>
                  <Calendar className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: AI Recommendations */}
          <Card hoverEffect className="relative overflow-hidden">
            <div className="absolute top-0 right-0 h-24 w-24 bg-primary-violet/10 rounded-full blur-xl translate-x-4 -translate-y-4" />
            <CardHeader className="pb-2">
              <div className="h-8 w-8 rounded-lg bg-primary-lavender flex items-center justify-center text-primary-violet mb-2">
                <Sparkles className="h-5 w-5" />
              </div>
              <CardTitle>AI Wellness Companion</CardTitle>
              <CardDescription>Targeted lifestyle optimization tips</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2.5">
                <div className="p-3 bg-primary-violet/5 rounded-xl border border-primary-violet/10 text-xs text-text-secondary leading-relaxed">
                  <span className="font-bold text-primary-violet flex items-center gap-1 mb-1">
                    <Brain className="h-3.5 w-3.5" />
                    Insight for Follicular Phase
                  </span>
                  Your estrogen is climbing, boosting energy levels. Ideal time for high-intensity training or deep cognitive tasks.
                </div>
                <Button 
                  onClick={() => setActiveTab('chat')} 
                  variant="secondary"
                  size="sm"
                  className="w-full mt-1 flex items-center justify-center gap-1.5"
                >
                  <span>Ask AI Assistant</span>
                  <MessageSquare className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reminders & Action Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Reminders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary-violet" />
                <span>Upcoming Reminders</span>
              </CardTitle>
              <CardDescription>Notifications requiring immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3.5">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-bg-surface border border-bg-border/60 hover:border-primary-violet/30 transition-colors">
                  <div className="h-8 w-8 rounded-full bg-state-success/15 flex items-center justify-center text-state-success shrink-0 mt-0.5">
                    <Activity className="h-4.5 w-4.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-text-primary">Daily Mood Logging</p>
                    <p className="text-xs text-text-secondary mt-0.5">Log your mental energy state to train local predictive models.</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('wellness')} className="text-xs font-bold text-primary-violet shrink-0">
                    Log Now
                  </Button>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-bg-surface border border-bg-border/60 hover:border-primary-violet/30 transition-colors">
                  <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 shrink-0 mt-0.5">
                    <Compass className="h-4.5 w-4.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-text-primary">Safety Timer Check-In</p>
                    <p className="text-xs text-text-secondary mt-0.5">Configure your late-evening travel itinerary buffer settings.</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('safety')} className="text-xs font-bold text-primary-violet shrink-0">
                    Open Hub
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Peer & Community Widget */}
          <Card className="bg-gradient-to-br from-primary-violet/5 to-primary-blush/5 border-primary-violet/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary-violet" />
                <span>SheNova Community Forums</span>
              </CardTitle>
              <CardDescription>Anonymous peer groups and active mentor circles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-text-secondary leading-relaxed">
                Connect anonymously with peers, share experiences, and receive insights curated from certified Ob-Gyns, counselors, and legal safety advisors.
              </p>
              <div className="flex items-center gap-4 py-2 border-y border-bg-border/60">
                <div className="flex -space-x-2.5 overflow-hidden">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-primary-lavender flex items-center justify-center text-primary-violet text-[10px] font-bold">
                      U{i}
                    </div>
                  ))}
                </div>
                <span className="text-xs font-semibold text-text-secondary">
                  12k active women online right now
                </span>
              </div>
              <Button 
                onClick={() => setActiveTab('community')}
                className="w-full flex items-center justify-center gap-1.5"
              >
                <span>Browse Forums</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboardHome();
      case 'safety':
        return <SafetyHubView />;
      case 'health':
        return <HealthTrackerView />;
      case 'wellness':
        return <WellnessHubView />;
      case 'community':
        return <CommunityView />;
      case 'experts':
        return <ExpertMarketplaceView />;
      case 'chat':
        return <WellnessHubView />;
      case 'profile':
      case 'settings':
        return <PrivacyCenterView />;
      case 'premium':
      case 'admin':
        return (
          <div className="space-y-6 border border-bg-border bg-white rounded-2xl p-8">
            <h1 className="text-2xl font-bold font-display text-text-primary uppercase tracking-tight">{activeTab}</h1>
            <p className="text-text-secondary text-sm">Target module will render customized view configs for {activeTab} settings.</p>
          </div>
        );
      default:
        return renderDashboardHome();
    }
  };

  return (
    <AppShell activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </AppShell>
  );
}
