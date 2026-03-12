import { renderHook, waitFor } from '@testing-library/react-native';

import { workoutStorage } from '@/storage';
import { useWorkoutStore } from '@/store/workoutStore';
import { Workout } from '@/types/workout';

import { useLoadWorkouts } from './useLoadWorkouts';

jest.mock('@/storage', () => ({
  workoutStorage: {
    load: jest.fn(),
    save: jest.fn(),
  },
}));

const mockLoad = workoutStorage.load as jest.Mock;

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
  mockLoad.mockResolvedValue(mockWorkouts);
});

describe('useLoadWorkouts', () => {
  it('loads workouts from storage into the store', async () => {
    renderHook(() => useLoadWorkouts());

    await waitFor(() => {
      expect(useWorkoutStore.getState().workouts).toEqual(mockWorkouts);
    });
  });

  it('sets isLoaded to true after loading', async () => {
    renderHook(() => useLoadWorkouts());

    await waitFor(() => {
      expect(useWorkoutStore.getState().isLoaded).toBe(true);
    });
  });

  it('calls workoutStorage.load once on mount', async () => {
    renderHook(() => useLoadWorkouts());

    await waitFor(() => {
      expect(mockLoad).toHaveBeenCalledTimes(1);
    });
  });
});
