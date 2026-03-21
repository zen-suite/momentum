import { create } from 'zustand';

import 'react-native-get-random-values';
import { v7 as uuidv7 } from 'uuid';

import { ExerciseLog, Workout, WorkoutLog } from '@/types/workout';

const generateId = () => uuidv7();

function migrateExerciseLog(e: ExerciseLog): ExerciseLog {
  if (e.sets && e.sets.length > 0) return e;
  return {
    ...e,
    sets: Array.from({ length: e.exercise.numberOfSets }, (_, i) => ({
      setIndex: i,
      completedAt: e.completedAt,
    })),
  };
}

function getOrCreateLog(
  logs: Record<string, WorkoutLog>,
  workout: Workout,
): WorkoutLog {
  const existing = logs[workout.id];
  if (existing) {
    return {
      ...existing,
      exercises: existing.exercises.map(migrateExerciseLog),
    };
  }
  return {
    id: workout.id,
    workout,
    exercises: workout.exercises.map(
      (e): ExerciseLog => ({
        id: generateId(),
        exercise: e,
        sets: Array.from({ length: e.numberOfSets }, (_, i) => ({
          setIndex: i,
          completedAt: undefined,
        })),
        completedAt: undefined,
      }),
    ),
    completedAt: undefined,
  };
}

interface WorkoutLogState {
  workoutLogs: Record<string, WorkoutLog>;
  isLoaded: boolean;
  setWorkoutLogs: (logs: Record<string, WorkoutLog>) => void;
  completeSet: (workout: Workout, exerciseId: string, setIndex: number) => void;
  completeExercise: (workout: Workout, exerciseId: string) => void;
  toggleWorkoutComplete: (workout: Workout) => void;
  restartRoutine: () => void;
  getLog: (workoutId: string) => WorkoutLog | undefined;
}

export const useWorkoutLogStore = create<WorkoutLogState>((set, get) => ({
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
        const sets = e.sets ?? [];
        const isSetDone = !!sets.find((s) => s.setIndex === setIndex)
          ?.completedAt;
        const updatedSets = sets.map((s) =>
          s.setIndex === setIndex
            ? { ...s, completedAt: isSetDone ? undefined : now }
            : s,
        );
        const allSetsDone = updatedSets.every((s) => !!s.completedAt);
        return {
          ...e,
          sets: updatedSets,
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
              sets: e.sets.map((s) => ({
                ...s,
                completedAt: isCompleted ? undefined : s.completedAt ?? now,
              })),
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
          })),
        };
      } else {
        updatedLog = {
          ...log,
          completedAt: now,
          exercises: log.exercises.map((e) => ({
            ...e,
            completedAt: e.completedAt ?? now,
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
}));
