import { act, renderHook } from '@testing-library/react-native';

import { workoutHistoryStorage } from '@/storage';
import { useWorkoutLogStore } from '@/store/workoutLogStore';
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
  createdAt: new Date(),
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
  completedAt: new Date(),
};

const logWithCompletedExercise: WorkoutLog = {
  id: 'log2',
  workout: { ...baseWorkout, id: 'w2' },
  exercises: [
    {
      id: 'e1',
      exercise: { id: 'ex1', name: 'Bench Press', reps: 8, numberOfSets: 3 },
      sets: [],
      completedAt: new Date(),
    },
  ],
  completedAt: undefined,
};

beforeEach(() => {
  jest.clearAllMocks();
  useWorkoutLogStore.setState({ workoutLogs: {}, isLoaded: false });
  mockLoad.mockResolvedValue([]);
  mockSave.mockResolvedValue(undefined);
});

describe('useSyncHistoryFromLogs', () => {
  it('does not write to storage when no logs have completions', () => {
    useWorkoutLogStore.setState({ workoutLogs: { log1: incompleteLog }, isLoaded: true });

    renderHook(() => useSyncHistoryFromLogs());

    expect(mockSave).not.toHaveBeenCalled();
  });

  it('writes to storage when a workout is completed', async () => {
    renderHook(() => useSyncHistoryFromLogs());

    await act(async () => {
      useWorkoutLogStore.setState({
        workoutLogs: { log1: completedWorkoutLog },
        isLoaded: true,
      });
    });

    expect(mockSave).toHaveBeenCalledWith([completedWorkoutLog]);
  });

  it('writes to storage when an exercise is completed (partial workout)', async () => {
    renderHook(() => useSyncHistoryFromLogs());

    await act(async () => {
      useWorkoutLogStore.setState({
        workoutLogs: { log2: logWithCompletedExercise },
        isLoaded: true,
      });
    });

    expect(mockSave).toHaveBeenCalledWith([logWithCompletedExercise]);
  });

  it('upserts an existing entry with the same id', async () => {
    const existingHistory: WorkoutLog[] = [
      { ...completedWorkoutLog, exercises: [] },
    ];
    mockLoad.mockResolvedValue(existingHistory);

    const updatedLog: WorkoutLog = {
      ...completedWorkoutLog,
      exercises: [
        {
          id: 'e1',
          exercise: { id: 'ex1', name: 'Bench Press', reps: 8, numberOfSets: 3 },
          sets: [],
          completedAt: new Date(),
        },
      ],
    };

    renderHook(() => useSyncHistoryFromLogs());

    await act(async () => {
      useWorkoutLogStore.setState({
        workoutLogs: { log1: updatedLog },
        isLoaded: true,
      });
    });

    expect(mockSave).toHaveBeenCalledWith([updatedLog]);
  });

  it('does not write when no logs are in the store', () => {
    renderHook(() => useSyncHistoryFromLogs());

    expect(mockSave).not.toHaveBeenCalled();
  });
});
