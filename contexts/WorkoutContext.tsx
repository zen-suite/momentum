import React from 'react';
import { useShallow } from 'zustand/react/shallow';

import { useLoadWorkoutLogs } from '@/hooks/useLoadWorkoutLogs';
import { useLoadWorkouts } from '@/hooks/useLoadWorkouts';
import { usePersistWorkoutLogs } from '@/hooks/usePersistWorkoutLogs';
import { usePersistWorkouts } from '@/hooks/usePersistWorkouts';
import { useWorkoutLogStore } from '@/store/workoutLogStore';
import { useWorkoutStore } from '@/store/workoutStore';

export function WorkoutProvider({ children }: { children: React.ReactNode }) {
  useLoadWorkouts();
  usePersistWorkouts();

  return <>{children}</>;
}

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

export function WorkoutLogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useLoadWorkoutLogs();
  usePersistWorkoutLogs();

  return <>{children}</>;
}

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
