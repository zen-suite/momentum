export interface Exercise {
  id: string;
  name: string;
  reps: number;
  weight?: number; // in kg, optional
  numberOfSets: number;
}

export interface Workout {
  id: string;
  name: string;
  exercises: Exercise[];
  createdAt: Date;
  completedAt?: Date;
}

export interface SetLog {
  setIndex: number; // 0-based index
  completedAt?: Date;
}

export interface ExerciseLog {
  id: string;
  exercise: Exercise;
  sets: SetLog[];
  completedAt?: Date; // set when all sets are done
}

export interface WorkoutLog {
  id: string;
  workout: Workout;
  exercises: ExerciseLog[];
  completedAt?: Date;
}
