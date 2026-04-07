export type ThemeMode = 'light' | 'dark' | 'system';

export interface ExerciseDefaults {
  reps: number;
  sets: number;
  weight: number | undefined;
}

export interface NotificationSettings {
  enabled: boolean;
  workoutDays: number;
  breakDays: number;
  sendHour: number;
  sendMinute: number;
  patternAnchorDate: string | null;
}

export interface AppSettings {
  theme: ThemeMode;
  exerciseDefaults: ExerciseDefaults;
  notifications: NotificationSettings;
}
