import { useEffect } from 'react';

import { workoutLogStorage } from '@/storage';
import { useWorkoutLogStore } from '@/store/workoutLogStore';

export function useLoadWorkoutLogs() {
  const setWorkoutLogs = useWorkoutLogStore((state) => state.setWorkoutLogs);

  useEffect(() => {
    workoutLogStorage.load().then(setWorkoutLogs);
  }, [setWorkoutLogs]);
}
