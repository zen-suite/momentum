import AsyncStorage from '@react-native-async-storage/async-storage';

import { Workout } from '@/types/workout';

import { AsyncStorageWorkout } from './AsyncStorageWorkout';

const storage = new AsyncStorageWorkout();

const mockWorkouts: Workout[] = [
  {
    id: '1',
    name: 'Leg Day',
    exercises: [
      {
        id: 'e1',
        name: 'Squat',
        reps: 10,
        weight: 80,
        numberOfSets: 3,
      },
    ],
    createdAt: new Date('2024-01-01T10:00:00.000Z'),
  },
  {
    id: '2',
    name: 'Push Day',
    exercises: [],
    createdAt: new Date('2024-01-02T10:00:00.000Z'),
    completedAt: new Date('2024-01-02T11:00:00.000Z'),
  },
];

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('AsyncStorageWorkout.load', () => {
  it('returns empty array when storage is empty', async () => {
    const result = await storage.load();
    expect(result).toEqual([]);
  });

  it('loads and deserializes workouts from storage', async () => {
    await storage.save(mockWorkouts);

    const result = await storage.load();

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('1');
    expect(result[0].name).toBe('Leg Day');
    expect(result[0].createdAt).toBeInstanceOf(Date);
    expect(result[0].createdAt.toISOString()).toBe('2024-01-01T10:00:00.000Z');
    expect(result[0].completedAt).toBeUndefined();
    expect(result[1].completedAt).toBeInstanceOf(Date);
    expect(result[1].completedAt!.toISOString()).toBe(
      '2024-01-02T11:00:00.000Z',
    );
  });

  it('preserves exercises and sets when loading', async () => {
    await storage.save(mockWorkouts);

    const result = await storage.load();

    expect(result[0].exercises).toHaveLength(1);
    expect(result[0].exercises[0].name).toBe('Squat');
    expect(result[0].exercises[0].reps).toBe(10);
    expect(result[0].exercises[0].weight).toBe(80);
    expect(result[0].exercises[0].numberOfSets).toBe(3);
  });
});

describe('AsyncStorageWorkout.save', () => {
  it('saves workouts to storage', async () => {
    await storage.save(mockWorkouts);

    const raw = await AsyncStorage.getItem('workouts');
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed).toHaveLength(2);
    expect(parsed[0].name).toBe('Leg Day');
  });

  it('overwrites previous data', async () => {
    await storage.save(mockWorkouts);
    await storage.save([mockWorkouts[0]]);

    const result = await storage.load();
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Leg Day');
  });

  it('saves an empty array', async () => {
    await storage.save(mockWorkouts);
    await storage.save([]);

    const result = await storage.load();
    expect(result).toEqual([]);
  });
});
