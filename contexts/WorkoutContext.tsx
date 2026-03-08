import { Exercise, ExerciseSet, Workout } from '@/types/workout';
import React, { createContext, useCallback, useContext, useState } from 'react';

let _nextId = 0;
const generateId = () => `${Date.now()}-${++_nextId}`;

interface WorkoutContextType {
  workouts: Workout[];
  addWorkout: (name: string) => Workout;
  updateWorkout: (id: string, workout: Partial<Workout>) => void;
  deleteWorkout: (id: string) => void;
  addExerciseToWorkout: (workoutId: string, exerciseName: string) => void;
  updateExercise: (
    workoutId: string,
    exerciseId: string,
    exercise: Partial<Exercise>,
  ) => void;
  deleteExercise: (workoutId: string, exerciseId: string) => void;
  addSetToExercise: (workoutId: string, exerciseId: string) => void;
  updateSet: (
    workoutId: string,
    exerciseId: string,
    setId: string,
    set: Partial<ExerciseSet>,
  ) => void;
  deleteSet: (workoutId: string, exerciseId: string, setId: string) => void;
  getWorkoutById: (id: string) => Workout | undefined;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export function WorkoutProvider({ children }: { children: React.ReactNode }) {
  const [workouts, setWorkouts] = useState<Workout[]>([]);

  const addWorkout = useCallback((name: string): Workout => {
    const newWorkout: Workout = {
      id: generateId(),
      name,
      exercises: [],
      createdAt: new Date(),
    };
    setWorkouts((prev) => [...prev, newWorkout]);
    return newWorkout;
  }, []);

  const updateWorkout = useCallback((id: string, updates: Partial<Workout>) => {
    setWorkouts((prev) =>
      prev.map((workout) =>
        workout.id === id ? { ...workout, ...updates } : workout,
      ),
    );
  }, []);

  const deleteWorkout = useCallback((id: string) => {
    setWorkouts((prev) => prev.filter((workout) => workout.id !== id));
  }, []);

  const addExerciseToWorkout = useCallback(
    (workoutId: string, exerciseName: string) => {
      const newExercise: Exercise = {
        id: generateId(),
        name: exerciseName,
        sets: [],
      };
      setWorkouts((prev) =>
        prev.map((workout) =>
          workout.id === workoutId
            ? { ...workout, exercises: [...workout.exercises, newExercise] }
            : workout,
        ),
      );
    },
    [],
  );

  const updateExercise = useCallback(
    (workoutId: string, exerciseId: string, updates: Partial<Exercise>) => {
      setWorkouts((prev) =>
        prev.map((workout) =>
          workout.id === workoutId
            ? {
                ...workout,
                exercises: workout.exercises.map((exercise) =>
                  exercise.id === exerciseId
                    ? { ...exercise, ...updates }
                    : exercise,
                ),
              }
            : workout,
        ),
      );
    },
    [],
  );

  const deleteExercise = useCallback(
    (workoutId: string, exerciseId: string) => {
      setWorkouts((prev) =>
        prev.map((workout) =>
          workout.id === workoutId
            ? {
                ...workout,
                exercises: workout.exercises.filter(
                  (exercise) => exercise.id !== exerciseId,
                ),
              }
            : workout,
        ),
      );
    },
    [],
  );

  const addSetToExercise = useCallback(
    (workoutId: string, exerciseId: string) => {
      const newSet: ExerciseSet = {
        id: generateId(),
        reps: 0,
      };
      setWorkouts((prev) =>
        prev.map((workout) =>
          workout.id === workoutId
            ? {
                ...workout,
                exercises: workout.exercises.map((exercise) =>
                  exercise.id === exerciseId
                    ? { ...exercise, sets: [...exercise.sets, newSet] }
                    : exercise,
                ),
              }
            : workout,
        ),
      );
    },
    [],
  );

  const updateSet = useCallback(
    (
      workoutId: string,
      exerciseId: string,
      setId: string,
      updates: Partial<ExerciseSet>,
    ) => {
      setWorkouts((prev) =>
        prev.map((workout) =>
          workout.id === workoutId
            ? {
                ...workout,
                exercises: workout.exercises.map((exercise) =>
                  exercise.id === exerciseId
                    ? {
                        ...exercise,
                        sets: exercise.sets.map((set) =>
                          set.id === setId ? { ...set, ...updates } : set,
                        ),
                      }
                    : exercise,
                ),
              }
            : workout,
        ),
      );
    },
    [],
  );

  const deleteSet = useCallback(
    (workoutId: string, exerciseId: string, setId: string) => {
      setWorkouts((prev) =>
        prev.map((workout) =>
          workout.id === workoutId
            ? {
                ...workout,
                exercises: workout.exercises.map((exercise) =>
                  exercise.id === exerciseId
                    ? {
                        ...exercise,
                        sets: exercise.sets.filter((set) => set.id !== setId),
                      }
                    : exercise,
                ),
              }
            : workout,
        ),
      );
    },
    [],
  );

  const getWorkoutById = useCallback(
    (id: string) => {
      return workouts.find((workout) => workout.id === id);
    },
    [workouts],
  );

  const value: WorkoutContextType = {
    workouts,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    addExerciseToWorkout,
    updateExercise,
    deleteExercise,
    addSetToExercise,
    updateSet,
    deleteSet,
    getWorkoutById,
  };

  return (
    <WorkoutContext.Provider value={value}>{children}</WorkoutContext.Provider>
  );
}

export function useWorkouts() {
  const context = useContext(WorkoutContext);
  if (context === undefined) {
    throw new Error('useWorkouts must be used within a WorkoutProvider');
  }
  return context;
}
