import { create } from 'zustand';

import {
  AppSettings,
  ExerciseDefaults,
  ThemeMode,
} from '@/types/settings-types';

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  exerciseDefaults: {
    reps: 0,
    sets: 1,
    weight: undefined,
  },
};

interface SettingsState {
  settings: AppSettings;
  isLoaded: boolean;
  setSettings: (settings: AppSettings) => void;
  updateTheme: (theme: ThemeMode) => void;
  updateExerciseDefaults: (defaults: Partial<ExerciseDefaults>) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: DEFAULT_SETTINGS,
  isLoaded: false,

  setSettings: (settings: AppSettings) => {
    set({ settings, isLoaded: true });
  },

  updateTheme: (theme: ThemeMode) => {
    set((state) => ({ settings: { ...state.settings, theme } }));
  },

  updateExerciseDefaults: (defaults: Partial<ExerciseDefaults>) => {
    set((state) => ({
      settings: {
        ...state.settings,
        exerciseDefaults: { ...state.settings.exerciseDefaults, ...defaults },
      },
    }));
  },
}));
