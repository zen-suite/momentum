import { useEffect } from 'react';

import { workoutStorage } from '@/storage';
import { useWorkoutStore } from '@/store/workoutStore';

export function usePersistWorkouts() {
  const workouts = useWorkoutStore((state) => state.workouts);
  const isLoaded = useWorkoutStore((state) => state.isLoaded);

  useEffect(() => {
    if (!isLoaded) return;
    void workoutStorage.save(workouts).catch((error) => {
      console.error('[storage] Failed to persist workouts.', error);
    });
  }, [workouts, isLoaded]);
}
