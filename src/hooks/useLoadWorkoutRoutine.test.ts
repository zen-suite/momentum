import { renderHook, waitFor } from '@testing-library/react-native';

import { workoutLogStorage } from '@/storage';
import { useWorkoutRoutineStore } from '@/store/workoutRoutineStore';
import { WorkoutLog } from '@/types/workout';

import { useLoadWorkoutRoutine } from './useLoadWorkoutRoutine';

jest.mock('@/storage', () => ({
  workoutLogStorage: {
    load: jest.fn(),
    save: jest.fn(),
  },
}));

const mockLoad = workoutLogStorage.load as jest.Mock;

const mockLogs: Record<string, WorkoutLog> = {
  w1: {
    id: 'w1',
    workout: {
      id: 'w1',
      name: 'Push Day',
      exercises: [],
      createdAt: new Date(),
    },
    exercises: [],
    completedAt: undefined,
  },
};

beforeEach(() => {
  jest.clearAllMocks();
  useWorkoutRoutineStore.setState({ workoutLogs: {}, isLoaded: false });
  mockLoad.mockResolvedValue(mockLogs);
});

describe('useLoadWorkoutRoutine', () => {
  it('loads workout logs from storage into the store', async () => {
    renderHook(() => useLoadWorkoutRoutine());

    await waitFor(() => {
      expect(useWorkoutRoutineStore.getState().workoutLogs).toEqual(mockLogs);
    });
  });

  it('sets isLoaded to true after loading', async () => {
    renderHook(() => useLoadWorkoutRoutine());

    await waitFor(() => {
      expect(useWorkoutRoutineStore.getState().isLoaded).toBe(true);
    });
  });

  it('calls workoutLogStorage.load once on mount', async () => {
    renderHook(() => useLoadWorkoutRoutine());

    await waitFor(() => {
      expect(mockLoad).toHaveBeenCalledTimes(1);
    });
  });
});
