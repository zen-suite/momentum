import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { Alert } from 'react-native';

jest.mock('@/hooks/useColorScheme', () => ({
  useColorScheme: () => 'light',
}));

const mockNavigate = jest.fn();
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ navigate: mockNavigate, push: mockPush }),
  usePathname: () => '/',
}));

const mockWorkouts: {
  id: string;
  name: string;
  exercises: never[];
  createdAt: Date;
}[] = [];
const mockWorkoutLogs: Record<string, unknown> = {};
const mockToggleWorkoutComplete = jest.fn();
const mockRestartRoutine = jest.fn();

jest.mock('@/hooks/useWorkouts', () => ({
  useWorkouts: () => ({ workouts: mockWorkouts }),
}));
jest.mock('@/hooks/useWorkoutRoutine', () => ({
  useWorkoutRoutine: () => ({
    workoutLogs: mockWorkoutLogs,
    toggleWorkoutComplete: mockToggleWorkoutComplete,
    restartRoutine: mockRestartRoutine,
  }),
}));
jest.mock('@/providers/WorkoutProvider', () => ({
  WorkoutProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));
jest.mock('@/providers/WorkoutRoutineProvider', () => ({
  WorkoutRoutineProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));
jest.mock('@/components/ui/drawer', () => {
  const mockReact = require('react');
  const { Pressable, ScrollView, View: mockView } = require('react-native');
  return {
    Drawer: ({
      isOpen,
      children,
    }: {
      isOpen: boolean;
      children: React.ReactNode;
    }) =>
      isOpen
        ? mockReact.createElement(mockReact.Fragment, null, children)
        : null,
    DrawerBackdrop: ({
      testID,
      onPress,
    }: {
      testID?: string;
      onPress?: () => void;
    }) => mockReact.createElement(Pressable, { testID, onPress }),
    DrawerContent: ({
      testID,
      children,
    }: {
      testID?: string;
      children: React.ReactNode;
    }) => mockReact.createElement(mockView, { testID }, children),
    DrawerBody: ({ children }: { children: React.ReactNode }) =>
      mockReact.createElement(ScrollView, null, children),
    DrawerFooter: ({ children }: { children: React.ReactNode }) =>
      mockReact.createElement(mockView, null, children),
  };
});

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
    it('shows Momentum header', () => {
      renderHome();
      expect(screen.getByText('Momentum')).toBeTruthy();
    });

    it('shows no workouts message', () => {
      renderHome();
      expect(screen.getByText('START YOUR JOURNEY')).toBeTruthy();
    });

    it('shows Create Your First Workout CTA button', () => {
      renderHome();
      expect(screen.getByTestId('create-first-workout-button')).toBeTruthy();
    });

    it('navigates to workouts tab when CTA is pressed', () => {
      renderHome();
      fireEvent.press(screen.getByTestId('create-first-workout-button'));
      expect(mockNavigate).toHaveBeenCalledWith('/(tabs)/workouts');
    });

    it('opens drawer when hamburger button is pressed', () => {
      renderHome();
      fireEvent.press(screen.getByTestId('hamburger-button'));
      expect(screen.getByTestId('drawer-panel')).toBeTruthy();
    });
  });

  describe('with workouts', () => {
    beforeEach(() => {
      mockWorkouts.push({
        id: '1',
        name: 'Push Day',
        exercises: [],
        createdAt: new Date(),
      });
    });

    it('shows Routine heading', () => {
      renderHome();
      expect(screen.getByText('Routine')).toBeTruthy();
    });

    it('shows the workout in the list', () => {
      renderHome();
      expect(screen.getByText('Push Day')).toBeTruthy();
    });

    it('does not show Create Your First Workout CTA', () => {
      renderHome();
      expect(screen.queryByTestId('create-first-workout-button')).toBeNull();
    });

    it('navigates to workout-log screen when workout card is pressed', () => {
      renderHome();
      fireEvent.press(screen.getByTestId('workout-card-1'));
      expect(mockPush).toHaveBeenCalledWith('/workout-log/1');
    });

    it('calls toggleWorkoutComplete when checkbox is pressed', () => {
      renderHome();
      fireEvent.press(screen.getByTestId('workout-checkbox-1'));
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
        workout: { name: 'Push Day' },
        exercises: [],
      };
      renderHome();
      expect(screen.getByTestId('restart-button')).toBeTruthy();
    });

    it('calls restartRoutine when restart button is pressed', () => {
      mockWorkoutLogs['1'] = {
        completedAt: new Date(),
        workout: { name: 'Push Day' },
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

    it('shows completion banner for a workout completed today', () => {
      mockWorkoutLogs['1'] = {
        completedAt: new Date(),
        workout: { name: 'Push Day' },
        exercises: [],
      };

      renderHome();
      expect(screen.getByTestId('home-completion-banner')).toBeTruthy();
      expect(
        screen.getByText('Congratulations! You completed Push Day today.'),
      ).toBeTruthy();
    });

    it('does not show completion banner for workouts completed before today', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      mockWorkoutLogs['1'] = {
        completedAt: yesterday,
        workout: { name: 'Push Day' },
        exercises: [],
      };

      renderHome();
      expect(screen.queryByTestId('home-completion-banner')).toBeNull();
    });

    it('shows banner using the most recently completed workout today', () => {
      const older = new Date();
      older.setHours(8, 0, 0, 0);
      const newer = new Date();
      newer.setHours(21, 0, 0, 0);

      mockWorkoutLogs['1'] = {
        completedAt: older,
        workout: { name: 'Push Day' },
        exercises: [],
      };
      mockWorkoutLogs['2'] = {
        completedAt: newer,
        workout: { name: 'Pull Day' },
        exercises: [],
      };

      renderHome();
      expect(
        screen.getByText('Congratulations! You completed Pull Day today.'),
      ).toBeTruthy();
    });

    it('opens drawer when hamburger button is pressed', () => {
      renderHome();
      fireEvent.press(screen.getByTestId('hamburger-button'));
      expect(screen.getByTestId('drawer-panel')).toBeTruthy();
    });
  });
});
