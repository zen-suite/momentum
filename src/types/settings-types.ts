export type ThemeMode = 'light' | 'dark' | 'system';

export interface ExerciseDefaults {
  reps: number;
  sets: number;
  weight: number | undefined;
}

export interface AppSettings {
  theme: ThemeMode;
  exerciseDefaults: ExerciseDefaults;
}
