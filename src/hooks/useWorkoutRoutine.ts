import { useShallow } from 'zustand/react/shallow';

import { useWorkoutRoutineStore } from '@/store/workoutRoutineStore';

export function useWorkoutRoutine() {
  return useWorkoutRoutineStore(
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
