import 'react-native-get-random-values';
import { v7 as uuidv7 } from 'uuid';
import { create } from 'zustand';

import { Exercise, Workout } from '@/types/workout';

const generateId = () => uuidv7();

interface WorkoutState {
  workouts: Workout[];
  isLoaded: boolean;
  setWorkouts: (workouts: Workout[]) => void;
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

  setWorkouts: (workouts: Workout[]) => {
    set({ workouts, isLoaded: true });
  },

  addWorkout: (name: string): Workout => {
    const newWorkout: Workout = {
      id: generateId(),
      name,
      exercises: [],
      createdAt: new Date(),
    };
    set((state) => ({ workouts: [...state.workouts, newWorkout] }));
    return newWorkout;
  },

  updateWorkout: (id: string, updates: Partial<Workout>) => {
    set((state) => ({
      workouts: state.workouts.map((w) =>
        w.id === id ? { ...w, ...updates } : w,
      ),
    }));
  },

  deleteWorkout: (id: string) => {
    set((state) => ({
      workouts: state.workouts.filter((w) => w.id !== id),
    }));
  },

  addExerciseToWorkout: (workoutId: string, exerciseName: string) => {
    const newExercise: Exercise = {
      id: generateId(),
      name: exerciseName,
      reps: 0,
      numberOfSets: 1,
    };
    set((state) => ({
      workouts: state.workouts.map((w) =>
        w.id === workoutId
          ? { ...w, exercises: [...w.exercises, newExercise] }
          : w,
      ),
    }));
  },

  updateExercise: (
    workoutId: string,
    exerciseId: string,
    updates: Partial<Exercise>,
  ) => {
    set((state) => ({
      workouts: state.workouts.map((w) =>
        w.id === workoutId
          ? {
              ...w,
              exercises: w.exercises.map((e) =>
                e.id === exerciseId ? { ...e, ...updates } : e,
              ),
            }
          : w,
      ),
    }));
  },

  deleteExercise: (workoutId: string, exerciseId: string) => {
    set((state) => ({
      workouts: state.workouts.map((w) =>
        w.id === workoutId
          ? {
              ...w,
              exercises: w.exercises.filter((e) => e.id !== exerciseId),
            }
          : w,
      ),
    }));
  },

  getWorkoutById: (id: string) => {
    return get().workouts.find((w) => w.id === id);
  },
}));
