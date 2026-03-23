import { act, renderHook } from '@testing-library/react-native';

import { workoutLogStorage } from '@/storage';
import { useWorkoutLogStore } from '@/store/workoutLogStore';
import { WorkoutLog } from '@/types/workout';

import { usePersistWorkoutLogs } from './usePersistWorkoutLogs';

jest.mock('@/storage', () => ({
  workoutLogStorage: {
    load: jest.fn(),
    save: jest.fn(),
  },
}));

const mockSave = workoutLogStorage.save as jest.Mock;

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
  useWorkoutLogStore.setState({ workoutLogs: {}, isLoaded: false });
  mockSave.mockResolvedValue(undefined);
});

describe('usePersistWorkoutLogs', () => {
  it('does not save to storage before logs are loaded', () => {
    renderHook(() => usePersistWorkoutLogs());

    expect(mockSave).not.toHaveBeenCalled();
  });

  it('saves to storage when logs change after load', () => {
    renderHook(() => usePersistWorkoutLogs());

    act(() => {
      useWorkoutLogStore.setState({ workoutLogs: mockLogs, isLoaded: true });
    });

    expect(mockSave).toHaveBeenCalledWith(mockLogs);
  });

  it('saves again when logs are updated', () => {
    renderHook(() => usePersistWorkoutLogs());

    act(() => {
      useWorkoutLogStore.setState({ workoutLogs: mockLogs, isLoaded: true });
    });

    const updated: Record<string, WorkoutLog> = {
      ...mockLogs,
      w1: { ...mockLogs.w1, completedAt: new Date() },
    };
    act(() => {
      useWorkoutLogStore.setState({ workoutLogs: updated });
    });

    expect(mockSave).toHaveBeenCalledTimes(2);
    expect(mockSave).toHaveBeenLastCalledWith(updated);
  });
});
