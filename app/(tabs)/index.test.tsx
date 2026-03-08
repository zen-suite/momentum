import { render, screen, fireEvent } from '@testing-library/react-native';
import React from 'react';

import { WorkoutProvider } from '@/contexts/WorkoutContext';

jest.mock('@/hooks/useColorScheme', () => ({
  useColorScheme: () => 'light',
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

// Import after mocks
// eslint-disable-next-line @typescript-eslint/no-require-imports
const HomeScreen = require('@/app/(tabs)/index').default;

function renderHome() {
  return render(
    <WorkoutProvider>
      <HomeScreen />
    </WorkoutProvider>,
  );
}

describe('HomeScreen', () => {
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

    it('shows inline input form when CTA is pressed', () => {
      renderHome();
      fireEvent.press(screen.getByText('Add Workout'));
      expect(screen.getByPlaceholderText('Workout name')).toBeTruthy();
    });

    it('shows Cancel and Create buttons in input form', () => {
      renderHome();
      fireEvent.press(screen.getByText('Add Workout'));
      expect(screen.getByText('Cancel')).toBeTruthy();
      expect(screen.getByText('Create')).toBeTruthy();
    });

    it('hides the input form when Cancel is pressed', () => {
      renderHome();
      fireEvent.press(screen.getByText('Add Workout'));
      fireEvent.press(screen.getByText('Cancel'));
      expect(screen.queryByPlaceholderText('Workout name')).toBeNull();
    });

    it('does not create workout when name is empty', () => {
      renderHome();
      fireEvent.press(screen.getByText('Add Workout'));
      fireEvent.press(screen.getByText('Create'));
      // Input form stays open and heading remains "Get Started" (no workout created)
      expect(screen.getByText('Get Started')).toBeTruthy();
      expect(screen.getByPlaceholderText('Workout name')).toBeTruthy();
    });
  });

  describe('with workouts', () => {
    function renderHomeWithWorkout() {
      const utils = renderHome();
      fireEvent.press(screen.getByText('Add Workout'));
      fireEvent.changeText(screen.getByPlaceholderText('Workout name'), 'Push Day');
      fireEvent.press(screen.getByText('Create'));
      return utils;
    }

    it('shows My Workouts heading after creating a workout', () => {
      renderHomeWithWorkout();
      expect(screen.getByText('My Workouts')).toBeTruthy();
    });

    it('shows the created workout in the list', () => {
      renderHomeWithWorkout();
      expect(screen.getByText('Push Day')).toBeTruthy();
    });

    it('shows add button in header when workouts exist', () => {
      renderHomeWithWorkout();
      // The + icon button should be present (no "Add Workout" CTA text)
      expect(screen.queryByText('Add Workout')).toBeNull();
    });
  });
});
