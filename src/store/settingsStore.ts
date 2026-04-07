import { create } from 'zustand';

import {
  AppSettings,
  ExerciseDefaults,
  NotificationSettings,
  ThemeMode,
} from '@/types/settings-types';
import { DEFAULT_SETTINGS } from '@/utils/settings';

interface SettingsState {
  settings: AppSettings;
  isLoaded: boolean;
  setSettings: (settings: AppSettings) => void;
  updateTheme: (theme: ThemeMode) => void;
  updateExerciseDefaults: (defaults: Partial<ExerciseDefaults>) => void;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
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

  updateNotificationSettings: (notifications) => {
    set((state) => ({
      settings: {
        ...state.settings,
        notifications: { ...state.settings.notifications, ...notifications },
      },
    }));
  },

  setNotificationsEnabled: (enabled: boolean) => {
    set((state) => ({
      settings: {
        ...state.settings,
        notifications: { ...state.settings.notifications, enabled },
      },
    }));
  },
}));
