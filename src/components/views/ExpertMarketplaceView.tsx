import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Star, 
  Calendar, 
  Clock, 
  CheckCircle, 
  FileText,
  UserCheck,
  Video
} from 'lucide-react';

export const ExpertMarketplaceView: React.FC = () => {
  // Local States
  const [experts, setExperts] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  
  // Modal states
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingExpert, setBookingExpert] = useState<any>(null);
  const [bookingDate, setBookingDate] = useState('2026-07-02');
  const [bookingTime, setBookingTime] = useState('10:00');
  const [bookingNotes, setBookingNotes] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState('');

  const categories = [
    { id: '', label: 'All Categories' },
    { id: 'OBGYN', label: 'Ob-Gyns' },
    { id: 'THERAPIST', label: 'Therapists' },
    { id: 'COUNSELOR', label: 'Counselors' },
    { id: 'LEGAL_ADVISOR', label: 'Legal Rights' },
    { id: 'SAFETY_EXPERT', label: 'Safety Experts' }
  ];

  // Fetch Experts
  const fetchExperts = async (cat: string) => {
    try {
      const url = cat ? `/api/experts?category=${cat}` : '/api/experts';
      const response = await fetch(url);
      const result = await response.json();
      if (response.ok && result.success) {
        setExperts(result.data);
      }
    } catch (err) {
      console.error('Failed to fetch experts:', err);
    }
  };

  // Fetch Scheduled Appointments
  const fetchAppointments = async () => {
    try {
      const response = await fetch('/api/appointments');
      const result = await response.json();
      if (response.ok && result.success) {
        setAppointments(result.data);
      }
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
    }
  };

  // Handle Book Session submit
  const handleBookSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingExpert) return;

    setIsBooking(true);
    setBookingSuccess('');

    try {
      const isoTimestamp = new Date(`${bookingDate}T${bookingTime}:00`).toISOString();
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expertId: bookingExpert.id,
          scheduledAt: isoTimestamp,
          notes: bookingNotes,
        }),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setBookingSuccess('Session booked successfully! Check your inbox for links.');
        setBookingNotes('');
        setShowBookingModal(false);
        fetchAppointments();
      } else {
        alert(result.error || 'Failed to book session.');
      }
    } catch (err) {
      alert('Error booking session.');
    } finally {
      setIsBooking(false);
    }
  };

  useEffect(() => {
    fetchExperts(selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    fetchAppointments();
  }, []);

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-text-primary">Expert Marketplace</h1>
          <p className="text-text-secondary text-sm">Schedule private consultations with OBGYNs, counselors, and legal safety advisors.</p>
        </div>
      </div>

      {bookingSuccess && (
        <div className="p-3 text-xs bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-center font-semibold flex items-center justify-center gap-1.5">
          <CheckCircle className="h-4 w-4" />
          <span>{bookingSuccess}</span>
        </div>
      )}

      {/* Categories Scroller */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-xs font-semibold shrink-0 transition-all duration-200 border
              ${selectedCategory === cat.id
                ? 'bg-primary-violet border-primary-violet text-white shadow-sm'
                : 'bg-white border-bg-border text-text-secondary hover:border-primary-violet/30'
              }
            `}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Main Grid: Experts List & Scheduled Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Experts List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider font-inter">Available Consultants</h3>
          {experts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {experts.map((exp) => (
                <Card key={exp.id} className="hover:shadow-md transition-all duration-200 border-bg-border flex flex-col justify-between">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <CardTitle className="text-sm font-bold font-display">{exp.name}</CardTitle>
                        <Badge variant="secondary" className="text-[9px] uppercase tracking-wider mt-1 px-1.5 py-0.5 bg-primary-violet/5 text-primary-violet border-0">
                          {exp.category}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-0.5 text-amber-500 font-mono text-xs font-bold">
                        <Star className="h-3.5 w-3.5 fill-amber-500" />
                        <span>{exp.rating}</span>
                      </div>
                    </div>
                    <CardDescription className="text-xs mt-3 leading-relaxed">
                      {exp.bio}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 pb-4">
                    <Button 
                      onClick={() => {
                        setBookingExpert(exp);
                        setShowBookingModal(true);
                      }}
                      className="w-full bg-primary-violet hover:bg-primary-dark text-xs font-bold py-2 h-9"
                    >
                      Book Session
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center border border-dashed border-bg-border rounded-2xl">
              <p className="text-xs text-text-secondary">No consultants found for this category.</p>
            </div>
          )}
        </div>

        {/* Scheduled Sessions sidebar */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider font-inter">Your Sessions</h3>
          {appointments.length > 0 ? (
            <div className="space-y-3">
              {appointments.map((appt) => (
                <Card key={appt.id} className="border-emerald-100/60 bg-emerald-50/[0.01]">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <p className="text-xs font-bold text-text-primary">{appt.expert.name}</p>
                        <Badge variant="primary" className="text-[8px] uppercase tracking-wider mt-0.5 bg-emerald-500 border-0 text-white font-bold">
                          {appt.expert.category}
                        </Badge>
                      </div>
                      <Badge variant="secondary" className="text-[9px] border-emerald-300 text-emerald-600 bg-emerald-50/50 flex items-center gap-1 font-semibold">
                        <Video className="h-3 w-3" />
                        <span>Online</span>
                      </Badge>
                    </div>

                    <div className="flex gap-4 text-[10px] font-mono text-text-secondary border-t border-bg-border/60 pt-2.5">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-primary-violet" />
                        <span>{new Date(appt.scheduledAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-primary-violet" />
                        <span>{new Date(appt.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center border border-dashed border-bg-border rounded-2xl flex flex-col items-center justify-center gap-2">
              <Calendar className="h-8 w-8 text-text-secondary opacity-40" />
              <p className="text-xs text-text-secondary px-6">No sessions scheduled yet. Select a consultant to get started.</p>
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && bookingExpert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="max-w-md w-full bg-white border border-bg-border shadow-2xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold font-display text-text-primary flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-primary-violet" />
                <span>Confirm Booking Details</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Book a 30-minute telehealth session with {bookingExpert.name}.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleBookSession}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Session Date"
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    required
                  />
                  <Input
                    label="Session Time"
                    type="time"
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-text-secondary uppercase">Consultation Notes (Optional)</label>
                  <textarea
                    placeholder="Describe symptoms, cycle regularities, or questions you wish to address..."
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    className="w-full text-xs border border-bg-border rounded-lg p-2.5 bg-white min-h-[80px]"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="secondary" onClick={() => setShowBookingModal(false)} className="flex-1 text-xs">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isBooking} className="flex-1 text-xs bg-primary-violet hover:bg-primary-dark text-white font-bold">
                    {isBooking ? 'Processing...' : 'Confirm Session'}
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
export default ExpertMarketplaceView;
