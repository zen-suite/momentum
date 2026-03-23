import { WorkoutCard } from '@/components/WorkoutCard';
import { Workout } from '@/types/workout';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

jest.mock('@/hooks/useColorScheme', () => ({
  useColorScheme: () => 'light',
}));

jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock'),
);

jest.mock('react-native-gesture-handler', () => {
  const { View } = require('react-native');
  return {
    GestureDetector: ({ children }: { children: React.ReactNode }) => children,
    Gesture: {
      Pan: () => ({
        activeOffsetX: function () {
          return this;
        },
        onUpdate: function () {
          return this;
        },
        onEnd: function () {
          return this;
        },
      }),
    },
    GestureHandlerRootView: View,
  };
});

const mockWorkout: Workout = {
  id: '1',
  name: 'Chest Day',
  exercises: [
    { id: 'e1', name: 'Bench Press', reps: 10, numberOfSets: 3 },
    { id: 'e2', name: 'Push Up', reps: 12, numberOfSets: 3 },
  ],
  createdAt: new Date('2024-01-15'),
};

describe('WorkoutCard', () => {
  it('renders workout name', () => {
    render(
      <WorkoutCard
        workout={mockWorkout}
        onPress={jest.fn()}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />,
    );
    expect(screen.getByText('Chest Day')).toBeTruthy();
  });

  it('renders exercise count', () => {
    render(
      <WorkoutCard
        workout={mockWorkout}
        onPress={jest.fn()}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />,
    );
    expect(screen.getByText('2 exercises')).toBeTruthy();
  });

  it('renders singular exercise label for one exercise', () => {
    const workout: Workout = {
      ...mockWorkout,
      exercises: [{ id: 'e1', name: 'Squat', reps: 10, numberOfSets: 3 }],
    };
    render(
      <WorkoutCard
        workout={workout}
        onPress={jest.fn()}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />,
    );
    expect(screen.getByText('1 exercise')).toBeTruthy();
  });

  it('calls onPress when card is pressed', () => {
    const onPress = jest.fn();
    render(
      <WorkoutCard
        workout={mockWorkout}
        onPress={onPress}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />,
    );
    fireEvent.press(screen.getByText('Chest Day'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('calls onEdit when edit icon is pressed', () => {
    const onEdit = jest.fn();
    render(
      <WorkoutCard
        workout={mockWorkout}
        onPress={jest.fn()}
        onEdit={onEdit}
        onDelete={jest.fn()}
      />,
    );
    fireEvent.press(screen.getByTestId('edit-button'));
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('calls onDelete when delete icon is pressed', () => {
    const onDelete = jest.fn();
    render(
      <WorkoutCard
        workout={mockWorkout}
        onPress={jest.fn()}
        onEdit={jest.fn()}
        onDelete={onDelete}
      />,
    );
    fireEvent.press(screen.getByTestId('delete-button'));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('renders description tag when present', () => {
    const workout: Workout = {
      ...mockWorkout,
      description: 'CHEST / SHOULDERS',
    };
    render(
      <WorkoutCard
        workout={workout}
        onPress={jest.fn()}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />,
    );
    expect(screen.getByText('CHEST / SHOULDERS')).toBeTruthy();
  });
});
