import {
  AppSettings,
  ExerciseDefaults,
  NotificationSettings,
} from '@/types/settings-types';

export const DEFAULT_EXERCISE_DEFAULTS: ExerciseDefaults = {
  reps: 0,
  sets: 1,
  weight: undefined,
};

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: false,
  workoutDays: 3,
  breakDays: 1,
  sendHour: 19,
  sendMinute: 0,
  patternAnchorDate: null,
};

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  exerciseDefaults: DEFAULT_EXERCISE_DEFAULTS,
  notifications: DEFAULT_NOTIFICATION_SETTINGS,
};

export function normalizeSettings(
  settings: Partial<AppSettings> | null | undefined,
): AppSettings {
  return {
    theme: settings?.theme ?? DEFAULT_SETTINGS.theme,
    exerciseDefaults: {
      ...DEFAULT_EXERCISE_DEFAULTS,
      ...(settings?.exerciseDefaults ?? {}),
    },
    notifications: {
      ...DEFAULT_NOTIFICATION_SETTINGS,
      ...(settings?.notifications ?? {}),
    },
  };
}
