import { useShallow } from 'zustand/react/shallow';

import { useWorkoutStore } from '@/store/workoutStore';

export function useWorkouts() {
  return useWorkoutStore(
    useShallow((state) => ({
      workouts: state.workouts,
      addWorkout: state.addWorkout,
      updateWorkout: state.updateWorkout,
      deleteWorkout: state.deleteWorkout,
      addExerciseToWorkout: state.addExerciseToWorkout,
      updateExercise: state.updateExercise,
      deleteExercise: state.deleteExercise,
      getWorkoutById: state.getWorkoutById,
    })),
  );
}
