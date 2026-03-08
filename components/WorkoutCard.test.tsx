import { WorkoutCard } from '@/components/WorkoutCard';
import { Workout } from '@/types/workout';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

jest.mock('@/hooks/useColorScheme', () => ({
  useColorScheme: () => 'light',
}));

const mockWorkout: Workout = {
  id: '1',
  name: 'Chest Day',
  exercises: [
    { id: 'e1', name: 'Bench Press', sets: [] },
    { id: 'e2', name: 'Push Up', sets: [] },
  ],
  createdAt: new Date('2024-01-15'),
};

describe('WorkoutCard', () => {
  it('renders workout name', () => {
    render(
      <WorkoutCard
        workout={mockWorkout}
        onPress={jest.fn()}
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
        onDelete={jest.fn()}
      />,
    );
    expect(screen.getByText('2 exercises')).toBeTruthy();
  });

  it('renders singular exercise label for one exercise', () => {
    const workout: Workout = { ...mockWorkout, exercises: [{ id: 'e1', name: 'Squat', sets: [] }] };
    render(
      <WorkoutCard workout={workout} onPress={jest.fn()} onDelete={jest.fn()} />,
    );
    expect(screen.getByText('1 exercise')).toBeTruthy();
  });

  it('calls onPress when card is pressed', () => {
    const onPress = jest.fn();
    render(
      <WorkoutCard
        workout={mockWorkout}
        onPress={onPress}
        onDelete={jest.fn()}
      />,
    );
    fireEvent.press(screen.getByText('Chest Day'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('calls onDelete when trash icon is pressed', () => {
    const onDelete = jest.fn();
    render(
      <WorkoutCard
        workout={mockWorkout}
        onPress={jest.fn()}
        onDelete={onDelete}
      />,
    );
    fireEvent.press(screen.getByTestId('delete-button'));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
