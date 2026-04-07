import { WorkoutLogStorage } from '../WorkoutLogStorage';

import { WorkoutLog } from '@/types/workout';

import {
  WorkoutLogExerciseRow,
  WorkoutLogRow,
  getDatabase,
  insertWorkoutLogs,
  mapExerciseLog,
  runInTransaction,
  toDateOrUndefined,
  toUndefined,
} from './sqliteStorageShared';

export class SQLiteWorkoutLogStorage implements WorkoutLogStorage {
  async load(): Promise<Record<string, WorkoutLog>> {
    const db = await getDatabase();

    const logRows = await db.getAllAsync<WorkoutLogRow>(
      `SELECT id,
              workout_id,
              workout_name,
              workout_description,
              workout_created_at,
              workout_completed_at,
              completed_at,
              position
       FROM workout_logs
       ORDER BY position ASC;`,
    );

    const exerciseRows = await db.getAllAsync<WorkoutLogExerciseRow>(
      `SELECT id,
              log_id,
              exercise_id,
              exercise_name,
              reps,
              weight,
              number_of_sets,
              completed_sets,
              completed_at,
              position
       FROM workout_log_exercises
       ORDER BY log_id ASC, position ASC;`,
    );

    const exerciseRowsByLogId = new Map<string, WorkoutLogExerciseRow[]>();
    for (const row of exerciseRows) {
      const list = exerciseRowsByLogId.get(row.log_id) ?? [];
      list.push(row);
      exerciseRowsByLogId.set(row.log_id, list);
    }

    const logs: Record<string, WorkoutLog> = {};
    for (const row of logRows) {
      const logExerciseRows = exerciseRowsByLogId.get(row.id) ?? [];
      const exercises = logExerciseRows.map((exerciseRow) =>
        mapExerciseLog(exerciseRow),
      );

      logs[row.workout_id] = {
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
    }

    return logs;
  }

  async save(logs: Record<string, WorkoutLog>): Promise<void> {
    const db = await getDatabase();

    await runInTransaction(db, async () => {
      await db.execAsync(
        'DELETE FROM workout_log_exercises; DELETE FROM workout_logs;',
      );
      await insertWorkoutLogs(db, logs);
    });
  }
}
