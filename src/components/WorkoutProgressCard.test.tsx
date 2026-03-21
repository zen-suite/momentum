import { Workout, WorkoutLog } from '@/types/workout';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { WorkoutProgressCard } from './WorkoutProgressCard';

const baseWorkout: Workout = {
  id: '1',
  name: 'Upper Body Power',
  description: 'Focus on progressive overload for chest and back.',
  exercises: [
    { id: 'e1', name: 'Bench Press', reps: 10, numberOfSets: 3 },
    { id: 'e2', name: 'Pull Ups', reps: 8, numberOfSets: 3 },
    { id: 'e3', name: 'Rows', reps: 10, numberOfSets: 3 },
  ],
  createdAt: new Date(),
};

const completedLog: WorkoutLog = {
  id: 'log1',
  workout: baseWorkout,
  exercises: [
    {
      id: 'el1',
      exercise: baseWorkout.exercises[0],
      sets: [],
      completedAt: new Date(),
    },
    {
      id: 'el2',
      exercise: baseWorkout.exercises[1],
      sets: [],
      completedAt: new Date(),
    },
    {
      id: 'el3',
      exercise: baseWorkout.exercises[2],
      sets: [],
      completedAt: new Date(),
    },
  ],
  completedAt: new Date(),
};

const partialLog: WorkoutLog = {
  id: 'log2',
  workout: baseWorkout,
  exercises: [
    {
      id: 'el1',
      exercise: baseWorkout.exercises[0],
      sets: [],
      completedAt: new Date(),
    },
    { id: 'el2', exercise: baseWorkout.exercises[1], sets: [] },
    { id: 'el3', exercise: baseWorkout.exercises[2], sets: [] },
  ],
};

describe('WorkoutProgressCard', () => {
  it('renders workout name and description', () => {
    const { getByText } = render(
      <WorkoutProgressCard
        workout={baseWorkout}
        log={undefined}
        onPress={jest.fn()}
        onCheck={jest.fn()}
      />,
    );
    expect(getByText('Upper Body Power')).toBeTruthy();
    expect(
      getByText('Focus on progressive overload for chest and back.'),
    ).toBeTruthy();
  });

  it('shows 0 of 3 exercises completed when no log', () => {
    const { getByText } = render(
      <WorkoutProgressCard
        workout={baseWorkout}
        log={undefined}
        onPress={jest.fn()}
        onCheck={jest.fn()}
      />,
    );
    expect(getByText('0 of 3 exercises completed')).toBeTruthy();
  });

  it('shows 1 of 3 exercises completed for partial log', () => {
    const { getByText } = render(
      <WorkoutProgressCard
        workout={baseWorkout}
        log={partialLog}
        onPress={jest.fn()}
        onCheck={jest.fn()}
      />,
    );
    expect(getByText('1 of 3 exercises completed')).toBeTruthy();
  });

  it('shows 3 of 3 exercises completed when all done', () => {
    const { getByText } = render(
      <WorkoutProgressCard
        workout={baseWorkout}
        log={completedLog}
        onPress={jest.fn()}
        onCheck={jest.fn()}
      />,
    );
    expect(getByText('3 of 3 exercises completed')).toBeTruthy();
  });

  it('does not render description when absent', () => {
    const noDesc = { ...baseWorkout, description: undefined };
    const { queryByTestId } = render(
      <WorkoutProgressCard
        workout={noDesc}
        log={undefined}
        onPress={jest.fn()}
        onCheck={jest.fn()}
      />,
    );
    expect(queryByTestId('workout-description')).toBeNull();
  });

  it('calls onCheck when checkbox pressed', () => {
    const onCheck = jest.fn();
    const { getByTestId } = render(
      <WorkoutProgressCard
        workout={baseWorkout}
        log={undefined}
        onPress={jest.fn()}
        onCheck={onCheck}
      />,
    );
    fireEvent.press(getByTestId('workout-checkbox-1'));
    expect(onCheck).toHaveBeenCalled();
  });

  it('calls onPress when card pressed', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <WorkoutProgressCard
        workout={baseWorkout}
        log={undefined}
        onPress={onPress}
        onCheck={jest.fn()}
      />,
    );
    fireEvent.press(getByTestId('workout-card-1'));
    expect(onPress).toHaveBeenCalled();
  });
});
