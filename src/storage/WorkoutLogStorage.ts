import { WorkoutLog } from '@/types/workout';

export interface WorkoutLogStorage {
  load(): Promise<Record<string, WorkoutLog>>;
  save(logs: Record<string, WorkoutLog>): Promise<void>;
}
