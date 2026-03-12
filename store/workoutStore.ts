import { create } from 'zustand';
import { v7 as uuidv7 } from 'uuid';

import { workoutStorage } from '@/storage';
import { Exercise, Workout } from '@/types/workout';

const generateId = () => uuidv7();

interface WorkoutState {
  workouts: Workout[];
  isLoaded: boolean;
  loadWorkouts: () => Promise<void>;
  addWorkout: (name: string) => Workout;
  updateWorkout: (id: string, updates: Partial<Workout>) => void;
  deleteWorkout: (id: string) => void;
  addExerciseToWorkout: (workoutId: string, exerciseName: string) => void;
  updateExercise: (
    workoutId: string,
    exerciseId: string,
    updates: Partial<Exercise>,
  ) => void;
  deleteExercise: (workoutId: string, exerciseId: string) => void;
  getWorkoutById: (id: string) => Workout | undefined;
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  workouts: [],
  isLoaded: false,

  loadWorkouts: async () => {
    const loaded = await workoutStorage.load();
    set({ workouts: loaded, isLoaded: true });
  },

  addWorkout: (name: string): Workout => {
    const newWorkout: Workout = {
      id: generateId(),
      name,
      exercises: [],
      createdAt: new Date(),
    };
    set((state) => {
      const workouts = [...state.workouts, newWorkout];
      workoutStorage.save(workouts);
      return { workouts };
    });
    return newWorkout;
  },

  updateWorkout: (id: string, updates: Partial<Workout>) => {
    set((state) => {
      const workouts = state.workouts.map((w) =>
        w.id === id ? { ...w, ...updates } : w,
      );
      workoutStorage.save(workouts);
      return { workouts };
    });
  },

  deleteWorkout: (id: string) => {
    set((state) => {
      const workouts = state.workouts.filter((w) => w.id !== id);
      workoutStorage.save(workouts);
      return { workouts };
    });
  },

  addExerciseToWorkout: (workoutId: string, exerciseName: string) => {
    const newExercise: Exercise = {
      id: generateId(),
      name: exerciseName,
      reps: 0,
      numberOfSets: 1,
    };
    set((state) => {
      const workouts = state.workouts.map((w) =>
        w.id === workoutId
          ? { ...w, exercises: [...w.exercises, newExercise] }
          : w,
      );
      workoutStorage.save(workouts);
      return { workouts };
    });
  },

  updateExercise: (
    workoutId: string,
    exerciseId: string,
    updates: Partial<Exercise>,
  ) => {
    set((state) => {
      const workouts = state.workouts.map((w) =>
        w.id === workoutId
          ? {
              ...w,
              exercises: w.exercises.map((e) =>
                e.id === exerciseId ? { ...e, ...updates } : e,
              ),
            }
          : w,
      );
      workoutStorage.save(workouts);
      return { workouts };
    });
  },

  deleteExercise: (workoutId: string, exerciseId: string) => {
    set((state) => {
      const workouts = state.workouts.map((w) =>
        w.id === workoutId
          ? {
              ...w,
              exercises: w.exercises.filter((e) => e.id !== exerciseId),
            }
          : w,
      );
      workoutStorage.save(workouts);
      return { workouts };
    });
  },

  getWorkoutById: (id: string) => {
    return get().workouts.find((w) => w.id === id);
  },
}));
