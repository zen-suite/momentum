import { useEffect } from 'react';

import { workoutLogStorage } from '@/storage';
import { useWorkoutRoutineStore } from '@/store/workoutRoutineStore';

export function useLoadWorkoutRoutine() {
  const setWorkoutLogs = useWorkoutRoutineStore(
    (state) => state.setWorkoutLogs,
  );

  useEffect(() => {
    workoutLogStorage.load().then(setWorkoutLogs);
  }, [setWorkoutLogs]);
}
