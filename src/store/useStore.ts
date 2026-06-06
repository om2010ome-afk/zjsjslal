import { create } from 'zustand';
import type { FontFile, OpenTypeFeature, FontJob, Page, User } from '../types';
import { onAuthChange, signOutUser, type FirebaseUser } from '../lib/firebase';

interface AppState {
  currentPage: Page;
  setPage: (page: Page) => void;
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  initAuth: () => () => void;
  currentFont: FontFile | null;
  fonts: FontFile[];
  setCurrentFont: (font: FontFile | null) => void;
  addFont: (font: FontFile) => void;
  updateFont: (id: string, updates: Partial<FontFile>) => void;
  removeFont: (id: string) => void;
  detectedFeatures: OpenTypeFeature[];
  selectedFeatures: string[];
  setDetectedFeatures: (features: OpenTypeFeature[]) => void;
  toggleFeature: (tag: string) => void;
  selectAllFeatures: () => void;
  clearSelectedFeatures: () => void;
  jobs: FontJob[];
  currentJob: FontJob | null;
  addJob: (job: FontJob) => void;
  updateJob: (id: string, updates: Partial<FontJob>) => void;
  setCurrentJob: (job: FontJob | null) => void;
  fontPreviewUrl: string | null;
  setFontPreviewUrl: (url: string | null) => void;
  labText: string;
  labFontSize: number;
  labLineHeight: number;
  labLetterSpacing: number;
  labDirection: 'rtl' | 'ltr';
  labTextColor: string;
  labBgColor: string;
  setLabText: (text: string) => void;
  setLabFontSize: (size: number) => void;
  setLabLineHeight: (height: number) => void;
  setLabLetterSpacing: (spacing: number) => void;
  setLabDirection: (dir: 'rtl' | 'ltr') => void;
  setLabTextColor: (color: string) => void;
  setLabBgColor: (color: string) => void;
  showSplash: boolean;
  setShowSplash: (show: boolean) => void;
}

function firebaseUserToAppUser(fbUser: FirebaseUser): User {
  return {
    id: fbUser.uid,
    email: fbUser.email || '',
    displayName: fbUser.displayName || 'مستخدم',
    photoURL: fbUser.photoURL || undefined,
    plan: 'free',
    createdAt: new Date(),
  };
}

export const useStore = create<AppState>((set, _get) => ({
  currentPage: 'splash',
  setPage: (page) => set({ currentPage: page }),

  user: null,
  isAuthenticated: false,
  login: (user) => set({ user, isAuthenticated: true, currentPage: 'dashboard' }),
  logout: async () => {
    await signOutUser();
    set({ user: null, isAuthenticated: false, currentPage: 'landing' });
  },

  // Called once on app mount — listens to Firebase auth state
  initAuth: () => {
    const unsubscribe = onAuthChange((fbUser) => {
      if (fbUser) {
        set({
          user: firebaseUserToAppUser(fbUser),
          isAuthenticated: true,
          currentPage: 'dashboard',
        });
      } else {
        set({ user: null, isAuthenticated: false });
      }
    });
    return unsubscribe;
  },

  currentFont: null,
  fonts: [],
  setCurrentFont: (font) => set({ currentFont: font }),
  addFont: (font) => set((state) => ({ fonts: [...state.fonts, font] })),
  updateFont: (id, updates) => set((state) => ({
    fonts: state.fonts.map((f) => f.id === id ? { ...f, ...updates } : f),
    currentFont: state.currentFont?.id === id ? { ...state.currentFont, ...updates } : state.currentFont,
  })),
  removeFont: (id) => set((state) => ({
    fonts: state.fonts.filter((f) => f.id !== id),
    currentFont: state.currentFont?.id === id ? null : state.currentFont,
  })),

  detectedFeatures: [],
  selectedFeatures: [],
  setDetectedFeatures: (features) => set({ detectedFeatures: features }),
  toggleFeature: (tag) => set((state) => ({
    selectedFeatures: state.selectedFeatures.includes(tag)
      ? state.selectedFeatures.filter((t) => t !== tag)
      : [...state.selectedFeatures, tag],
  })),
  selectAllFeatures: () => set((state) => ({
    selectedFeatures: state.detectedFeatures.filter(f => f.canFreeze).map(f => f.tag),
  })),
  clearSelectedFeatures: () => set({ selectedFeatures: [] }),

  jobs: [],
  currentJob: null,
  addJob: (job) => set((state) => ({ jobs: [...state.jobs, job] })),
  updateJob: (id, updates) => set((state) => ({
    jobs: state.jobs.map((j) => j.id === id ? { ...j, ...updates } : j),
    currentJob: state.currentJob?.id === id ? { ...state.currentJob, ...updates } : state.currentJob,
  })),
  setCurrentJob: (job) => set({ currentJob: job }),

  fontPreviewUrl: null,
  setFontPreviewUrl: (url) => set({ fontPreviewUrl: url }),

  labText: 'بسم الله الرحمن الرحيم\nThe quick brown fox jumps over the lazy dog\nمهندس الخطوط - FontEngineer\n0123456789',
  labFontSize: 48,
  labLineHeight: 1.6,
  labLetterSpacing: 0,
  labDirection: 'rtl',
  labTextColor: '#FFFFFF',
  labBgColor: '#0B0B0F',
  setLabText: (text) => set({ labText: text }),
  setLabFontSize: (size) => set({ labFontSize: size }),
  setLabLineHeight: (height) => set({ labLineHeight: height }),
  setLabLetterSpacing: (spacing) => set({ labLetterSpacing: spacing }),
  setLabDirection: (dir) => set({ labDirection: dir }),
  setLabTextColor: (color) => set({ labTextColor: color }),
  setLabBgColor: (color) => set({ labBgColor: color }),

  showSplash: true,
  setShowSplash: (show) => set({ showSplash: show }),
}));
