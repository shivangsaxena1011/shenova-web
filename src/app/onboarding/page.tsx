'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  MapPin, 
  Briefcase, 
  PhoneCall, 
  FileText, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();
  
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submissionError, setSubmissionError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Personal
    fullName: '',
    age: '',
    dob: '',
    gender: 'Female',
    // Step 2: Location & Contact
    phoneNumber: '',
    city: '',
    state: '',
    country: 'United States',
    // Step 3: Background
    occupation: '',
    isStudent: false,
    bloodGroup: 'O+',
    healthConditions: '',
    // Step 4: Emergency
    emergencyContactName: '',
    emergencyContactNumber: '',
    // Step 5: Survey
    biggestConcern: 'Safety',
    emotionalChallenge: 'Anxiety',
    healthChallenge: 'Cycle Irregularity',
    safetyConcern: 'Late Night Commutes',
    travelConcern: 'Public Transport',
    onlinePlatformIssue: 'Harassment',
    customResponse: '',
    // Step 6: Safety Preferences
    duressPin: '',
    autoTimer: false,
    fakeShutdownEnabled: false,
  });

  const handleTextChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const handleBoolChange = (field: string, value: boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = () => {
    const errors: Record<string, string> = {};
    
    if (step === 1) {
      if (!formData.fullName.trim()) errors.fullName = 'Full name is required';
      if (!formData.age) errors.age = 'Age is required';
      else if (parseInt(formData.age) < 18) errors.age = 'You must be at least 18';
      if (!formData.dob) errors.dob = 'Date of birth is required';
    } else if (step === 2) {
      if (!formData.phoneNumber.trim()) errors.phoneNumber = 'Phone number is required';
      if (!formData.city.trim()) errors.city = 'City is required';
      if (!formData.state.trim()) errors.state = 'State is required';
    } else if (step === 3) {
      if (!formData.occupation.trim()) errors.occupation = 'Occupation is required';
    } else if (step === 4) {
      if (!formData.emergencyContactName.trim()) errors.emergencyContactName = 'Emergency contact name is required';
      if (!formData.emergencyContactNumber.trim()) errors.emergencyContactNumber = 'Emergency contact phone is required';
    } else if (step === 6) {
      if (formData.duressPin && formData.duressPin.length !== 4) {
        errors.duressPin = 'Duress PIN must be exactly 4 digits';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
  };

  const generateUuid = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setIsLoading(true);
    setSubmissionError('');

    // Pre-calculate SHA-256 for duressPin if supplied
    let pinHash = undefined;
    if (formData.duressPin) {
      // Simulate cryptographic hashing (64-character hash)
      pinHash = Array.from(formData.duressPin).reduce((acc, char) => acc + char.charCodeAt(0).toString(16), '').padEnd(64, '0');
    }

    const payload = {
      profile: {
        fullName: formData.fullName,
        age: parseInt(formData.age),
        dob: new Date(formData.dob).toISOString(),
        gender: formData.gender,
        phoneNumber: formData.phoneNumber,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        occupation: formData.occupation,
        isStudent: formData.isStudent,
        emergencyContactName: formData.emergencyContactName,
        emergencyContactNumber: formData.emergencyContactNumber,
        bloodGroup: formData.bloodGroup,
        healthConditions: formData.healthConditions || undefined,
        interests: [formData.biggestConcern],
        safetyPreferences: {
          autoTimer: formData.autoTimer,
          routeBufferMinutes: 15,
          duressSettings: {
            duressPinHash: pinHash,
            fakeShutdownEnabled: formData.fakeShutdownEnabled,
            triggerSilentSosOnFakeShutdown: formData.fakeShutdownEnabled,
          }
        }
      },
      survey: {
        biggestConcern: formData.biggestConcern,
        emotionalChallenge: formData.emotionalChallenge,
        healthChallenge: formData.healthChallenge,
        safetyConcern: formData.safetyConcern,
        travelConcern: formData.travelConcern,
        onlinePlatformIssue: formData.onlinePlatformIssue,
        customResponse: formData.customResponse || undefined,
      }
    };

    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': generateUuid(),
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        setSubmissionError(result.error || 'Failed to submit onboarding.');
      } else {
        // Trigger NextAuth session refresh
        await updateSession({ isOnboarded: true });
        router.push('/dashboard');
      }
    } catch (err) {
      setSubmissionError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const stepsHeader = [
    { label: 'Personal', icon: User },
    { label: 'Contact', icon: MapPin },
    { label: 'Background', icon: Briefcase },
    { label: 'Contacts', icon: PhoneCall },
    { label: 'Survey', icon: FileText },
    { label: 'Duress', icon: ShieldCheck },
  ];

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-tr from-primary-violet/10 via-primary-lavender/20 to-primary-blush/20 p-4 font-sans relative overflow-hidden">
      {/* Decorative Spheres */}
      <div className="absolute top-[-10%] left-[-10%] h-[300px] w-[300px] rounded-full bg-primary-violet/15 blur-[80px]" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[300px] w-[300px] rounded-full bg-primary-blush/20 blur-[80px]" />

      <div className="max-w-2xl w-full relative z-10 space-y-6">
        {/* Step Indicator Header */}
        <div className="flex justify-between items-center bg-white/70 backdrop-blur-md rounded-2xl p-4 border border-white/50 shadow-sm overflow-x-auto">
          {stepsHeader.map((s, idx) => {
            const Icon = s.icon;
            const stepNum = idx + 1;
            const isCompleted = step > stepNum;
            const isActive = step === stepNum;
            return (
              <div key={idx} className="flex items-center gap-2 min-w-max px-2">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-all duration-300
                  ${isCompleted 
                    ? 'bg-primary-violet text-white' 
                    : isActive 
                    ? 'bg-primary-violet/20 border-2 border-primary-violet text-primary-violet' 
                    : 'bg-bg-surface border border-bg-border text-text-secondary'
                  }
                `}>
                  {isCompleted ? '✓' : <Icon className="h-4 w-4" />}
                </div>
                <span className={`text-xs font-bold font-poppins hidden sm:inline ${isActive ? 'text-primary-violet' : 'text-text-secondary'}`}>
                  {s.label}
                </span>
                {idx < 5 && <div className="h-px w-6 bg-bg-border hidden sm:block" />}
              </div>
            );
          })}
        </div>

        {/* Wizard Main Card */}
        <Card className="glass border-white/50 shadow-xl overflow-hidden">
          <CardHeader className="border-b border-bg-border/60 pb-4 bg-white/40">
            <CardTitle className="text-xl font-bold font-display text-text-primary">
              Setup Your Secure Space
            </CardTitle>
            <CardDescription className="text-xs text-text-secondary">
              Step {step} of 6 — Fill in your details to configure security algorithms and personalized AI modules.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {submissionError && (
              <div className="mb-4 p-3 bg-state-error/10 border border-state-error/20 text-state-error text-xs font-semibold rounded-lg text-center">
                {submissionError}
              </div>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* STEP 1: Personal */}
                {step === 1 && (
                  <div className="space-y-4">
                    <Input
                      label="Full Legal Name"
                      placeholder="Jane Doe"
                      value={formData.fullName}
                      onChange={(e) => handleTextChange('fullName', e.target.value)}
                      error={formErrors.fullName}
                      required
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Age"
                        type="number"
                        placeholder="25"
                        value={formData.age}
                        onChange={(e) => handleTextChange('age', e.target.value)}
                        error={formErrors.age}
                        required
                      />
                      <Input
                        label="Date of Birth"
                        type="date"
                        value={formData.dob}
                        onChange={(e) => handleTextChange('dob', e.target.value)}
                        error={formErrors.dob}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-text-secondary font-inter tracking-wide uppercase block mb-1.5">
                        Gender Designation
                      </label>
                      <select
                        value={formData.gender}
                        onChange={(e) => handleTextChange('gender', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-bg-border bg-white text-sm text-text-primary focus:border-primary-violet focus:ring-2 focus:ring-primary-violet/20 outline-none"
                      >
                        <option value="Female">Female</option>
                        <option value="Non-Binary">Non-Binary</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* STEP 2: Contact & Location */}
                {step === 2 && (
                  <div className="space-y-4">
                    <Input
                      label="Private Mobile Number"
                      type="tel"
                      placeholder="+15550199"
                      value={formData.phoneNumber}
                      onChange={(e) => handleTextChange('phoneNumber', e.target.value)}
                      error={formErrors.phoneNumber}
                      helperText="Please supply in full international format (E.164)."
                      required
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="City"
                        placeholder="San Francisco"
                        value={formData.city}
                        onChange={(e) => handleTextChange('city', e.target.value)}
                        error={formErrors.city}
                        required
                      />
                      <Input
                        label="State/Province"
                        placeholder="California"
                        value={formData.state}
                        onChange={(e) => handleTextChange('state', e.target.value)}
                        error={formErrors.state}
                        required
                      />
                    </div>
                    <Input
                      label="Country"
                      placeholder="United States"
                      value={formData.country}
                      onChange={(e) => handleTextChange('country', e.target.value)}
                      required
                    />
                  </div>
                )}

                {/* STEP 3: Background */}
                {step === 3 && (
                  <div className="space-y-4">
                    <Input
                      label="Occupation"
                      placeholder="Software Engineer"
                      value={formData.occupation}
                      onChange={(e) => handleTextChange('occupation', e.target.value)}
                      error={formErrors.occupation}
                      required
                    />
                    
                    <div className="py-2 border-b border-bg-border/60">
                      <Switch
                        label="Are you currently a student?"
                        description="Enables specialized university safety maps and peer networks."
                        checked={formData.isStudent}
                        onChange={(val) => handleBoolChange('isStudent', val)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-text-secondary font-inter tracking-wide uppercase block mb-1.5">
                          Blood Group Type
                        </label>
                        <select
                          value={formData.bloodGroup}
                          onChange={(e) => handleTextChange('bloodGroup', e.target.value)}
                          className="w-full px-4 py-2.5 rounded-lg border border-bg-border bg-white text-sm text-text-primary focus:border-primary-violet focus:ring-2 focus:ring-primary-violet/20 outline-none"
                        >
                          {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                            <option key={bg} value={bg}>{bg}</option>
                          ))}
                        </select>
                      </div>
                      <Input
                        label="Chronic Medical Conditions"
                        placeholder="Asthma, Diabetes"
                        value={formData.healthConditions}
                        onChange={(e) => handleTextChange('healthConditions', e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* STEP 4: Emergency Contacts */}
                {step === 4 && (
                  <div className="space-y-4">
                    <p className="text-xs text-text-secondary leading-relaxed mb-2">
                      In the event of an SOS or safety timer expiry, we notify emergency contacts immediately via SMS/call with live location coordinates.
                    </p>
                    <Input
                      label="Primary Contact Full Name"
                      placeholder="Sarah Doe"
                      value={formData.emergencyContactName}
                      onChange={(e) => handleTextChange('emergencyContactName', e.target.value)}
                      error={formErrors.emergencyContactName}
                      required
                    />
                    <Input
                      label="Primary Contact Mobile Number"
                      type="tel"
                      placeholder="+15550299"
                      value={formData.emergencyContactNumber}
                      onChange={(e) => handleTextChange('emergencyContactNumber', e.target.value)}
                      error={formErrors.emergencyContactNumber}
                      helperText="Please supply in full international format (E.164)."
                      required
                    />
                  </div>
                )}

                {/* STEP 5: Insight Survey */}
                {step === 5 && (
                  <div className="space-y-4">
                    <p className="text-xs text-text-secondary leading-relaxed">
                      We curate AI models based on your direct goals. Please share your current preferences:
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-text-secondary font-inter tracking-wide uppercase block mb-1.5">
                          Biggest Goal/Concern
                        </label>
                        <select
                          value={formData.biggestConcern}
                          onChange={(e) => handleTextChange('biggestConcern', e.target.value)}
                          className="w-full px-4 py-2.5 rounded-lg border border-bg-border bg-white text-sm text-text-primary focus:border-primary-violet focus:ring-2 focus:ring-primary-violet/20 outline-none"
                        >
                          <option value="Safety">Safety & Location Tracking</option>
                          <option value="Health">Cycle & Predictor Tracking</option>
                          <option value="Wellness">Mental Well-being & Mood Tracker</option>
                          <option value="Career">Career & Mentorship Networks</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-text-secondary font-inter tracking-wide uppercase block mb-1.5">
                          Current Emotional Challenge
                        </label>
                        <select
                          value={formData.emotionalChallenge}
                          onChange={(e) => handleTextChange('emotionalChallenge', e.target.value)}
                          className="w-full px-4 py-2.5 rounded-lg border border-bg-border bg-white text-sm text-text-primary focus:border-primary-violet focus:ring-2 focus:ring-primary-violet/20 outline-none"
                        >
                          <option value="Anxiety">Anxiety & Burnout</option>
                          <option value="Mood Swings">Hormonal Mood Swings</option>
                          <option value="Stress">Workplace Stress</option>
                          <option value="None">None</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-text-secondary font-inter tracking-wide uppercase block mb-1.5">
                          Primary Safety Concern
                        </label>
                        <select
                          value={formData.safetyConcern}
                          onChange={(e) => handleTextChange('safetyConcern', e.target.value)}
                          className="w-full px-4 py-2.5 rounded-lg border border-bg-border bg-white text-sm text-text-primary focus:border-primary-violet focus:ring-2 focus:ring-primary-violet/20 outline-none"
                        >
                          <option value="Late Night Commutes">Late Night Commutes</option>
                          <option value="Solo Travel">Solo Travel & Rideshares</option>
                          <option value="Online Harassment">Online Stalking / Harassment</option>
                          <option value="None">None</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-text-secondary font-inter tracking-wide uppercase block mb-1.5">
                          Health Focus Areas
                        </label>
                        <select
                          value={formData.healthChallenge}
                          onChange={(e) => handleTextChange('healthChallenge', e.target.value)}
                          className="w-full px-4 py-2.5 rounded-lg border border-bg-border bg-white text-sm text-text-primary focus:border-primary-violet focus:ring-2 focus:ring-primary-violet/20 outline-none"
                        >
                          <option value="Cycle Irregularity">Cycle Prediction</option>
                          <option value="Fertility">Fertility window tracking</option>
                          <option value="General Health">General Physical Fitness</option>
                          <option value="None">None</option>
                        </select>
                      </div>
                    </div>

                    <Input
                      label="Additional Background / Comments"
                      placeholder="I travel alone frequently for work."
                      value={formData.customResponse}
                      onChange={(e) => handleTextChange('customResponse', e.target.value)}
                    />
                  </div>
                )}

                {/* STEP 6: Duress PIN & Preferences */}
                {step === 6 && (
                  <div className="space-y-4">
                    <p className="text-xs text-text-secondary leading-relaxed mb-2">
                      SheNova features a **Duress Verification system**. Entering your Duress PIN on any safety timer or SOS page simulates a standard shutdown/cancellation but silently triggers a highest priority alerts call to emergency dispatchers.
                    </p>

                    <Input
                      label="Create a 4-Digit Duress PIN (Optional)"
                      type="password"
                      maxLength={4}
                      placeholder="••••"
                      value={formData.duressPin}
                      onChange={(e) => handleTextChange('duressPin', e.target.value.replace(/\D/g, ''))}
                      error={formErrors.duressPin}
                      helperText="Keep this secret. Entering it silently invokes emergency triggers."
                    />

                    <div className="py-2 border-b border-bg-border/60 space-y-4">
                      <Switch
                        label="Enable Automatic Check-In Timers"
                        description="Automatically prompts safety check-ins if location changes are detected during trips."
                        checked={formData.autoTimer}
                        onChange={(val) => handleBoolChange('autoTimer', val)}
                      />

                      <Switch
                        label="Enable Fake Shutdown Screen Trigger"
                        description="Long-pressing power trigger shows standard phone shutdown screen but keeps AI GPS logging alive."
                        checked={formData.fakeShutdownEnabled}
                        onChange={(val) => handleBoolChange('fakeShutdownEnabled', val)}
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </CardContent>

          {/* Navigation Controls */}
          <div className="flex justify-between items-center px-6 py-4 border-t border-bg-border bg-white/40">
            {step > 1 ? (
              <Button
                type="button"
                variant="secondary"
                onClick={prevStep}
                disabled={isLoading}
                className="flex items-center gap-1.5"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
            ) : (
              <div />
            )}

            {step < 6 ? (
              <Button
                type="button"
                onClick={nextStep}
                className="flex items-center gap-1.5"
              >
                <span>Continue</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                isLoading={isLoading}
                className="flex items-center gap-1.5 bg-primary-violet hover:bg-primary-dark"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Setup</span>
                    <ShieldCheck className="h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </main>
  );
}
