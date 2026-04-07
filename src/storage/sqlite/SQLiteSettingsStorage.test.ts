import { SQLiteSettingsStorage } from './SQLiteSettingsStorage';
import {
  getDatabase,
  runSerializedWrite,
  upsertSettings,
} from './sqliteStorageShared';

import { DEFAULT_SETTINGS } from '@/utils/settings';

jest.mock('./sqliteStorageShared', () => ({
  getDatabase: jest.fn(),
  runSerializedWrite: jest.fn(async (work: () => Promise<void>) => work()),
  upsertSettings: jest.fn(async () => undefined),
}));

const db = {
  getFirstAsync: jest.fn(),
};

describe('SQLiteSettingsStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(getDatabase).mockResolvedValue(db as never);
  });

  it('loads notification settings from sqlite rows', async () => {
    db.getFirstAsync.mockResolvedValue({
      theme: 'dark',
      exercise_defaults_reps: 8,
      exercise_defaults_sets: 4,
      exercise_defaults_weight: 60,
      notifications_enabled: 1,
      notifications_workout_days: 5,
      notifications_break_days: 2,
      notifications_send_hour: 7,
      notifications_send_minute: 15,
      notifications_pattern_anchor_date: '2026-04-06',
    });

    const storage = new SQLiteSettingsStorage();
    const result = await storage.load();

    expect(result).toEqual({
      theme: 'dark',
      exerciseDefaults: {
        reps: 8,
        sets: 4,
        weight: 60,
      },
      notifications: {
        enabled: true,
        workoutDays: 5,
        breakDays: 2,
        sendHour: 7,
        sendMinute: 15,
        patternAnchorDate: '2026-04-06',
      },
    });
  });

  it('saves notification settings through the shared sqlite writer', async () => {
    const storage = new SQLiteSettingsStorage();
    const settings = {
      ...DEFAULT_SETTINGS,
      notifications: {
        ...DEFAULT_SETTINGS.notifications,
        enabled: true,
        patternAnchorDate: '2026-04-06',
      },
    };

    await storage.save(settings);

    expect(runSerializedWrite).toHaveBeenCalledTimes(1);
    expect(upsertSettings).toHaveBeenCalledWith(db, settings);
  });
});
