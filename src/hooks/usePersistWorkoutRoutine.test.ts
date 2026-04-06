import { act, renderHook } from '@testing-library/react-native';

import { workoutLogStorage } from '@/storage';
import { useWorkoutRoutineStore } from '@/store/workoutRoutineStore';
import { WorkoutLog } from '@/types/workout';

import { usePersistWorkoutRoutine } from './usePersistWorkoutRoutine';

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
  useWorkoutRoutineStore.setState({ workoutLogs: {}, isLoaded: false });
  mockSave.mockResolvedValue(undefined);
});

describe('usePersistWorkoutRoutine', () => {
  it('does not save to storage before logs are loaded', () => {
    renderHook(() => usePersistWorkoutRoutine());

    expect(mockSave).not.toHaveBeenCalled();
  });

  it('saves to storage when logs change after load', () => {
    renderHook(() => usePersistWorkoutRoutine());

    act(() => {
      useWorkoutRoutineStore.setState({
        workoutLogs: mockLogs,
        isLoaded: true,
      });
    });

    expect(mockSave).toHaveBeenCalledWith(mockLogs);
  });

  it('saves again when logs are updated', () => {
    renderHook(() => usePersistWorkoutRoutine());

    act(() => {
      useWorkoutRoutineStore.setState({
        workoutLogs: mockLogs,
        isLoaded: true,
      });
    });

    const updated: Record<string, WorkoutLog> = {
      ...mockLogs,
      w1: { ...mockLogs.w1, completedAt: new Date() },
    };
    act(() => {
      useWorkoutRoutineStore.setState({ workoutLogs: updated });
    });

    expect(mockSave).toHaveBeenCalledTimes(2);
    expect(mockSave).toHaveBeenLastCalledWith(updated);
  });

  it('logs an error when persisting workout routine logs fails', async () => {
    const error = new Error('save failed');
    mockSave.mockRejectedValue(error);
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    renderHook(() => usePersistWorkoutRoutine());

    await act(async () => {
      useWorkoutRoutineStore.setState({
        workoutLogs: mockLogs,
        isLoaded: true,
      });
      await Promise.resolve();
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[storage] Failed to persist workout routine logs.',
      error,
    );

    consoleErrorSpy.mockRestore();
  });
});
