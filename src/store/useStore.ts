import { create } from 'zustand';

export interface UiSlice {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isBottomDrawerOpen: boolean;
  setBottomDrawerOpen: (open: boolean) => void;
}

export interface SafetySlice {
  isTracking: boolean;
  setTracking: (tracking: boolean) => void;
  activeTimerSeconds: number;
  timerActive: boolean;
  setTimerActive: (active: boolean) => void;
  setTimerSeconds: (seconds: number) => void;
  latitude: number | null;
  longitude: number | null;
  setCoordinates: (lat: number, lng: number) => void;
}

export interface HealthSlice {
  symptoms: string[];
  addSymptom: (symptom: string) => void;
  removeSymptom: (symptom: string) => void;
  clearSymptoms: () => void;
  cycleLength: number;
  setCycleLength: (len: number) => void;
}

export type StoreState = UiSlice & SafetySlice & HealthSlice;

export const useStore = create<StoreState>((set) => ({
  // UI Slice
  activeTab: 'dashboard',
  setActiveTab: (tab) => set({ activeTab: tab }),
  isBottomDrawerOpen: false,
  setBottomDrawerOpen: (open) => set({ isBottomDrawerOpen: open }),

  // Safety Slice
  isTracking: false,
  setTracking: (tracking) => set({ isTracking: tracking }),
  activeTimerSeconds: 0,
  timerActive: false,
  setTimerActive: (active) => set({ timerActive: active }),
  setTimerSeconds: (seconds) => set({ activeTimerSeconds: seconds }),
  latitude: null,
  longitude: null,
  setCoordinates: (lat, lng) => set({ latitude: lat, longitude: lng }),

  // Health Slice
  symptoms: [],
  addSymptom: (symptom) => set((state) => ({ 
    symptoms: state.symptoms.includes(symptom) ? state.symptoms : [...state.symptoms, symptom] 
  })),
  removeSymptom: (symptom) => set((state) => ({ 
    symptoms: state.symptoms.filter((s) => s !== symptom) 
  })),
  clearSymptoms: () => set({ symptoms: [] }),
  cycleLength: 28,
  setCycleLength: (len) => set({ cycleLength: len }),
}));
