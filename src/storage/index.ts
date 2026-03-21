import { AsyncStorageWorkout } from './AsyncStorageWorkout';
import { AsyncStorageWorkoutHistory } from './AsyncStorageWorkoutHistory';
import { AsyncStorageWorkoutLog } from './AsyncStorageWorkoutLog';
import { WorkoutHistoryStorage } from './WorkoutHistoryStorage';
import { WorkoutLogStorage } from './WorkoutLogStorage';
import { WorkoutStorage } from './WorkoutStorage';

export type { WorkoutStorage as IWorkoutStorage };
export type { WorkoutLogStorage as IWorkoutLogStorage };
export type { WorkoutHistoryStorage as IWorkoutHistoryStorage };

export const workoutStorage: WorkoutStorage = new AsyncStorageWorkout();
export const workoutLogStorage: WorkoutLogStorage = new AsyncStorageWorkoutLog();
export const workoutHistoryStorage: WorkoutHistoryStorage = new AsyncStorageWorkoutHistory();
