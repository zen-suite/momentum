import { create } from 'zustand';

import 'react-native-get-random-values';
import { v7 as uuidv7 } from 'uuid';

import { ExerciseLog, Workout, WorkoutLog } from '@/types/workout';

const generateId = () => uuidv7();

function getOrCreateLog(
  logs: Record<string, WorkoutLog>,
  workout: Workout,
): WorkoutLog {
  const existing = logs[workout.id];
  if (existing) {
    const existingMap = new Map(
      existing.exercises.map((e) => [e.exercise.id, e]),
    );
    const syncedExercises = workout.exercises.map((exercise) => {
      const existingExLog = existingMap.get(exercise.id);
      if (!existingExLog) {
        return {
          id: generateId(),
          exercise,
          completedSets: 0,
          completedAt: undefined as Date | undefined,
        };
      }
      return { ...existingExLog, exercise };
    });
    return { ...existing, exercises: syncedExercises };
  }
  return {
    id: workout.id,
    workout,
    exercises: workout.exercises.map(
      (e): ExerciseLog => ({
        id: generateId(),
        exercise: e,
        completedSets: 0,
        completedAt: undefined,
      }),
    ),
    completedAt: undefined,
  };
}

interface WorkoutRoutineState {
  workoutLogs: Record<string, WorkoutLog>;
  isLoaded: boolean;
  setWorkoutLogs: (logs: Record<string, WorkoutLog>) => void;
  completeSet: (workout: Workout, exerciseId: string, setIndex: number) => void;
  completeExercise: (workout: Workout, exerciseId: string) => void;
  toggleWorkoutComplete: (workout: Workout) => void;
  restartRoutine: () => void;
  getLog: (workoutId: string) => WorkoutLog | undefined;
}

export const useWorkoutRoutineStore = create<WorkoutRoutineState>(
  (set, get) => ({
    workoutLogs: {},
    isLoaded: false,

    setWorkoutLogs: (logs: Record<string, WorkoutLog>) => {
      set({ workoutLogs: logs, isLoaded: true });
    },

    completeSet: (workout: Workout, exerciseId: string, setIndex: number) => {
      set((state) => {
        const log = getOrCreateLog(state.workoutLogs, workout);
        const now = new Date();
        const updatedExercises = log.exercises.map((e) => {
          if (e.exercise.id !== exerciseId) return e;
          const newCompletedSets =
            setIndex < e.completedSets ? setIndex : setIndex + 1;
          const allSetsDone = newCompletedSets === e.exercise.numberOfSets;
          return {
            ...e,
            completedSets: newCompletedSets,
            completedAt: allSetsDone ? now : undefined,
          };
        });
        const allDone = updatedExercises.every((e) => !!e.completedAt);
        const updatedLog: WorkoutLog = {
          ...log,
          exercises: updatedExercises,
          completedAt: allDone ? now : undefined,
        };
        return {
          workoutLogs: { ...state.workoutLogs, [workout.id]: updatedLog },
        };
      });
    },

    completeExercise: (workout: Workout, exerciseId: string) => {
      set((state) => {
        const log = getOrCreateLog(state.workoutLogs, workout);
        const now = new Date();
        const target = log.exercises.find((e) => e.exercise.id === exerciseId);
        const isCompleted = !!target?.completedAt;
        const updatedExercises = log.exercises.map((e) =>
          e.exercise.id === exerciseId
            ? {
                ...e,
                completedAt: isCompleted ? undefined : now,
                completedSets: isCompleted ? 0 : e.exercise.numberOfSets,
              }
            : e,
        );
        const allDone = updatedExercises.every((e) => !!e.completedAt);
        const updatedLog: WorkoutLog = {
          ...log,
          exercises: updatedExercises,
          completedAt: allDone ? now : undefined,
        };
        return {
          workoutLogs: { ...state.workoutLogs, [workout.id]: updatedLog },
        };
      });
    },

    toggleWorkoutComplete: (workout: Workout) => {
      set((state) => {
        const log = getOrCreateLog(state.workoutLogs, workout);
        const now = new Date();
        let updatedLog: WorkoutLog;
        if (log.completedAt) {
          updatedLog = {
            ...log,
            completedAt: undefined,
            exercises: log.exercises.map((e) => ({
              ...e,
              completedAt: undefined,
              completedSets: 0,
            })),
          };
        } else {
          updatedLog = {
            ...log,
            completedAt: now,
            exercises: log.exercises.map((e) => ({
              ...e,
              completedAt: e.completedAt ?? now,
              completedSets: e.exercise.numberOfSets,
            })),
          };
        }
        return {
          workoutLogs: { ...state.workoutLogs, [workout.id]: updatedLog },
        };
      });
    },

    restartRoutine: () => {
      set({ workoutLogs: {} });
    },

    getLog: (workoutId: string) => {
      return get().workoutLogs[workoutId];
    },
  }),
);
