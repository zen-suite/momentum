import { act, renderHook } from '@testing-library/react-native';

import { workoutStorage } from '@/storage';
import { useWorkoutStore } from '@/store/workoutStore';
import { Workout } from '@/types/workout';

import { usePersistWorkouts } from './usePersistWorkouts';

jest.mock('@/storage', () => ({
  workoutStorage: {
    load: jest.fn(),
    save: jest.fn(),
  },
}));

const mockSave = workoutStorage.save as jest.Mock;

const mockWorkouts: Workout[] = [
  {
    id: 'w1',
    name: 'Push Day',
    exercises: [],
    createdAt: new Date(),
  },
];

beforeEach(() => {
  jest.clearAllMocks();
  useWorkoutStore.setState({ workouts: [], isLoaded: false });
  mockSave.mockResolvedValue(undefined);
});

describe('usePersistWorkouts', () => {
  it('does not save to storage before workouts are loaded', () => {
    renderHook(() => usePersistWorkouts());

    expect(mockSave).not.toHaveBeenCalled();
  });

  it('saves to storage when workouts change after load', () => {
    renderHook(() => usePersistWorkouts());

    act(() => {
      useWorkoutStore.setState({ workouts: mockWorkouts, isLoaded: true });
    });

    expect(mockSave).toHaveBeenCalledWith(mockWorkouts);
  });

  it('saves again when workouts are updated', () => {
    renderHook(() => usePersistWorkouts());

    act(() => {
      useWorkoutStore.setState({ workouts: mockWorkouts, isLoaded: true });
    });

    const updated: Workout[] = [{ ...mockWorkouts[0], name: 'Pull Day' }];
    act(() => {
      useWorkoutStore.setState({ workouts: updated });
    });

    expect(mockSave).toHaveBeenCalledTimes(2);
    expect(mockSave).toHaveBeenLastCalledWith(updated);
  });
});
