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
