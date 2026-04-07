import { WorkoutCompletionProgress } from '@/components/WorkoutCompletionProgress';
import { Exercise, ExerciseLog } from '@/types/workout';
import { render, screen } from '@testing-library/react-native';
import React from 'react';

const exercises: Exercise[] = [
  { id: 'e1', name: 'Bench Press', reps: 10, numberOfSets: 3, weight: 60 },
  { id: 'e2', name: 'Push Up', reps: 12, numberOfSets: 4 },
];

describe('WorkoutCompletionProgress', () => {
  it('shows 0% completion when no logs are provided', () => {
    render(<WorkoutCompletionProgress exercises={exercises} />);
    expect(screen.getByText('Completion')).toBeTruthy();
    expect(screen.getByText('0')).toBeTruthy();
  });

  it('renders completion rate when exercise logs are provided', () => {
    const logs: ExerciseLog[] = [
      {
        id: 'l1',
        exercise: exercises[0],
        completedSets: 3,
      },
      {
        id: 'l2',
        exercise: exercises[1],
        completedSets: 2,
      },
    ];

    // completedSets = 5, totalSets = 7, rate = round(5/7 * 100) = 71
    render(
      <WorkoutCompletionProgress exercises={exercises} exerciseLogs={logs} />,
    );
    expect(screen.getByText('Completion')).toBeTruthy();
    expect(screen.getByText('71')).toBeTruthy();
  });

  it('caps completion rate at 100%', () => {
    const logs: ExerciseLog[] = [
      {
        id: 'l1',
        exercise: exercises[0],
        completedSets: 99,
      },
      {
        id: 'l2',
        exercise: exercises[1],
        completedSets: 99,
      },
    ];

    render(
      <WorkoutCompletionProgress exercises={exercises} exerciseLogs={logs} />,
    );
    expect(screen.getByText('100')).toBeTruthy();
  });

  it('does not render when there are no sets', () => {
    render(<WorkoutCompletionProgress exercises={[]} />);
    expect(screen.queryByText('Completion')).toBeNull();
  });
});
