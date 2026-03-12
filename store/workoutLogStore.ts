import { create } from 'zustand';

import { workoutLogStorage } from '@/storage';
import { ExerciseLog, Workout, WorkoutLog } from '@/types/workout';

let _nextId = 0;
const generateId = () => `${Date.now()}-${++_nextId}`;

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
  loadLogs: () => Promise<void>;
  completeSet: (workout: Workout, exerciseId: string, setIndex: number) => void;
  completeExercise: (workout: Workout, exerciseId: string) => void;
  toggleWorkoutComplete: (workout: Workout) => void;
  restartRoutine: () => void;
  getLog: (workoutId: string) => WorkoutLog | undefined;
}

export const useWorkoutLogStore = create<WorkoutLogState>((set, get) => ({
  workoutLogs: {},
  isLoaded: false,

  loadLogs: async () => {
    const loaded = await workoutLogStorage.load();
    set({ workoutLogs: loaded, isLoaded: true });
  },

  completeSet: (workout: Workout, exerciseId: string, setIndex: number) => {
    set((state) => {
      const log = getOrCreateLog(state.workoutLogs, workout);
      const now = new Date();
      const updatedExercises = log.exercises.map((e) => {
        if (e.exercise.id !== exerciseId) return e;
        const sets = e.sets ?? [];
        const isSetDone = !!sets.find((s) => s.setIndex === setIndex)?.completedAt;
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
      const workoutLogs = { ...state.workoutLogs, [workout.id]: updatedLog };
      workoutLogStorage.save(workoutLogs);
      return { workoutLogs };
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
          ? { ...e, completedAt: isCompleted ? undefined : now }
          : e,
      );
      const allDone = updatedExercises.every((e) => !!e.completedAt);
      const updatedLog: WorkoutLog = {
        ...log,
        exercises: updatedExercises,
        completedAt: allDone ? now : undefined,
      };
      const workoutLogs = { ...state.workoutLogs, [workout.id]: updatedLog };
      workoutLogStorage.save(workoutLogs);
      return { workoutLogs };
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
      const workoutLogs = { ...state.workoutLogs, [workout.id]: updatedLog };
      workoutLogStorage.save(workoutLogs);
      return { workoutLogs };
    });
  },

  restartRoutine: () => {
    set(() => {
      workoutLogStorage.save({});
      return { workoutLogs: {} };
    });
  },

  getLog: (workoutId: string) => {
    return get().workoutLogs[workoutId];
  },
}));
