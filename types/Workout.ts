export interface ExerciseSet {
  id: string;
  reps: number;
  weight?: number; // in kg, optional
}

export interface Exercise {
  id: string;
  name: string;
  sets: ExerciseSet[];
}

export interface Workout {
  id: string;
  name: string;
  exercises: Exercise[];
  createdAt: Date;
  completedAt?: Date;
}
