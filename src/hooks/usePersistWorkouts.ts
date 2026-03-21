import { useEffect } from 'react';

import { workoutStorage } from '@/storage';
import { useWorkoutStore } from '@/store/workoutStore';

export function usePersistWorkouts() {
  const workouts = useWorkoutStore((state) => state.workouts);
  const isLoaded = useWorkoutStore((state) => state.isLoaded);

  useEffect(() => {
    if (!isLoaded) return;
    workoutStorage.save(workouts);
  }, [workouts, isLoaded]);
}
