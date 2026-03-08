import { render, screen, fireEvent } from '@testing-library/react-native';
import React from 'react';

jest.mock('@/hooks/useColorScheme', () => ({
  useColorScheme: () => 'light',
}));

const mockNavigate = jest.fn();
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ navigate: mockNavigate, push: mockPush }),
}));

const mockWorkouts: { id: string; name: string; exercises: never[]; createdAt: Date }[] = [];
jest.mock('@/contexts/WorkoutContext', () => ({
  useWorkouts: () => ({ workouts: mockWorkouts }),
  WorkoutProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
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
    mockWorkouts.length = 0;
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
  });
});
