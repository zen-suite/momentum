import { SettingsStorage } from '../SettingsStorage';

import { AppSettings } from '@/types/settings-types';
import { normalizeSettings } from '@/utils/settings';

import {
  SettingsRow,
  getDatabase,
  runSerializedWrite,
  upsertSettings,
} from './sqliteStorageShared';

export class SQLiteSettingsStorage implements SettingsStorage {
  async load(): Promise<AppSettings | null> {
    const db = await getDatabase();

    const row = await db.getFirstAsync<SettingsRow>(
      `SELECT
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
      FROM app_settings
      WHERE id = 1;`,
    );

    if (!row) {
      return null;
    }

    return normalizeSettings({
      theme: row.theme,
      exerciseDefaults: {
        reps: row.exercise_defaults_reps,
        sets: row.exercise_defaults_sets,
        weight: row.exercise_defaults_weight ?? undefined,
      },
      notifications: {
        enabled: row.notifications_enabled === 1,
        workoutDays: row.notifications_workout_days,
        breakDays: row.notifications_break_days,
        sendHour: row.notifications_send_hour,
        sendMinute: row.notifications_send_minute,
        patternAnchorDate: row.notifications_pattern_anchor_date,
      },
    });
  }

  async save(settings: AppSettings): Promise<void> {
    const db = await getDatabase();
    await runSerializedWrite(() => upsertSettings(db, settings));
  }
}
