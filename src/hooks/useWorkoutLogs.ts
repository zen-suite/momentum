import { useShallow } from 'zustand/react/shallow';

import { useWorkoutLogStore } from '@/store/workoutLogStore';

export function useWorkoutLogs() {
  return useWorkoutLogStore(
    useShallow((state) => ({
      workoutLogs: state.workoutLogs,
      completeSet: state.completeSet,
      completeExercise: state.completeExercise,
      toggleWorkoutComplete: state.toggleWorkoutComplete,
      restartRoutine: state.restartRoutine,
      getLog: state.getLog,
    })),
  );
}
