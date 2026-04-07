import { SettingsStorage } from './SettingsStorage';
import { WorkoutHistoryStorage } from './WorkoutHistoryStorage';
import { WorkoutLogStorage } from './WorkoutLogStorage';
import { WorkoutStorage } from './WorkoutStorage';

export type StorageInitializationStatus = 'initializing-storage';

export interface StorageInitializationOptions {
  onStatusChange?: (status: StorageInitializationStatus) => void;
}

export interface StorageBackend {
  readonly name: 'sqlite';
  readonly workoutStorage: WorkoutStorage;
  readonly workoutLogStorage: WorkoutLogStorage;
  readonly workoutHistoryStorage: WorkoutHistoryStorage;
  readonly settingsStorage: SettingsStorage;
  initialize(options?: StorageInitializationOptions): Promise<void>;
  clearAll(): Promise<void>;
}
