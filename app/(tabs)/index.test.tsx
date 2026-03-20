import { render, screen, fireEvent } from '@testing-library/react-native';
import React from 'react';
import { Alert } from 'react-native';

jest.mock('@/hooks/useColorScheme', () => ({
  useColorScheme: () => 'light',
}));

const mockNavigate = jest.fn();
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ navigate: mockNavigate, push: mockPush }),
}));

const mockWorkouts: { id: string; name: string; exercises: never[]; createdAt: Date }[] = [];
const mockWorkoutLogs: Record<string, unknown> = {};
const mockToggleWorkoutComplete = jest.fn();
const mockRestartRoutine = jest.fn();

jest.mock('@/hooks/useWorkouts', () => ({
  useWorkouts: () => ({ workouts: mockWorkouts }),
}));
jest.mock('@/hooks/useWorkoutLogs', () => ({
  useWorkoutLogs: () => ({
    workoutLogs: mockWorkoutLogs,
    toggleWorkoutComplete: mockToggleWorkoutComplete,
    restartRoutine: mockRestartRoutine,
  }),
}));
jest.mock('@/providers/WorkoutProvider', () => ({
  WorkoutProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
jest.mock('@/providers/WorkoutLogProvider', () => ({
  WorkoutLogProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Import after mocks
// eslint-disable-next-line @typescript-eslint/no-require-imports
const HomeScreen = require('@/app/(tabs)/index').default;

function renderHome() {
  return render(<HomeScreen />);
}

describe('HomeScreen', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockPush.mockClear();
    mockToggleWorkoutComplete.mockClear();
    mockRestartRoutine.mockClear();
    mockWorkouts.length = 0;
    Object.keys(mockWorkoutLogs).forEach((k) => delete mockWorkoutLogs[k]);
  });

  describe('empty state', () => {
    it('shows get started heading when no workouts', () => {
      renderHome();
      expect(screen.getByText('Get Started')).toBeTruthy();
    });

    it('shows no workouts message', () => {
      renderHome();
      expect(screen.getByText('No workouts yet')).toBeTruthy();
    });

    it('shows Add Workout CTA button', () => {
      renderHome();
      expect(screen.getByText('Add Workout')).toBeTruthy();
    });

    it('navigates to workouts tab when CTA is pressed', () => {
      renderHome();
      fireEvent.press(screen.getByText('Add Workout'));
      expect(mockNavigate).toHaveBeenCalledWith('/(tabs)/workouts');
    });
  });

  describe('with workouts', () => {
    beforeEach(() => {
      mockWorkouts.push({ id: '1', name: 'Push Day', exercises: [], createdAt: new Date() });
    });

    it('shows My Workouts heading', () => {
      renderHome();
      expect(screen.getByText('My Workouts')).toBeTruthy();
    });

    it('shows the workout in the list', () => {
      renderHome();
      expect(screen.getByText('Push Day')).toBeTruthy();
    });

    it('does not show Add Workout CTA text', () => {
      renderHome();
      expect(screen.queryByText('Add Workout')).toBeNull();
    });

    it('navigates to workouts tab when header add button is pressed', () => {
      renderHome();
      fireEvent.press(screen.getByTestId('header-add-button'));
      expect(mockNavigate).toHaveBeenCalledWith('/(tabs)/workouts');
    });

    it('navigates to workout-log screen when workout row is pressed', () => {
      renderHome();
      fireEvent.press(screen.getByText('Push Day'));
      expect(mockPush).toHaveBeenCalledWith('/workout-log/1');
    });

    it('calls toggleWorkoutComplete when checkbox is pressed', () => {
      renderHome();
      fireEvent.press(screen.getByTestId('checkbox-1'));
      expect(mockToggleWorkoutComplete).toHaveBeenCalledWith(
        expect.objectContaining({ id: '1', name: 'Push Day' }),
      );
    });

    it('does not show restart button when no progress', () => {
      renderHome();
      expect(screen.queryByTestId('restart-button')).toBeNull();
    });

    it('shows restart button when a workout has progress', () => {
      mockWorkoutLogs['1'] = {
        completedAt: new Date(),
        exercises: [],
      };
      renderHome();
      expect(screen.getByTestId('restart-button')).toBeTruthy();
    });

    it('calls restartRoutine when restart button is pressed', () => {
      mockWorkoutLogs['1'] = {
        completedAt: new Date(),
        exercises: [],
      };
      jest.spyOn(Alert, 'alert').mockImplementation((_title, _msg, buttons) => {
        const resetButton = buttons?.find((b) => b.text === 'Reset');
        resetButton?.onPress?.();
      });
      renderHome();
      fireEvent.press(screen.getByTestId('restart-button'));
      expect(mockRestartRoutine).toHaveBeenCalled();
    });
  });
});
