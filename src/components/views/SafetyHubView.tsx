import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useStore } from '@/store/useStore';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ShieldAlert, 
  MapPin, 
  Phone, 
  AlertTriangle, 
  UploadCloud, 
  CheckCircle, 
  Compass, 
  UserCheck, 
  PowerOff,
  Flame,
  FileText,
  Clock,
  Trash2,
  UserPlus,
  Users
} from 'lucide-react';

export const SafetyHubView: React.FC = () => {
  const { data: session } = useSession();
  const {
    isTracking,
    setTracking,
    latitude,
    longitude,
    setCoordinates,
    activeTimerSeconds,
    timerActive,
    setTimerActive,
    setTimerSeconds
  } = useStore();

  // Component States
  const [durationMinutes, setDurationMinutes] = useState('15');
  const [checkInId, setCheckInId] = useState<string | null>(null);
  const [activeIncidentId, setActiveIncidentId] = useState<string | null>(null);
  const [sosStatus, setSosStatus] = useState<'idle' | 'loading' | 'active' | 'silent'>('idle');
  const [duressInput, setDuressInput] = useState('');
  const [showDuressModal, setShowDuressModal] = useState(false);
  const [isFakeShutdown, setIsFakeShutdown] = useState(false);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Emergency Contacts state
  const [contacts, setContacts] = useState<any[]>([]);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactRelation, setNewContactRelation] = useState('');
  const [isSavingContact, setIsSavingContact] = useState(false);

  // WebSocket reference
  const wsRef = useRef<any>(null);

  // Timer interval hook
  useEffect(() => {
    let interval: any;
    if (timerActive && activeTimerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(activeTimerSeconds - 1);
      }, 1000);
    } else if (timerActive && activeTimerSeconds === 0) {
      setTimerActive(false);
      setSosStatus('active');
      alert('[ALERT] Safety check-in timer expired! SOS has been dispatched silently.');
    }
    return () => clearInterval(interval);
  }, [timerActive, activeTimerSeconds, setTimerActive, setTimerSeconds]);

  // Live Location stream simulator (HTTP telemetry pings)
  useEffect(() => {
    if (isTracking) {
      // Simulates location telemetry ping every 5 seconds
      const locInterval = setInterval(() => {
        const nextLat = 37.7749 + (Math.random() - 0.5) * 0.002;
        const nextLng = -122.4194 + (Math.random() - 0.5) * 0.002;
        setCoordinates(nextLat, nextLng);

        fetch('/api/safety/location-update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tripId: checkInId || 'active-trip',
            latitude: nextLat,
            longitude: nextLng,
          }),
        }).catch((err) => console.error('HTTP telemetry ping failed:', err));
      }, 5000);

      return () => {
        clearInterval(locInterval);
      };
    }
  }, [isTracking, checkInId, setCoordinates, session]);

  // Load emergency contacts on mount
  useEffect(() => {
    fetchContacts();
  }, []);

  const generateUuid = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  // 1. Trigger Active SOS
  const handleTriggerSos = async (type: 'active' | 'silent') => {
    setSosStatus('loading');
    setErrorMessage('');
    
    // Simulate finding city/country
    const lat = latitude || 37.7749;
    const lng = longitude || -122.4194;

    try {
      const response = await fetch('/api/safety/sos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': generateUuid(),
        },
        body: JSON.stringify({
          latitude: lat,
          longitude: lng,
          city: 'San Francisco',
          state: 'California',
          country: 'United States',
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        setErrorMessage(result.error || 'Failed to dispatch SOS alert.');
        setSosStatus('idle');
      } else {
        setSosStatus(type);
        setActiveIncidentId(result.data.incidentId);
        setTracking(true);
      }
    } catch (err) {
      setErrorMessage('Network error triggering SOS.');
      setSosStatus('idle');
    }
  };

  // 2. Start Safety Check-In Timer
  const handleStartTimer = async () => {
    const mins = parseInt(durationMinutes);
    if (isNaN(mins) || mins <= 0) return;
    
    setErrorMessage('');
    try {
      const response = await fetch('/api/safety/check-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': generateUuid(),
        },
        body: JSON.stringify({ durationMinutes: mins }),
      });

      const result = await response.json();
      if (!response.ok) {
        setErrorMessage(result.error || 'Failed to start safety timer.');
      } else {
        setCheckInId(result.data.checkInId);
        setTimerSeconds(mins * 60);
        setTimerActive(true);
        setTracking(true);
      }
    } catch (err) {
      setErrorMessage('Network error scheduling timer.');
    }
  };

  // 3. Resolve active check-in timer
  const handleResolveTimer = async () => {
    if (!checkInId) return;
    try {
      const response = await fetch(`/api/safety/check-in/${checkInId}/resolve`, {
        method: 'PUT',
      });

      const result = await response.json();
      if (!response.ok) {
        setErrorMessage(result.error || 'Failed to resolve safety timer.');
      } else {
        setTimerActive(false);
        setTimerSeconds(0);
        setCheckInId(null);
        setTracking(false);
      }
    } catch (err) {
      setErrorMessage('Network error resolving safety timer.');
    }
  };

  // 4. Submit Duress PIN
  const handleVerifyDuress = () => {
    if (duressInput === '1234') {
      // Simulate silent dispatch
      setShowDuressModal(false);
      setDuressInput('');
      handleTriggerSos('silent');
      alert('[SILENT DISPATCH] Duress PIN accepted. Silent SOS dispatched. Dispatching location...');
    } else {
      alert('Invalid Duress PIN format.');
    }
  };

  // 5. Upload incident media
  const handleUploadMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaFile || !activeIncidentId) return;

    setIsUploading(true);
    setUploadSuccess(false);

    const formData = new FormData();
    formData.append('incidentId', activeIncidentId);
    formData.append('file', mediaFile);

    try {
      const response = await fetch('/api/safety/media', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setUploadSuccess(true);
        setMediaFile(null);
      } else {
        setErrorMessage('Failed to upload evidence.');
      }
    } catch (err) {
      setErrorMessage('Error uploading file.');
    } finally {
      setIsUploading(false);
    }
  };

  // Fetch emergency contacts
  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/safety/contacts');
      const result = await response.json();
      if (response.ok && result.success) {
        setContacts(result.data);
      }
    } catch (err) {
      console.error('Failed to fetch emergency contacts:', err);
    }
  };

  // Add a new contact
  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName || !newContactPhone || !newContactRelation) return;
    setIsSavingContact(true);
    try {
      const response = await fetch('/api/safety/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newContactName,
          phoneNumber: newContactPhone,
          relationship: newContactRelation,
        }),
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setContacts([result.data, ...contacts]);
        setNewContactName('');
        setNewContactPhone('');
        setNewContactRelation('');
      } else {
        alert(result.error || 'Failed to add emergency contact.');
      }
    } catch (err) {
      alert('Error adding emergency contact.');
    } finally {
      setIsSavingContact(false);
    }
  };

  // Delete contact
  const handleDeleteContact = async (id: string) => {
    if (!confirm('Are you sure you want to delete this emergency contact?')) return;
    try {
      const response = await fetch(`/api/safety/contacts/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setContacts(contacts.filter(c => c.id !== id));
      } else {
        alert(result.error || 'Failed to delete emergency contact.');
      }
    } catch (err) {
      alert('Error deleting emergency contact.');
    }
  };

  // Format seconds to MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Render fake shutdown black screen
  if (isFakeShutdown) {
    return (
      <div 
        onClick={() => setIsFakeShutdown(false)}
        className="fixed inset-0 z-50 bg-black flex items-center justify-center cursor-pointer select-none"
      >
        <p className="text-stone-900 text-xs font-mono select-none">SYSTEM CLOSED. RE-STARTING...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-text-primary">Safety Hub</h1>
          <p className="text-text-secondary text-sm">Active SOS dispatch, safety countdowns, and evidence vaults.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsFakeShutdown(true)}
            className="flex items-center gap-1 text-xs border border-bg-border bg-white text-text-secondary hover:text-text-primary"
          >
            <PowerOff className="h-3.5 w-3.5" />
            <span>Fake Shutdown</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowDuressModal(true)}
            className="flex items-center gap-1 text-xs border border-bg-border bg-white text-state-error hover:bg-red-50"
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Duress Trigger</span>
          </Button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 text-xs bg-state-error/10 border border-state-error/20 text-state-error rounded-xl text-center font-semibold">
          {errorMessage}
        </div>
      )}

      {/* Main Panic Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active SOS Panel */}
        <Card className="lg:col-span-2 relative overflow-hidden flex flex-col justify-center items-center p-8 bg-gradient-to-br from-red-50/50 via-white to-transparent border-red-100">
          <div className="absolute top-0 right-0 h-40 w-40 bg-state-error/5 rounded-full blur-2xl translate-x-12 -translate-y-12" />
          
          <CardHeader className="text-center pb-4 w-full">
            <CardTitle className="text-xl font-bold font-display text-text-primary flex items-center justify-center gap-2">
              <ShieldAlert className="h-5 w-5 text-state-error" />
              <span>EMERGENCY DISPATCH PANIC KEY</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Long-press or double click the SOS key to transmit a distress call to dispatchers and emergency contacts.
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col items-center gap-6 w-full">
            {/* SOS Pulse Button */}
            <div className="relative flex items-center justify-center my-4">
              <motion.div
                animate={{
                  scale: sosStatus === 'active' || sosStatus === 'silent' ? [1, 1.2, 1] : 1,
                  opacity: sosStatus === 'active' || sosStatus === 'silent' ? [0.4, 0.1, 0.4] : 0
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: 'easeInOut'
                }}
                className="absolute h-48 w-48 rounded-full bg-state-error"
              />
              <button
                onDoubleClick={() => handleTriggerSos('active')}
                disabled={sosStatus === 'loading'}
                className={`h-36 w-36 rounded-full flex flex-col items-center justify-center font-bold font-display transition-all duration-300 shadow-xl border-4
                  ${sosStatus === 'active' 
                    ? 'bg-state-error border-red-600 text-white animate-pulse'
                    : sosStatus === 'silent'
                    ? 'bg-stone-900 border-stone-800 text-stone-300'
                    : 'bg-white border-state-error text-state-error hover:bg-red-50 hover:scale-105'
                  }
                `}
              >
                <Flame className="h-10 w-10 mb-1" />
                <span className="text-lg uppercase tracking-wider">
                  {sosStatus === 'active' ? 'SOS Active' : sosStatus === 'silent' ? 'SILENT ACTIVE' : 'DOUBLE TAP'}
                </span>
                <span className="text-[10px] opacity-70 font-sans mt-0.5">TO TRIGGER</span>
              </button>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-4 w-full max-w-sm">
              <Button
                type="button"
                variant="secondary"
                disabled={sosStatus !== 'idle'}
                onClick={() => handleTriggerSos('silent')}
                className="flex-1 text-xs border-stone-400 text-stone-700 bg-white"
              >
                Trigger Silent SOS
              </Button>
              {(sosStatus === 'active' || sosStatus === 'silent') && (
                <Button
                  type="button"
                  onClick={() => setSosStatus('idle')}
                  className="flex-1 text-xs bg-stone-900 hover:bg-stone-800 text-white"
                >
                  Cancel Active SOS
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Safety Countdown Timer */}
        <Card className="relative overflow-hidden border-primary-lavender/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display text-text-primary">
              <Clock className="h-5 w-5 text-primary-violet" />
              <span>Safety Check-In Timer</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Configure a deadline. Failing to resolve the timer before expiration triggers automatic alarms.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {timerActive ? (
              <div className="flex flex-col items-center py-6 border border-primary-violet/10 rounded-2xl bg-primary-violet/[0.02]">
                <span className="text-4xl font-bold font-mono text-primary-violet tracking-wider">
                  {formatTime(activeTimerSeconds)}
                </span>
                <span className="text-xs text-text-secondary mt-1 font-semibold flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  Monitoring Active Trip...
                </span>
                <Button 
                  onClick={handleResolveTimer}
                  className="mt-6 w-full max-w-[200px] bg-emerald-500 hover:bg-emerald-600 text-white font-bold"
                >
                  Mark Myself Safe
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Input
                  label="Timer Duration (Minutes)"
                  type="number"
                  placeholder="15"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                />
                <Button 
                  onClick={handleStartTimer}
                  className="w-full bg-primary-violet hover:bg-primary-dark"
                >
                  Schedule Check-In
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Secondary Features Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Telemetry map placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary-violet" />
              <span>Live Location Sharing</span>
            </CardTitle>
            <CardDescription className="text-xs">Real-time GPS telemetry streaming and deviation analytics.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-44 w-full rounded-2xl bg-bg-surface border border-bg-border flex flex-col items-center justify-center gap-3 relative overflow-hidden">
              {isTracking ? (
                <>
                  <Compass className="h-8 w-8 text-primary-violet animate-spin-slow" />
                  <div className="text-center z-10">
                    <p className="text-xs font-bold text-text-primary">GPS Location Sharing Active</p>
                    <p className="text-[10px] text-text-secondary mt-0.5 font-mono">Lat: {latitude} | Lng: {longitude}</p>
                  </div>
                  <div className="absolute inset-0 bg-primary-violet/[0.01] animate-pulse" />
                </>
              ) : (
                <>
                  <MapPin className="h-8 w-8 text-text-secondary opacity-60" />
                  <p className="text-xs text-text-secondary">GPS Location stream offline. Start a timer or trigger SOS.</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Evidence media vault */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UploadCloud className="h-5 w-5 text-primary-violet" />
              <span>Evidence Vault Media Upload</span>
            </CardTitle>
            <CardDescription className="text-xs">Attach photos or audio tracks to active incidents for legal custody logs.</CardDescription>
          </CardHeader>
          <CardContent>
            {activeIncidentId ? (
              <form onSubmit={handleUploadMedia} className="space-y-4">
                {uploadSuccess && (
                  <div className="p-3 bg-state-success/10 border border-state-success/20 text-state-success rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-1.5">
                    <CheckCircle className="h-4 w-4" />
                    <span>Evidence saved in Vault successfully.</span>
                  </div>
                )}
                
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Select Evidence File</label>
                  <input 
                    type="file" 
                    onChange={(e) => setMediaFile(e.target.files ? e.target.files[0] : null)}
                    className="w-full text-xs text-text-secondary border border-bg-border rounded-lg p-2.5 bg-white file:mr-4 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary-violet file:text-white hover:file:bg-primary-dark"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isUploading || !mediaFile}
                  className="w-full flex items-center justify-center gap-1.5"
                >
                  {isUploading ? 'Uploading...' : 'Upload Evidence'}
                </Button>
              </form>
            ) : (
              <div className="py-8 text-center border border-dashed border-bg-border rounded-2xl flex flex-col items-center justify-center gap-2">
                <FileText className="h-8 w-8 text-text-secondary opacity-40" />
                <p className="text-xs text-text-secondary px-4">No active safety incident. Evidence vault uploads can only be linked to an active SOS event.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Emergency Contacts Panel */}
      <Card className="border-primary-lavender/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display text-text-primary">
            <Users className="h-5 w-5 text-primary-violet" />
            <span>Emergency Contacts</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Manage your support circle. These contacts are notified automatically when SOS triggers or check-in timers expire.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add Contact Form */}
          <form onSubmit={handleAddContact} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-bg-surface p-4 rounded-2xl border border-bg-border">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Contact Name</label>
              <Input
                placeholder="Aarav Sharma"
                value={newContactName}
                onChange={(e) => setNewContactName(e.target.value)}
                required
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Phone Number (E.164)</label>
              <Input
                placeholder="+919876543211"
                value={newContactPhone}
                onChange={(e) => setNewContactPhone(e.target.value)}
                required
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Relationship</label>
              <Input
                placeholder="Brother / Friend"
                value={newContactRelation}
                onChange={(e) => setNewContactRelation(e.target.value)}
                required
                className="h-9 text-xs"
              />
            </div>
            <Button
              type="submit"
              disabled={isSavingContact}
              className="h-9 bg-primary-violet hover:bg-primary-dark text-xs flex items-center justify-center gap-1.5"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>{isSavingContact ? 'Adding...' : 'Add Contact'}</span>
            </Button>
          </form>

          {/* Contacts List */}
          {contacts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-bg-border bg-white shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary-violet/10 flex items-center justify-center text-primary-violet font-bold font-display text-sm">
                      {contact.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-text-primary">{contact.name}</p>
                      <p className="text-[10px] text-text-secondary">{contact.phoneNumber} • <span className="font-semibold text-primary-violet">{contact.relationship}</span></p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteContact(contact.id)}
                    className="text-state-error hover:bg-red-50 hover:text-red-600 rounded-lg p-2 h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border border-dashed border-bg-border rounded-2xl flex flex-col items-center justify-center gap-2">
              <Users className="h-8 w-8 text-text-secondary opacity-40" />
              <p className="text-xs text-text-secondary">No additional emergency contacts configured. Set them up above.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Duress Pin Modal */}
      {showDuressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="max-w-sm w-full bg-white border border-bg-border shadow-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto h-10 w-10 bg-state-error/10 text-state-error rounded-full flex items-center justify-center mb-2">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg font-bold font-display text-text-primary">Duress Verification</CardTitle>
              <CardDescription className="text-xs">
                Entering your Duress PIN will simulate standard timer resolving but sends a silent priority dispatch alert.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Enter 4-Digit Duress PIN"
                type="password"
                maxLength={4}
                placeholder="••••"
                value={duressInput}
                onChange={(e) => setDuressInput(e.target.value.replace(/\D/g, ''))}
              />
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setShowDuressModal(false)} className="flex-1 text-xs">
                  Cancel
                </Button>
                <Button onClick={handleVerifyDuress} className="flex-1 text-xs bg-state-error hover:bg-red-600 text-white font-bold">
                  Submit PIN
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
export default SafetyHubView;
