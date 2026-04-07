import { WorkoutLog } from '@/types/workout';

import { DbClient, insertWorkoutHistory } from './sqliteStorageShared';

function createDbClient(): DbClient & {
  runAsync: jest.Mock;
} {
  return {
    execAsync: jest.fn(),
    getAllAsync: jest.fn(),
    getFirstAsync: jest.fn(),
    runAsync: jest.fn().mockResolvedValue(undefined),
  };
}

function makeHistoryEntry(id: string, completionIso: string): WorkoutLog {
  return {
    id,
    workout: {
      id: 'workout-1',
      name: 'Push Day',
      exercises: [
        {
          id: 'exercise-1',
          name: 'Bench Press',
          reps: 8,
          numberOfSets: 3,
        },
      ],
      createdAt: new Date('2026-04-06T00:00:00.000Z'),
    },
    exercises: [
      {
        id: 'exercise-log-1',
        exercise: {
          id: 'exercise-1',
          name: 'Bench Press',
          reps: 8,
          numberOfSets: 3,
        },
        completedSets: 3,
        completedAt: new Date(completionIso),
      },
    ],
    completedAt: new Date(completionIso),
  };
}

describe('insertWorkoutHistory', () => {
  it('creates unique history exercise row ids when exercise log ids repeat', async () => {
    const db = createDbClient();
    const history: WorkoutLog[] = [
      makeHistoryEntry(
        'workout-1:2026-04-06T08:00:00.000Z',
        '2026-04-06T08:00:00.000Z',
      ),
      makeHistoryEntry(
        'workout-1:2026-04-06T18:30:00.000Z',
        '2026-04-06T18:30:00.000Z',
      ),
    ];

    await insertWorkoutHistory(db, history);

    const exerciseInsertCalls = db.runAsync.mock.calls.filter(
      ([sql]: [string]) =>
        typeof sql === 'string' &&
        sql.includes('INSERT INTO workout_history_exercises'),
    );

    const insertedExerciseRowIds = exerciseInsertCalls.map(
      ([, params]: [string, unknown[]]) => params[0],
    );

    expect(insertedExerciseRowIds).toEqual([
      'workout-1:2026-04-06T08:00:00.000Z:exercise-log-1',
      'workout-1:2026-04-06T18:30:00.000Z:exercise-log-1',
    ]);
  });
});
