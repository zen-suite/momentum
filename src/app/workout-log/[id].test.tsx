import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import { Workout, WorkoutLog } from '@/types/workout';

jest.mock('@/hooks/useColorScheme', () => ({
  useColorScheme: () => 'light',
}));

const mockGoBack = jest.fn();
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ id: 'w1' }),
  Stack: {
    Screen: () => null,
  },
  useRouter: () => ({ back: mockGoBack }),
}));

const mockWorkout: Workout = {
  id: 'w1',
  name: 'Push Day',
  createdAt: new Date(),
  exercises: [
    { id: 'e1', name: 'Bench Press', reps: 10, numberOfSets: 3, weight: 60 },
    { id: 'e2', name: 'Squat', reps: 8, numberOfSets: 4 },
  ],
};

const mockLog: WorkoutLog = {
  id: 'w1',
  workout: mockWorkout,
  exercises: [],
  completedAt: undefined,
};
const mockCompleteExercise = jest.fn();
const mockCompleteSet = jest.fn();
const mockGetLog = jest.fn((_id: string): WorkoutLog | undefined => mockLog);
const mockGetWorkoutById = jest.fn(
  (_id: string): Workout | undefined => mockWorkout,
);
const mockToastShow = jest.fn();

jest.mock('@/hooks/useWorkouts', () => ({
  useWorkouts: () => ({ getWorkoutById: mockGetWorkoutById }),
}));
jest.mock('@/hooks/useWorkoutRoutine', () => ({
  useWorkoutRoutine: () => ({
    workoutLogs: {},
    getLog: mockGetLog,
    completeExercise: mockCompleteExercise,
    completeSet: mockCompleteSet,
  }),
}));
jest.mock('@/components/ui/toast', () => ({
  useToast: () => ({
    show: mockToastShow,
  }),
  Toast: ({ children }: { children: React.ReactNode }) => {
    const { View } = require('react-native');
    return <View>{children}</View>;
  },
  ToastTitle: ({ children }: { children: React.ReactNode }) => {
    const { Text } = require('react-native');
    return <Text>{children}</Text>;
  },
  ToastDescription: ({ children }: { children: React.ReactNode }) => {
    const { Text } = require('react-native');
    return <Text>{children}</Text>;
  },
}));

// Import after mocks
const WorkoutLogScreen = require('@/app/workout-log/[id]').default;

function renderScreen() {
  return render(<WorkoutLogScreen />);
}

describe('WorkoutLogScreen', () => {
  beforeEach(() => {
    mockCompleteExercise.mockClear();
    mockCompleteSet.mockClear();
    mockGetLog.mockReturnValue(mockLog);
    mockGetWorkoutById.mockReturnValue(mockWorkout);
    mockToastShow.mockClear();
  });

  it('shows exercise names', () => {
    renderScreen();
    expect(screen.getByText('Bench Press')).toBeTruthy();
    expect(screen.getByText('Squat')).toBeTruthy();
  });

  it('shows workout stats with completion rate', () => {
    renderScreen();
    expect(screen.getByText('Volume')).toBeTruthy();
  });

  it('shows completion progress near the top of the workout log', () => {
    renderScreen();
    expect(screen.getByTestId('workout-completion-progress')).toBeTruthy();
  });

  it('shows 100% completion progress when workout was completed from home', () => {
    mockGetLog.mockReturnValue({
      ...mockLog,
      completedAt: new Date(),
      exercises: [
        {
          id: 'l1',
          exercise: mockWorkout.exercises[0],
          completedSets: 3,
          completedAt: new Date(),
        },
        {
          id: 'l2',
          exercise: mockWorkout.exercises[1],
          completedSets: 4,
          completedAt: new Date(),
        },
      ],
    });

    renderScreen();
    expect(screen.getByText('100')).toBeTruthy();
  });

  it('shows workout name in header', () => {
    renderScreen();
    expect(screen.getByText('Push Day')).toBeTruthy();
  });

  it('shows sets count labels for exercises', () => {
    renderScreen();
    expect(screen.getByTestId('sets-label-e1')).toBeTruthy();
    expect(screen.getByTestId('sets-label-e2')).toBeTruthy();
  });

  it('shows set rows with reps and weight', () => {
    renderScreen();
    // Bench Press has 3 sets, each showing "10 reps · 60 kg"
    const benchSetRows = screen.getAllByText('10 reps · 60 kg');
    expect(benchSetRows.length).toBe(3);
    // Squat has 4 sets, each showing "8 reps" (no weight)
    const squatSetRows = screen.getAllByText('8 reps');
    expect(squatSetRows.length).toBe(4);
  });

  it('calls completeSet when a set row is pressed', () => {
    renderScreen();
    // Press first set row of Bench Press (first "10 reps · 60 kg")
    fireEvent.press(screen.getAllByText('10 reps · 60 kg')[0]);
    expect(mockCompleteSet).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'w1' }),
      'e1',
      0,
    );
  });

  it('shows not found message when workout does not exist', () => {
    mockGetWorkoutById.mockReturnValue(undefined);
    renderScreen();
    expect(screen.getByText('Workout not found')).toBeTruthy();
  });

  it('shows empty state when workout has no exercises', () => {
    mockGetWorkoutById.mockReturnValue({ ...mockWorkout, exercises: [] });
    renderScreen();
    expect(screen.getByText('No Exercises Yet')).toBeTruthy();
  });

  it('shows completion toast once when workout transitions to completed', () => {
    const incompleteLog = { ...mockLog, completedAt: undefined };
    const completedLog = { ...mockLog, completedAt: new Date() };

    mockGetLog.mockReturnValueOnce(incompleteLog).mockReturnValue(completedLog);

    const { rerender } = renderScreen();
    rerender(<WorkoutLogScreen />);

    expect(mockToastShow).toHaveBeenCalledTimes(1);
    expect(mockToastShow).toHaveBeenCalledWith(
      expect.objectContaining({
        placement: 'top',
      }),
    );
  });

  it('does not show completion toast on first render when already completed', () => {
    mockGetLog.mockReturnValue({ ...mockLog, completedAt: new Date() });
    renderScreen();
    expect(mockToastShow).not.toHaveBeenCalled();
  });
});
