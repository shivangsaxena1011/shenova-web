import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useStore } from '@/store/useStore';
import { 
  Calendar, 
  Heart, 
  Sparkles, 
  Plus, 
  Activity, 
  Clock, 
  CheckCircle,
  HelpCircle,
  Droplet,
  Pill,
  Trash2,
  TrendingUp
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export const HealthTrackerView: React.FC = () => {
  const { symptoms, addSymptom, removeSymptom, clearSymptoms, cycleLength, setCycleLength } = useStore();

  // Local state
  const [lastPeriodDate, setLastPeriodDate] = useState('2026-06-20');
  const [isLoading, setIsLoading] = useState(false);
  const [predictions, setPredictions] = useState<any>({
    predictedNextPeriod: '2026-07-18',
    fertileWindowStart: '2026-07-01',
    fertileWindowEnd: '2026-07-06',
  });
  const [aiTip, setAiTip] = useState(
    'Estrogen is rising. Your body is preparing for ovulation. Energy levels are naturally scaling up; focus on lean proteins and complex carbs.'
  );
  const [successMessage, setSuccessMessage] = useState('');

  // Hydration Tracker State
  const [hydrationTotal, setHydrationTotal] = useState(0);
  const [isLoggingHydration, setIsLoggingHydration] = useState(false);

  // Medication Reminders State
  const [medications, setMedications] = useState<any[]>([]);
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('');
  const [medFreq, setMedFreq] = useState('Daily');
  const [medTime, setMedTime] = useState('08:00');
  const [isSavingMed, setIsSavingMed] = useState(false);

  // Analytics & Mood Correlation State
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  const symptomList = [
    { id: 'cramps', label: 'Abdominal Cramps' },
    { id: 'fatigue', label: 'Fatigue / Low Energy' },
    { id: 'mood', label: 'Mood Swings' },
    { id: 'bloating', label: 'Bloating' },
    { id: 'headache', label: 'Headaches' },
    { id: 'acne', label: 'Acne / Skin Breakouts' },
  ];

  const handleSymptomToggle = (symptomId: string) => {
    if (symptoms.includes(symptomId)) {
      removeSymptom(symptomId);
    } else {
      addSymptom(symptomId);
    }
  };

  const handleLogSymptoms = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMessage('');

    try {
      const response = await fetch('/api/health/records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lastPeriodDate,
          cycleLength,
          symptoms,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        setPredictions({
          predictedNextPeriod: result.data.predictedNextPeriod,
          fertileWindowStart: result.data.fertileWindowStart,
          fertileWindowEnd: result.data.fertileWindowEnd,
        });

        // Set custom tip based on symptoms
        if (symptoms.includes('cramps')) {
          setAiTip('ESTROGEN ALERT: Incorporate warm heat compresses and magnesium-rich seeds (like pumpkin or sesame seeds) to naturally ease abdominal cramps.');
        } else if (symptoms.includes('fatigue')) {
          setAiTip('CYCLE INSIGHT: Low energy detected. Supplement with iron-rich foods (spinach, lentils) and protect sleep cycles (aim for 8+ hours).');
        } else {
          setAiTip('Estrogen and testosterone levels are peaking. Optimal time for brainstorming and strength workouts.');
        }

        setSuccessMessage('Symptoms logged and forecasts updated successfully!');
      }
    } catch (err) {
      console.error('Error logging health stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Hydration Total
  const fetchHydration = async () => {
    try {
      const response = await fetch('/api/health/hydration');
      const result = await response.json();
      if (response.ok && result.success) {
        setHydrationTotal(result.data.totalMl);
      }
    } catch (err) {
      console.error('Failed to fetch hydration:', err);
    }
  };

  // Log Hydration
  const handleLogHydration = async (amount: number) => {
    setIsLoggingHydration(true);
    try {
      const response = await fetch('/api/health/hydration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountMl: amount }),
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setHydrationTotal(prev => prev + amount);
      }
    } catch (err) {
      console.error('Failed to log hydration:', err);
    } finally {
      setIsLoggingHydration(false);
    }
  };

  // Fetch Medication Reminders
  const fetchMedications = async () => {
    try {
      const response = await fetch('/api/health/medication');
      const result = await response.json();
      if (response.ok && result.success) {
        setMedications(result.data);
      }
    } catch (err) {
      console.error('Failed to fetch medications:', err);
    }
  };

  // Add Medication Reminder
  const handleAddMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName || !medDosage) return;
    setIsSavingMed(true);
    try {
      const response = await fetch('/api/health/medication', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medName,
          dosage: medDosage,
          frequency: medFreq,
          timeOfDay: medTime,
        }),
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setMedications([result.data, ...medications]);
        setMedName('');
        setMedDosage('');
      } else {
        alert(result.error || 'Failed to add medication.');
      }
    } catch (err) {
      alert('Error adding medication reminder.');
    } finally {
      setIsSavingMed(false);
    }
  };

  // Delete Medication Reminder
  const handleDeleteMedication = async (id: string) => {
    if (!confirm('Are you sure you want to delete this medication reminder?')) return;
    try {
      const response = await fetch(`/api/health/medication/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setMedications(medications.filter(m => m.id !== id));
      } else {
        alert(result.error || 'Failed to delete medication.');
      }
    } catch (err) {
      alert('Error deleting medication.');
    }
  };

  // Fetch Analytics & Correlation
  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/health/analytics');
      const result = await response.json();
      if (response.ok && result.success) {
        setAnalyticsData(result.data.moodCorrelations);
      }
    } catch (err) {
      console.error('Failed to fetch health analytics:', err);
    }
  };

  // Initialize and load data
  useEffect(() => {
    setMounted(true);
    fetchHydration();
    fetchMedications();
    fetchAnalytics();
  }, []);

  // Compute current cycle day
  const start = new Date(lastPeriodDate);
  const diffTime = Math.abs(Date.now() - start.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) % cycleLength;
  const currentDay = diffDays + 1;

  // Determine current phase based on day
  const getCyclePhase = (day: number) => {
    if (day <= 5) return { name: 'Menstrual Phase', color: 'text-rose-500 bg-rose-50 border-rose-100', desc: 'Active flow. Rest and nourish.' };
    if (day <= 11) return { name: 'Follicular Phase', color: 'text-violet-600 bg-primary-violet/5 border-primary-violet/10', desc: 'Estrogen is climbing. Focus on planning and execution.' };
    if (day <= 15) return { name: 'Ovulatory Phase', color: 'text-emerald-600 bg-emerald-50 border-emerald-100', desc: 'Luteinizing hormone peaks. High fertility window.' };
    return { name: 'Luteal Phase', color: 'text-amber-600 bg-amber-50 border-amber-100', desc: 'Progesterone climbs. Winding down energy.' };
  };

  const phase = getCyclePhase(currentDay);

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-text-primary">Hormonal Health Tracker</h1>
          <p className="text-text-secondary text-sm">Monitor cycle phases, predict fertile windows, and log symptoms.</p>
        </div>
      </div>

      {successMessage && (
        <div className="p-3 text-xs bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-center font-semibold flex items-center justify-center gap-1.5">
          <CheckCircle className="h-4 w-4" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Cycle Ring Tracker */}
        <Card className="flex flex-col justify-center items-center p-8 bg-gradient-to-br from-pink-50/50 via-white to-transparent border-pink-100/60 lg:col-span-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-40 w-40 bg-pink-100/10 rounded-full blur-2xl translate-x-12 -translate-y-12" />

          <CardHeader className="text-center pb-4 w-full">
            <CardTitle className="text-xl font-bold font-display text-text-primary flex items-center justify-center gap-2">
              <Heart className="h-5 w-5 text-pink-500" />
              <span>Current Cycle Index</span>
            </CardTitle>
            <CardDescription className="text-xs">Visualizing days elapsed in current menstrual cycle.</CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col md:flex-row items-center justify-around w-full gap-8">
            {/* Visual Progress Wheel */}
            <div className="relative h-44 w-44 flex items-center justify-center">
              {/* Outer Ring */}
              <div className="absolute inset-0 rounded-full border-8 border-bg-border" />
              {/* Active Ring Indicator */}
              <div 
                className="absolute inset-0 rounded-full border-8 border-pink-500 transition-all duration-500" 
                style={{
                  clipPath: `polygon(50% 50%, 50% 0%, ${currentDay / cycleLength >= 0.25 ? '100% 0%' : '50% 0%'}, ${currentDay / cycleLength >= 0.5 ? '100% 100%' : '50% 0%'}, ${currentDay / cycleLength >= 0.75 ? '0% 100%' : '50% 0%'}, ${currentDay / cycleLength >= 1.0 ? '0% 0%' : '50% 0%'})`
                }}
              />
              <div className="z-10 text-center">
                <span className="text-4xl font-extrabold text-text-primary font-mono">{currentDay}</span>
                <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mt-0.5">Day of {cycleLength}</p>
              </div>
            </div>

            {/* Cycle Details */}
            <div className="flex-1 space-y-4">
              <div className={`p-4 rounded-xl border ${phase.color}`}>
                <h4 className="font-bold text-sm font-poppins">{phase.name}</h4>
                <p className="text-xs opacity-90 mt-1 leading-relaxed">{phase.desc}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-inter text-text-secondary">
                <div className="p-3 bg-bg-surface rounded-xl border border-bg-border/60">
                  <p className="font-semibold text-text-primary">Next Period Start</p>
                  <p className="font-bold text-sm text-pink-600 mt-1">{predictions.predictedNextPeriod}</p>
                </div>
                <div className="p-3 bg-bg-surface rounded-xl border border-bg-border/60">
                  <p className="font-semibold text-text-primary">Fertility Window</p>
                  <p className="font-bold text-xs text-emerald-600 mt-1">
                    {predictions.fertileWindowStart} to {predictions.fertileWindowEnd}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Recommendations */}
        <Card className="relative overflow-hidden border-primary-lavender/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display text-text-primary">
              <Sparkles className="h-5 w-5 text-primary-violet" />
              <span>AI Health Companion</span>
            </CardTitle>
            <CardDescription className="text-xs">Estrogen-based insights & wellness recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-2xl bg-primary-violet/5 border border-primary-violet/10 text-xs text-text-secondary leading-relaxed">
              {aiTip}
            </div>

            <div className="p-3 bg-bg-surface rounded-xl border border-bg-border/60 flex items-start gap-2.5">
              <Activity className="h-4.5 w-4.5 text-primary-violet shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold text-text-primary">Personalized recommendations active</p>
                <p className="text-text-secondary mt-0.5">Logs are analyzed using local transformers to protect health data confidentiality.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Symptoms & Parameters Logger */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display">Log Daily Menstrual Parameters</CardTitle>
          <CardDescription className="text-xs">Updating these parameters recalibrates our prediction algorithms automatically.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogSymptoms} className="space-y-6">
            
            {/* Cycle Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Last Menstruation Flow Start Date"
                type="date"
                value={lastPeriodDate}
                onChange={(e) => setLastPeriodDate(e.target.value)}
                required
              />
              <Input
                label="Average Cycle Duration (Days)"
                type="number"
                value={cycleLength.toString()}
                onChange={(e) => setCycleLength(parseInt(e.target.value) || 28)}
                required
              />
            </div>

            {/* Symptoms Selection */}
            <div>
              <label className="text-xs font-semibold text-text-secondary tracking-wide uppercase block mb-3 font-inter">
                Current Symptom Indicators
              </label>
              <div className="flex flex-wrap gap-2.5">
                {symptomList.map((s) => {
                  const isChecked = symptoms.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleSymptomToggle(s.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold font-inter transition-all duration-200 border
                        ${isChecked
                          ? 'bg-pink-500 border-pink-600 text-white shadow-sm'
                          : 'bg-white border-bg-border text-text-secondary hover:border-pink-300'
                        }
                      `}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Save Button */}
            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold"
            >
              Log Symptoms & Update Forecasts
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Hydration & Medications Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Hydration Tracker */}
        <Card className="border-sky-100 bg-gradient-to-br from-sky-50/20 via-white to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-text-primary">
              <Droplet className="h-5 w-5 text-sky-500" />
              <span>Daily Hydration Tracker</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Stay hydrated to help ease menstrual cramps. Daily goal: 2000ml (2L).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-between items-center bg-sky-50/50 border border-sky-100 p-4 rounded-xl">
              <div>
                <p className="text-2xl font-bold text-sky-600 font-mono">{hydrationTotal} <span className="text-xs font-sans text-text-secondary font-normal">ml</span></p>
                <p className="text-xs text-text-secondary mt-0.5">{"Today's Intake (Goal: 2000ml)"}</p>
              </div>
              <div className="h-14 w-14 rounded-full bg-sky-100 flex items-center justify-center text-sky-500">
                <Droplet className="h-7 w-7" />
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                <span>Progress</span>
                <span>{Math.min(100, Math.round((hydrationTotal / 2000) * 100))}%</span>
              </div>
              <div className="h-2.5 w-full bg-bg-border rounded-full overflow-hidden">
                <div 
                  className="h-full bg-sky-400 transition-all duration-500 rounded-full" 
                  style={{ width: `${Math.min(100, (hydrationTotal / 2000) * 100)}%` }}
                />
              </div>
            </div>

            {/* Quick Log Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={() => handleLogHydration(250)}
                disabled={isLoggingHydration}
                className="flex-1 bg-white border border-sky-200 text-sky-600 hover:bg-sky-50 text-xs font-semibold"
              >
                +250ml (Cup)
              </Button>
              <Button
                onClick={() => handleLogHydration(500)}
                disabled={isLoggingHydration}
                className="flex-1 bg-sky-500 text-white hover:bg-sky-600 text-xs font-semibold"
              >
                +500ml (Bottle)
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Medication Reminders */}
        <Card className="border-pink-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-text-primary">
              <Pill className="h-5 w-5 text-pink-500" />
              <span>Medication & Supplement Reminders</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Log supplements like iron, magnesium, or daily medication prescriptions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Add Medication Form */}
            <form onSubmit={handleAddMedication} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end bg-bg-surface p-3 rounded-xl border border-bg-border">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-text-secondary uppercase">Med Name</label>
                <Input
                  placeholder="Iron / Pill"
                  value={medName}
                  onChange={(e) => setMedName(e.target.value)}
                  required
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-text-secondary uppercase">Dosage</label>
                <Input
                  placeholder="1 tab / 500mg"
                  value={medDosage}
                  onChange={(e) => setMedDosage(e.target.value)}
                  required
                  className="h-8 text-xs"
                />
              </div>
              <Button
                type="submit"
                disabled={isSavingMed}
                className="h-8 bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold"
              >
                Add Reminder
              </Button>
            </form>

            {/* Medication List */}
            {medications.length > 0 ? (
              <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
                {medications.map((med) => (
                  <div 
                    key={med.id} 
                    className="flex justify-between items-center p-3 rounded-xl border border-bg-border bg-white shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center">
                        <Pill className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-text-primary">{med.medName}</p>
                        <p className="text-[10px] text-text-secondary">{med.dosage} • {med.frequency} at {med.timeOfDay}</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteMedication(med.id)}
                      className="text-state-error hover:bg-red-50 hover:text-red-600 h-7 w-7 p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 border border-dashed border-bg-border rounded-xl flex flex-col items-center justify-center gap-1.5">
                <Pill className="h-6 w-6 text-text-secondary opacity-40" />
                <p className="text-[11px] text-text-secondary">No active medication reminders configured.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Mood Correlation & Health Analytics Chart */}
      <Card className="border-primary-lavender/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-text-primary">
            <TrendingUp className="h-5 w-5 text-primary-violet" />
            <span>Cycle Mood Correlation Analytics</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Review average stress and energy levels correlated against logged daily moods.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mounted && analyticsData.length > 0 ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <XAxis dataKey="mood" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} domain={[0, 10]} />
                  <Tooltip 
                    contentStyle={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #E5E7EB' }} 
                    labelStyle={{ fontWeight: 'bold', fontSize: '11px', color: '#1F2937' }} 
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="avgStress" name="Avg Stress Level (1-10)" fill="#7C3AED" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="avgEnergy" name="Avg Energy Level (1-10)" fill="#EC4899" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-bg-border rounded-2xl flex flex-col items-center justify-center gap-2">
              <TrendingUp className="h-8 w-8 text-text-secondary opacity-40" />
              <p className="text-xs text-text-secondary px-6">
                Not enough mood logs to calculate correlations. Log your daily wellness on the Wellness Hub to unlock chart trend indicators.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
export default HealthTrackerView;
