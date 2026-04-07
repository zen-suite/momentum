import { act, renderHook } from '@testing-library/react-native';

import { workoutHistoryStorage } from '@/storage';
import { useWorkoutRoutineStore } from '@/store/workoutRoutineStore';
import { WorkoutLog } from '@/types/workout';

import { useSyncHistoryFromLogs } from './useSyncHistoryFromLogs';

jest.mock('@/storage', () => ({
  workoutHistoryStorage: {
    load: jest.fn(),
    save: jest.fn(),
  },
}));

const mockLoad = workoutHistoryStorage.load as jest.Mock;
const mockSave = workoutHistoryStorage.save as jest.Mock;

const baseWorkout = {
  id: 'w1',
  name: 'Push Day',
  exercises: [],
  createdAt: new Date('2026-04-01T00:00:00.000Z'),
};

const incompleteLog: WorkoutLog = {
  id: 'log1',
  workout: baseWorkout,
  exercises: [],
  completedAt: undefined,
};

const completedWorkoutLog: WorkoutLog = {
  id: 'log1',
  workout: baseWorkout,
  exercises: [],
  completedAt: new Date('2026-04-06T08:00:00.000Z'),
};

const logWithCompletedExercise: WorkoutLog = {
  id: 'log2',
  workout: { ...baseWorkout, id: 'w2', name: 'Pull Day' },
  exercises: [
    {
      id: 'e1',
      exercise: { id: 'ex1', name: 'Bench Press', reps: 8, numberOfSets: 3 },
      completedSets: 1,
      completedAt: new Date('2026-04-06T09:00:00.000Z'),
    },
  ],
  completedAt: undefined,
};

function getHistoryId(log: WorkoutLog): string {
  return `${log.workout.id}:${log.completedAt?.toISOString() ?? 'in-progress'}`;
}

let persistedHistory: WorkoutLog[] = [];

beforeEach(() => {
  jest.clearAllMocks();
  persistedHistory = [];
  useWorkoutRoutineStore.setState({ workoutLogs: {}, isLoaded: false });
  mockLoad.mockImplementation(async () => persistedHistory);
  mockSave.mockImplementation(async (history: WorkoutLog[]) => {
    persistedHistory = history;
  });
});

describe('useSyncHistoryFromLogs', () => {
  it('does not write to storage when no logs have completions', () => {
    useWorkoutRoutineStore.setState({
      workoutLogs: { log1: incompleteLog },
      isLoaded: true,
    });

    renderHook(() => useSyncHistoryFromLogs());

    expect(mockSave).not.toHaveBeenCalled();
  });

  it('writes to storage when a workout is completed', async () => {
    renderHook(() => useSyncHistoryFromLogs());

    await act(async () => {
      useWorkoutRoutineStore.setState({
        workoutLogs: { log1: completedWorkoutLog },
        isLoaded: true,
      });
    });

    expect(mockSave).toHaveBeenCalledTimes(1);
    expect(persistedHistory).toHaveLength(1);
    expect(persistedHistory[0].id).toBe(getHistoryId(completedWorkoutLog));
    expect(persistedHistory[0].completedAt).toEqual(
      completedWorkoutLog.completedAt,
    );
  });

  it('writes to storage when an exercise is completed (partial workout)', async () => {
    renderHook(() => useSyncHistoryFromLogs());

    await act(async () => {
      useWorkoutRoutineStore.setState({
        workoutLogs: { log2: logWithCompletedExercise },
        isLoaded: true,
      });
    });

    expect(mockSave).toHaveBeenCalledTimes(1);
    expect(persistedHistory).toHaveLength(1);
    expect(persistedHistory[0].id).toBe(getHistoryId(logWithCompletedExercise));
    expect(persistedHistory[0].completedAt).toBeUndefined();
  });

  it('upserts a completion with the same workout and completion timestamp', async () => {
    const initial: WorkoutLog = {
      ...completedWorkoutLog,
      exercises: [],
    };
    const updated: WorkoutLog = {
      ...completedWorkoutLog,
      exercises: [
        {
          id: 'e1',
          exercise: {
            id: 'ex1',
            name: 'Bench Press',
            reps: 8,
            numberOfSets: 3,
          },
          completedSets: 3,
          completedAt: new Date('2026-04-06T08:00:00.000Z'),
        },
      ],
    };

    renderHook(() => useSyncHistoryFromLogs());

    await act(async () => {
      useWorkoutRoutineStore.setState({
        workoutLogs: { log1: initial },
        isLoaded: true,
      });
    });

    await act(async () => {
      useWorkoutRoutineStore.setState({
        workoutLogs: { log1: updated },
        isLoaded: true,
      });
    });

    expect(persistedHistory).toHaveLength(1);
    expect(persistedHistory[0].id).toBe(getHistoryId(updated));
    expect(persistedHistory[0].exercises).toHaveLength(1);
  });

  it('appends a new history entry when the same workout is completed again later', async () => {
    const firstCompletion: WorkoutLog = {
      ...completedWorkoutLog,
      completedAt: new Date('2026-04-06T08:00:00.000Z'),
    };
    const secondCompletion: WorkoutLog = {
      ...completedWorkoutLog,
      completedAt: new Date('2026-04-06T18:30:00.000Z'),
    };

    renderHook(() => useSyncHistoryFromLogs());

    await act(async () => {
      useWorkoutRoutineStore.setState({
        workoutLogs: { log1: firstCompletion },
        isLoaded: true,
      });
    });

    await act(async () => {
      useWorkoutRoutineStore.setState({
        workoutLogs: { log1: secondCompletion },
        isLoaded: true,
      });
    });

    expect(persistedHistory).toHaveLength(2);
    expect(persistedHistory.map((entry) => entry.id)).toEqual(
      expect.arrayContaining([
        getHistoryId(firstCompletion),
        getHistoryId(secondCompletion),
      ]),
    );
  });

  it('does not write when no logs are in the store', () => {
    renderHook(() => useSyncHistoryFromLogs());

    expect(mockSave).not.toHaveBeenCalled();
  });
});
