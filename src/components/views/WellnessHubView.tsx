import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Brain, 
  Smile, 
  Sparkles, 
  Send, 
  TrendingUp, 
  Activity, 
  CheckCircle,
  MessageSquare
} from 'lucide-react';

export const WellnessHubView: React.FC = () => {
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);

  // Form States
  const [mood, setMood] = useState('Calm');
  const [stressLevel, setStressLevel] = useState(5);
  const [energyLevel, setEnergyLevel] = useState(6);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [aiTip, setAiTip] = useState(
    'Estrogen is rising. Your cortisol regulation is optimal. Perfect window for deep learning and high-intensity tasks.'
  );

  // Chat States
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    { sender: 'ai', text: 'Hello! I am your AI Wellness Companion. How are you feeling today?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // WS ref
  const wsRef = useRef<any>(null);

  // Prevent SSR hydration warnings
  useEffect(() => {
    setMounted(true);

    // Initialize WS connection for Chat Companion
    const token = (session as any)?.accessToken || 'mock-token';
    const wsHost = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
    const wsUrl = `${wsHost}/api/v1/safety/stream?token=${encodeURIComponent(token)}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'ai-response') {
          setIsTyping(false);
          setMessages(prev => [...prev, { sender: 'ai', text: payload.content }]);
        }
      } catch (err) {
        console.error('Error parsing WS message:', err);
      }
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) ws.close();
    };
  }, [session]);

  const handleLogWellness = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMessage('');

    try {
      const response = await fetch('/api/mood/records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mood,
          stressLevel,
          energyLevel,
          notes,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        setSuccessMessage('Wellness parameters logged successfully!');
        setAiTip(result.data.aiRecommendation);
        setNotes('');
      }
    } catch (err) {
      console.error('Error logging wellness record:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setChatInput('');
    setIsTyping(true);

    // Try sending over WS, fallback to local simulated stream
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'user-message',
        content: userText,
      }));
    } else {
      // Local simulator fallback
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: `I hear you. Balancing your wellness during changing cycle days is important. Consider taking a 5-minute break and practicing mindfulness.`
          }
        ]);
      }, 1500);
    }
  };

  // Mock data for analytics
  const analyticsData = [
    { name: 'Mon', Stress: 6, Energy: 4 },
    { name: 'Tue', Stress: 5, Energy: 6 },
    { name: 'Wed', Stress: 7, Energy: 5 },
    { name: 'Thu', Stress: 4, Energy: 7 },
    { name: 'Fri', Stress: 5, Energy: 8 },
    { name: 'Sat', Stress: 3, Energy: 9 },
    { name: 'Sun', Stress: 2, Energy: 8 },
  ];

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-2xl font-bold font-display text-text-primary">Wellness Hub</h1>
        <p className="text-text-secondary text-sm">Track emotional patterns, visualize stress variables, and chat with AI.</p>
      </div>

      {successMessage && (
        <div className="p-3 text-xs bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-center font-semibold flex items-center justify-center gap-1.5">
          <CheckCircle className="h-4 w-4" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Mood Logger Form */}
        <Card className="lg:col-span-1 border-primary-lavender/30">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Smile className="h-5 w-5 text-primary-violet" />
              <span>Log Daily Mood</span>
            </CardTitle>
            <CardDescription className="text-xs">Save parameters to optimize AI prompts.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogWellness} className="space-y-4">
              
              <div>
                <label className="text-xs font-semibold text-text-secondary uppercase block mb-1.5 font-inter">
                  Current Emotional State
                </label>
                <select
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-bg-border bg-white text-sm text-text-primary focus:border-primary-violet focus:ring-2 focus:ring-primary-violet/20 outline-none"
                >
                  {['Calm', 'Happy', 'Anxious', 'Stressed', 'Exhausted', 'Sad'].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              {/* Stress Slider */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-text-secondary">Stress Level ({stressLevel}/10)</span>
                  <span className={stressLevel > 7 ? 'text-state-error' : 'text-text-secondary'}>
                    {stressLevel > 7 ? 'High' : stressLevel > 4 ? 'Moderate' : 'Low'}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={stressLevel}
                  onChange={(e) => setStressLevel(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-bg-border rounded-lg appearance-none cursor-pointer accent-primary-violet"
                />
              </div>

              {/* Energy Slider */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-text-secondary">Energy Level ({energyLevel}/10)</span>
                  <span className="text-text-secondary">
                    {energyLevel > 7 ? 'High' : energyLevel > 4 ? 'Moderate' : 'Low'}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={energyLevel}
                  onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-bg-border rounded-lg appearance-none cursor-pointer accent-primary-violet"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-secondary uppercase block font-inter">Journal Notes</label>
                <textarea
                  rows={2}
                  placeholder="How was your day?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-bg-border bg-white text-sm text-text-primary focus:border-primary-violet focus:ring-2 focus:ring-primary-violet/20 outline-none resize-none"
                />
              </div>

              <Button
                type="submit"
                isLoading={isLoading}
                className="w-full bg-primary-violet hover:bg-primary-dark"
              >
                Log parameters
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Recharts Analytics Panel */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary-violet" />
              <span>Biometric Stress vs Energy Trend</span>
            </CardTitle>
            <CardDescription className="text-xs">Continuous weekly tracking analytics.</CardDescription>
          </CardHeader>
          <CardContent>
            {mounted ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                    <XAxis dataKey="name" stroke="#9CA3AF" fontSize={11} tickLine={false} />
                    <YAxis stroke="#9CA3AF" fontSize={11} domain={[0, 10]} tickLine={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="Stress" stroke="#EF4444" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="Energy" stroke="#10B981" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 w-full rounded-2xl bg-bg-surface border border-bg-border flex items-center justify-center text-xs text-text-secondary">
                Loading analytics charts...
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI Wellness Chat Companion */}
      <Card className="border-primary-lavender/30">
        <CardHeader className="border-b border-bg-border/60 pb-3">
          <CardTitle className="font-display flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary-violet" />
            <span>AI Wellness Advisor Chat</span>
          </CardTitle>
          <CardDescription className="text-xs">Ask cycle-based lifestyle prompts anonymously.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {/* Messages Feed */}
          <div className="h-64 overflow-y-auto p-4 space-y-3.5 bg-bg-surface/50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-md rounded-2xl p-3.5 text-xs leading-relaxed shadow-sm border
                  ${msg.sender === 'user'
                    ? 'bg-primary-violet border-primary-violet/10 text-white rounded-tr-none'
                    : 'bg-white border-bg-border text-text-secondary rounded-tl-none'
                  }
                `}>
                  {msg.sender === 'ai' && (
                    <span className="font-bold text-primary-violet flex items-center gap-1 mb-1 font-display">
                      <Sparkles className="h-3 w-3" />
                      Wellness Companion
                    </span>
                  )}
                  <p>{msg.text}</p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-bg-border rounded-2xl rounded-tl-none p-3.5 text-xs text-text-secondary flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-text-secondary animate-bounce" />
                  <span className="h-1.5 w-1.5 rounded-full bg-text-secondary animate-bounce delay-100" />
                  <span className="h-1.5 w-1.5 rounded-full bg-text-secondary animate-bounce delay-200" />
                </div>
              </div>
            )}
          </div>

          {/* Form Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-bg-border bg-white flex gap-3">
            <input
              type="text"
              placeholder="Ask anything..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-lg border border-bg-border bg-white text-sm text-text-primary focus:border-primary-violet focus:ring-2 focus:ring-primary-violet/20 outline-none"
            />
            <Button type="submit" size="sm" className="bg-primary-violet hover:bg-primary-dark">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
export default WellnessHubView;
