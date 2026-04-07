import { Exercise, Workout } from '@/types/workout';

import { WorkoutStorage } from '../WorkoutStorage';

import {
  ExerciseRow,
  WorkoutRow,
  getDatabase,
  insertWorkouts,
  mapExercise,
  runInTransaction,
  toDateOrUndefined,
  toUndefined,
} from './sqliteStorageShared';

export class SQLiteWorkoutStorage implements WorkoutStorage {
  async load(): Promise<Workout[]> {
    const db = await getDatabase();

    const workouts = await db.getAllAsync<WorkoutRow>(
      `SELECT id, name, description, position, created_at, completed_at
       FROM workouts
       ORDER BY position ASC;`,
    );

    const exercises = await db.getAllAsync<ExerciseRow>(
      `SELECT id, workout_id, name, reps, weight, number_of_sets, position
       FROM exercises
       ORDER BY workout_id ASC, position ASC;`,
    );

    const exercisesByWorkoutId = new Map<string, Exercise[]>();
    for (const row of exercises) {
      const list = exercisesByWorkoutId.get(row.workout_id) ?? [];
      list.push(mapExercise(row));
      exercisesByWorkoutId.set(row.workout_id, list);
    }

    return workouts.map((row) => ({
      id: row.id,
      name: row.name,
      description: toUndefined(row.description),
      exercises: exercisesByWorkoutId.get(row.id) ?? [],
      createdAt: new Date(row.created_at),
      completedAt: toDateOrUndefined(row.completed_at),
    }));
  }

  async save(workouts: Workout[]): Promise<void> {
    const db = await getDatabase();

    await runInTransaction(db, async () => {
      await db.execAsync('DELETE FROM exercises; DELETE FROM workouts;');
      await insertWorkouts(db, workouts);
    });
  }
}
