import { WorkoutHistoryStorage } from '../WorkoutHistoryStorage';

import { WorkoutLog } from '@/types/workout';

import {
  WorkoutHistoryExerciseRow,
  WorkoutHistoryRow,
  getDatabase,
  insertWorkoutHistory,
  mapExerciseLog,
  runInTransaction,
  toDateOrUndefined,
  toUndefined,
} from './sqliteStorageShared';

export class SQLiteWorkoutHistoryStorage implements WorkoutHistoryStorage {
  async load(): Promise<WorkoutLog[]> {
    const db = await getDatabase();

    const historyRows = await db.getAllAsync<WorkoutHistoryRow>(
      `SELECT id,
              workout_id,
              workout_name,
              workout_description,
              workout_created_at,
              workout_completed_at,
              completed_at,
              position
       FROM workout_history
       ORDER BY position ASC;`,
    );

    const exerciseRows = await db.getAllAsync<WorkoutHistoryExerciseRow>(
      `SELECT id,
              history_id,
              exercise_id,
              exercise_name,
              reps,
              weight,
              number_of_sets,
              completed_sets,
              completed_at,
              position
       FROM workout_history_exercises
       ORDER BY history_id ASC, position ASC;`,
    );

    const exerciseRowsByHistoryId = new Map<
      string,
      WorkoutHistoryExerciseRow[]
    >();
    for (const row of exerciseRows) {
      const list = exerciseRowsByHistoryId.get(row.history_id) ?? [];
      list.push(row);
      exerciseRowsByHistoryId.set(row.history_id, list);
    }

    return historyRows.map((row) => {
      const historyExerciseRows = exerciseRowsByHistoryId.get(row.id) ?? [];
      const exercises = historyExerciseRows.map((exerciseRow) =>
        mapExerciseLog(exerciseRow),
      );

      return {
        id: row.id,
        workout: {
          id: row.workout_id,
          name: row.workout_name,
          description: toUndefined(row.workout_description),
          createdAt: new Date(row.workout_created_at),
          completedAt: toDateOrUndefined(row.workout_completed_at),
          exercises: exercises.map((exerciseLog) => exerciseLog.exercise),
        },
        exercises,
        completedAt: toDateOrUndefined(row.completed_at),
      };
    });
  }

  async save(history: WorkoutLog[]): Promise<void> {
    const db = await getDatabase();

    await runInTransaction(db, async () => {
      await db.execAsync(
        'DELETE FROM workout_history_exercises; DELETE FROM workout_history;',
      );
      await insertWorkoutHistory(db, history);
    });
  }
}
