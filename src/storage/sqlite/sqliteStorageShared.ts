import * as SQLite from 'expo-sqlite';

import { AppSettings } from '@/types/settings-types';
import { Exercise, ExerciseLog, Workout, WorkoutLog } from '@/types/workout';
import { DEFAULT_NOTIFICATION_SETTINGS } from '@/utils/settings';

const DATABASE_NAME = 'momentum.db';
const DATABASE_VERSION = 2;

export type DbClient = Pick<
  SQLite.SQLiteDatabase,
  'execAsync' | 'getAllAsync' | 'getFirstAsync' | 'runAsync'
>;

export type WorkoutRow = {
  id: string;
  name: string;
  description: string | null;
  position: number;
  created_at: string;
  completed_at: string | null;
};

export type ExerciseRow = {
  id: string;
  workout_id: string;
  name: string;
  reps: number;
  weight: number | null;
  number_of_sets: number;
  position: number;
};

export type WorkoutLogRow = {
  id: string;
  workout_id: string;
  workout_name: string;
  workout_description: string | null;
  workout_created_at: string;
  workout_completed_at: string | null;
  completed_at: string | null;
  position: number;
};

export type WorkoutLogExerciseRow = {
  id: string;
  log_id: string;
  exercise_id: string;
  exercise_name: string;
  reps: number;
  weight: number | null;
  number_of_sets: number;
  completed_sets: number;
  completed_at: string | null;
  position: number;
};

export type WorkoutHistoryRow = {
  id: string;
  workout_id: string;
  workout_name: string;
  workout_description: string | null;
  workout_created_at: string;
  workout_completed_at: string | null;
  completed_at: string | null;
  position: number;
};

export type WorkoutHistoryExerciseRow = {
  id: string;
  history_id: string;
  exercise_id: string;
  exercise_name: string;
  reps: number;
  weight: number | null;
  number_of_sets: number;
  completed_sets: number;
  completed_at: string | null;
  position: number;
};

export type SettingsRow = {
  theme: AppSettings['theme'];
  exercise_defaults_reps: number;
  exercise_defaults_sets: number;
  exercise_defaults_weight: number | null;
  notifications_enabled: number;
  notifications_workout_days: number;
  notifications_break_days: number;
  notifications_send_hour: number;
  notifications_send_minute: number;
  notifications_pattern_anchor_date: string | null;
};

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;
let transactionQueue: Promise<void> = Promise.resolve();

function serializeWrite<T>(work: () => Promise<T>): Promise<T> {
  const queuedWork = transactionQueue.then(work);
  transactionQueue = queuedWork.then(() => undefined).catch(() => undefined);
  return queuedWork;
}

export function toIsoOrNull(date?: Date): string | null {
  return date ? date.toISOString() : null;
}

export function toDateOrUndefined(value: string | null): Date | undefined {
  return value ? new Date(value) : undefined;
}

export function toUndefined(value: string | null): string | undefined {
  return value ?? undefined;
}

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(DATABASE_NAME);
  }

  return dbPromise;
}

export async function runInTransaction(
  db: DbClient,
  work: () => Promise<void>,
): Promise<void> {
  return serializeWrite(async () => {
    await db.execAsync('BEGIN IMMEDIATE;');

    try {
      await work();
      await db.execAsync('COMMIT;');
    } catch (error) {
      try {
        await db.execAsync('ROLLBACK;');
      } catch {
        // Ignore rollback failures to preserve original error context.
      }

      throw error;
    }
  });
}

export async function runSerializedWrite<T>(
  work: () => Promise<T>,
): Promise<T> {
  return serializeWrite(work);
}

async function createSchemaV1(db: DbClient): Promise<void> {
  await db.execAsync(`
    PRAGMA foreign_keys = ON;
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS workouts (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      position INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      completed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS exercises (
      id TEXT PRIMARY KEY NOT NULL,
      workout_id TEXT NOT NULL,
      name TEXT NOT NULL,
      reps INTEGER NOT NULL,
      weight REAL,
      number_of_sets INTEGER NOT NULL,
      position INTEGER NOT NULL,
      FOREIGN KEY(workout_id) REFERENCES workouts(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_exercises_workout_position
      ON exercises(workout_id, position);

    CREATE TABLE IF NOT EXISTS workout_logs (
      id TEXT PRIMARY KEY NOT NULL,
      workout_id TEXT NOT NULL,
      workout_name TEXT NOT NULL,
      workout_description TEXT,
      workout_created_at TEXT NOT NULL,
      workout_completed_at TEXT,
      completed_at TEXT,
      position INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS workout_log_exercises (
      id TEXT PRIMARY KEY NOT NULL,
      log_id TEXT NOT NULL,
      exercise_id TEXT NOT NULL,
      exercise_name TEXT NOT NULL,
      reps INTEGER NOT NULL,
      weight REAL,
      number_of_sets INTEGER NOT NULL,
      completed_sets INTEGER NOT NULL,
      completed_at TEXT,
      position INTEGER NOT NULL,
      FOREIGN KEY(log_id) REFERENCES workout_logs(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_workout_log_exercises_log_position
      ON workout_log_exercises(log_id, position);

    CREATE TABLE IF NOT EXISTS workout_history (
      id TEXT PRIMARY KEY NOT NULL,
      workout_id TEXT NOT NULL,
      workout_name TEXT NOT NULL,
      workout_description TEXT,
      workout_created_at TEXT NOT NULL,
      workout_completed_at TEXT,
      completed_at TEXT,
      position INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS workout_history_exercises (
      id TEXT PRIMARY KEY NOT NULL,
      history_id TEXT NOT NULL,
      exercise_id TEXT NOT NULL,
      exercise_name TEXT NOT NULL,
      reps INTEGER NOT NULL,
      weight REAL,
      number_of_sets INTEGER NOT NULL,
      completed_sets INTEGER NOT NULL,
      completed_at TEXT,
      position INTEGER NOT NULL,
      FOREIGN KEY(history_id) REFERENCES workout_history(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_workout_history_exercises_history_position
      ON workout_history_exercises(history_id, position);

    CREATE TABLE IF NOT EXISTS app_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      theme TEXT NOT NULL,
      exercise_defaults_reps INTEGER NOT NULL,
      exercise_defaults_sets INTEGER NOT NULL,
      exercise_defaults_weight REAL
    );

  `);
}

async function migrateSchemaV2(db: DbClient): Promise<void> {
  await db.execAsync(`
    ALTER TABLE app_settings
      ADD COLUMN notifications_enabled INTEGER NOT NULL DEFAULT 0;

    ALTER TABLE app_settings
      ADD COLUMN notifications_workout_days INTEGER NOT NULL DEFAULT 3;

    ALTER TABLE app_settings
      ADD COLUMN notifications_break_days INTEGER NOT NULL DEFAULT 1;

    ALTER TABLE app_settings
      ADD COLUMN notifications_send_hour INTEGER NOT NULL DEFAULT 19;

    ALTER TABLE app_settings
      ADD COLUMN notifications_send_minute INTEGER NOT NULL DEFAULT 0;

    ALTER TABLE app_settings
      ADD COLUMN notifications_pattern_anchor_date TEXT;
  `);
}

export async function initializeSchema(db: DbClient): Promise<void> {
  const versionRow = await db.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version;',
  );

  const currentVersion = versionRow?.user_version ?? 0;
  if (currentVersion >= DATABASE_VERSION) {
    await db.execAsync('PRAGMA foreign_keys = ON;');
    return;
  }

  if (currentVersion === 0) {
    await createSchemaV1(db);
  }

  if (currentVersion < 2) {
    await migrateSchemaV2(db);
  }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION};`);
}

export async function clearSqliteData(db: DbClient): Promise<void> {
  await db.execAsync(`
    DELETE FROM exercises;
    DELETE FROM workouts;
    DELETE FROM workout_log_exercises;
    DELETE FROM workout_logs;
    DELETE FROM workout_history_exercises;
    DELETE FROM workout_history;
    DELETE FROM app_settings;
  `);
}

export async function insertWorkouts(
  db: DbClient,
  workouts: Workout[],
): Promise<void> {
  for (const [workoutPosition, workout] of workouts.entries()) {
    await db.runAsync(
      `INSERT INTO workouts (
        id,
        name,
        description,
        position,
        created_at,
        completed_at
      ) VALUES (?, ?, ?, ?, ?, ?);`,
      [
        workout.id,
        workout.name,
        workout.description ?? null,
        workoutPosition,
        workout.createdAt.toISOString(),
        toIsoOrNull(workout.completedAt),
      ],
    );

    for (const [exercisePosition, exercise] of workout.exercises.entries()) {
      await db.runAsync(
        `INSERT INTO exercises (
          id,
          workout_id,
          name,
          reps,
          weight,
          number_of_sets,
          position
        ) VALUES (?, ?, ?, ?, ?, ?, ?);`,
        [
          exercise.id,
          workout.id,
          exercise.name,
          exercise.reps,
          exercise.weight ?? null,
          exercise.numberOfSets,
          exercisePosition,
        ],
      );
    }
  }
}

export async function insertWorkoutLogs(
  db: DbClient,
  logs: Record<string, WorkoutLog>,
): Promise<void> {
  for (const [position, [workoutId, log]] of Object.entries(logs).entries()) {
    await db.runAsync(
      `INSERT INTO workout_logs (
        id,
        workout_id,
        workout_name,
        workout_description,
        workout_created_at,
        workout_completed_at,
        completed_at,
        position
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        log.id,
        workoutId,
        log.workout.name,
        log.workout.description ?? null,
        log.workout.createdAt.toISOString(),
        toIsoOrNull(log.workout.completedAt),
        toIsoOrNull(log.completedAt),
        position,
      ],
    );

    for (const [exercisePosition, exerciseLog] of log.exercises.entries()) {
      await db.runAsync(
        `INSERT INTO workout_log_exercises (
          id,
          log_id,
          exercise_id,
          exercise_name,
          reps,
          weight,
          number_of_sets,
          completed_sets,
          completed_at,
          position
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          exerciseLog.id,
          log.id,
          exerciseLog.exercise.id,
          exerciseLog.exercise.name,
          exerciseLog.exercise.reps,
          exerciseLog.exercise.weight ?? null,
          exerciseLog.exercise.numberOfSets,
          exerciseLog.completedSets,
          toIsoOrNull(exerciseLog.completedAt),
          exercisePosition,
        ],
      );
    }
  }
}

export async function insertWorkoutHistory(
  db: DbClient,
  history: WorkoutLog[],
): Promise<void> {
  for (const [historyPosition, entry] of history.entries()) {
    await db.runAsync(
      `INSERT INTO workout_history (
        id,
        workout_id,
        workout_name,
        workout_description,
        workout_created_at,
        workout_completed_at,
        completed_at,
        position
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        entry.id,
        entry.workout.id,
        entry.workout.name,
        entry.workout.description ?? null,
        entry.workout.createdAt.toISOString(),
        toIsoOrNull(entry.workout.completedAt),
        toIsoOrNull(entry.completedAt),
        historyPosition,
      ],
    );

    for (const [exercisePosition, exerciseLog] of entry.exercises.entries()) {
      const historyExerciseId = `${entry.id}:${exerciseLog.id}`;
      await db.runAsync(
        `INSERT INTO workout_history_exercises (
          id,
          history_id,
          exercise_id,
          exercise_name,
          reps,
          weight,
          number_of_sets,
          completed_sets,
          completed_at,
          position
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          historyExerciseId,
          entry.id,
          exerciseLog.exercise.id,
          exerciseLog.exercise.name,
          exerciseLog.exercise.reps,
          exerciseLog.exercise.weight ?? null,
          exerciseLog.exercise.numberOfSets,
          exerciseLog.completedSets,
          toIsoOrNull(exerciseLog.completedAt),
          exercisePosition,
        ],
      );
    }
  }
}

export async function upsertSettings(
  db: DbClient,
  settings: AppSettings | null,
): Promise<void> {
  if (!settings) {
    return;
  }

  await db.runAsync(
    `INSERT OR REPLACE INTO app_settings (
      id,
      theme,
      exercise_defaults_reps,
      exercise_defaults_sets,
      exercise_defaults_weight,
      notifications_enabled,
      notifications_workout_days,
      notifications_break_days,
      notifications_send_hour,
      notifications_send_minute,
      notifications_pattern_anchor_date
    ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      settings.theme,
      settings.exerciseDefaults.reps,
      settings.exerciseDefaults.sets,
      settings.exerciseDefaults.weight ?? null,
      settings.notifications.enabled ? 1 : 0,
      settings.notifications.workoutDays,
      settings.notifications.breakDays,
      settings.notifications.sendHour,
      settings.notifications.sendMinute,
      settings.notifications.patternAnchorDate ??
        DEFAULT_NOTIFICATION_SETTINGS.patternAnchorDate,
    ],
  );
}

export function mapExercise(row: {
  id: string;
  name: string;
  reps: number;
  weight: number | null;
  number_of_sets: number;
}): Exercise {
  return {
    id: row.id,
    name: row.name,
    reps: row.reps,
    weight: row.weight ?? undefined,
    numberOfSets: row.number_of_sets,
  };
}

export function mapExerciseLog(row: {
  id: string;
  exercise_id: string;
  exercise_name: string;
  reps: number;
  weight: number | null;
  number_of_sets: number;
  completed_sets: number;
  completed_at: string | null;
}): ExerciseLog {
  return {
    id: row.id,
    exercise: {
      id: row.exercise_id,
      name: row.exercise_name,
      reps: row.reps,
      weight: row.weight ?? undefined,
      numberOfSets: row.number_of_sets,
    },
    completedSets: row.completed_sets,
    completedAt: toDateOrUndefined(row.completed_at),
  };
}
