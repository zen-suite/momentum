import { render, screen, fireEvent } from '@testing-library/react-native';
import React from 'react';

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

const mockWorkout = {
  id: 'w1',
  name: 'Push Day',
  createdAt: new Date(),
  exercises: [
    { id: 'e1', name: 'Bench Press', reps: 10, numberOfSets: 3, weight: 60 },
    { id: 'e2', name: 'Squat', reps: 8, numberOfSets: 4 },
  ],
};

const mockLog = { id: 'w1', workout: mockWorkout, exercises: [], completedAt: undefined };
const mockCompleteExercise = jest.fn();
const mockCompleteSet = jest.fn();
const mockGetLog = jest.fn(() => mockLog);
const mockGetWorkoutById = jest.fn(() => mockWorkout);

jest.mock('@/hooks/useWorkouts', () => ({
  useWorkouts: () => ({ getWorkoutById: mockGetWorkoutById }),
}));
jest.mock('@/hooks/useWorkoutLogs', () => ({
  useWorkoutLogs: () => ({
    workoutLogs: {},
    getLog: mockGetLog,
    completeExercise: mockCompleteExercise,
    completeSet: mockCompleteSet,
  }),
}));

// Import after mocks
// eslint-disable-next-line @typescript-eslint/no-require-imports
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
  });

  it('shows exercise names', () => {
    renderScreen();
    expect(screen.getByText('Bench Press')).toBeTruthy();
    expect(screen.getByText('Squat')).toBeTruthy();
  });

  it('shows progress counter', () => {
    renderScreen();
    expect(screen.getByText('0 / 2 exercises completed')).toBeTruthy();
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
});
