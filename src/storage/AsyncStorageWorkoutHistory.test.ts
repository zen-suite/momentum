import AsyncStorage from '@react-native-async-storage/async-storage';

import { WorkoutLog } from '@/types/workout';

import { AsyncStorageWorkoutHistory } from './AsyncStorageWorkoutHistory';

const storage = new AsyncStorageWorkoutHistory();

const mockLogs: WorkoutLog[] = [
  {
    id: 'log1',
    workout: {
      id: 'w1',
      name: 'Push Day',
      exercises: [],
      createdAt: new Date('2024-01-01T10:00:00.000Z'),
    },
    exercises: [
      {
        id: 'e1',
        exercise: { id: 'ex1', name: 'Bench Press', reps: 8, numberOfSets: 3 },
        sets: [],
        completedAt: new Date('2024-01-01T10:30:00.000Z'),
      },
    ],
    completedAt: new Date('2024-01-01T11:00:00.000Z'),
  },
  {
    id: 'log2',
    workout: {
      id: 'w2',
      name: 'Leg Day',
      exercises: [],
      createdAt: new Date('2024-01-02T10:00:00.000Z'),
      completedAt: new Date('2024-01-02T11:00:00.000Z'),
    },
    exercises: [],
    completedAt: undefined,
  },
];

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('AsyncStorageWorkoutHistory.load', () => {
  it('returns empty array when storage is empty', async () => {
    const result = await storage.load();
    expect(result).toEqual([]);
  });

  it('loads and deserializes workout logs from storage', async () => {
    await storage.save(mockLogs);

    const result = await storage.load();

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('log1');
    expect(result[0].completedAt).toBeInstanceOf(Date);
    expect(result[0].completedAt!.toISOString()).toBe('2024-01-01T11:00:00.000Z');
    expect(result[1].completedAt).toBeUndefined();
  });

  it('deserializes workout createdAt and completedAt as Date instances', async () => {
    await storage.save(mockLogs);

    const result = await storage.load();

    expect(result[0].workout.createdAt).toBeInstanceOf(Date);
    expect(result[0].workout.createdAt.toISOString()).toBe('2024-01-01T10:00:00.000Z');
    expect(result[0].workout.completedAt).toBeUndefined();
    expect(result[1].workout.completedAt).toBeInstanceOf(Date);
    expect(result[1].workout.completedAt!.toISOString()).toBe('2024-01-02T11:00:00.000Z');
  });

  it('deserializes exercise completedAt as Date instances', async () => {
    await storage.save(mockLogs);

    const result = await storage.load();

    expect(result[0].exercises[0].completedAt).toBeInstanceOf(Date);
    expect(result[0].exercises[0].completedAt!.toISOString()).toBe('2024-01-01T10:30:00.000Z');
  });
});

describe('AsyncStorageWorkoutHistory.save', () => {
  it('saves logs to storage under workoutHistory key', async () => {
    await storage.save(mockLogs);

    const raw = await AsyncStorage.getItem('workoutHistory');
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed).toHaveLength(2);
    expect(parsed[0].id).toBe('log1');
  });

  it('overwrites previous data', async () => {
    await storage.save(mockLogs);
    await storage.save([mockLogs[0]]);

    const result = await storage.load();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('log1');
  });

  it('saves an empty array', async () => {
    await storage.save(mockLogs);
    await storage.save([]);

    const result = await storage.load();
    expect(result).toEqual([]);
  });
});
