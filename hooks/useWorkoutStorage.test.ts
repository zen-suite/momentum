import AsyncStorage from '@react-native-async-storage/async-storage';

import { loadWorkouts, saveWorkouts } from '@/hooks/useWorkoutStorage';
import { Workout } from '@/types/workout';

const mockWorkouts: Workout[] = [
  {
    id: '1',
    name: 'Leg Day',
    exercises: [
      {
        id: 'e1',
        name: 'Squat',
        sets: [{ id: 's1', reps: 10, weight: 80 }],
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

describe('loadWorkouts', () => {
  it('returns empty array when storage is empty', async () => {
    const result = await loadWorkouts();
    expect(result).toEqual([]);
  });

  it('loads and deserializes workouts from storage', async () => {
    await saveWorkouts(mockWorkouts);

    const result = await loadWorkouts();

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
    await saveWorkouts(mockWorkouts);

    const result = await loadWorkouts();

    expect(result[0].exercises).toHaveLength(1);
    expect(result[0].exercises[0].name).toBe('Squat');
    expect(result[0].exercises[0].sets[0].reps).toBe(10);
    expect(result[0].exercises[0].sets[0].weight).toBe(80);
  });
});

describe('saveWorkouts', () => {
  it('saves workouts to storage', async () => {
    await saveWorkouts(mockWorkouts);

    const raw = await AsyncStorage.getItem('workouts');
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed).toHaveLength(2);
    expect(parsed[0].name).toBe('Leg Day');
  });

  it('overwrites previous data', async () => {
    await saveWorkouts(mockWorkouts);
    await saveWorkouts([mockWorkouts[0]]);

    const result = await loadWorkouts();
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Leg Day');
  });

  it('saves an empty array', async () => {
    await saveWorkouts(mockWorkouts);
    await saveWorkouts([]);

    const result = await loadWorkouts();
    expect(result).toEqual([]);
  });
});
