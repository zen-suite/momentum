import { useEffect } from 'react';

import { workoutStorage } from '@/storage';
import { useWorkoutStore } from '@/store/workoutStore';

export function useLoadWorkouts() {
  const setWorkouts = useWorkoutStore((state) => state.setWorkouts);

  useEffect(() => {
    workoutStorage.load().then(setWorkouts);
  }, [setWorkouts]);
}
