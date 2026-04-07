import { WorkoutStats } from '@/components/WorkoutStats';
import { Exercise } from '@/types/workout';
import { render, screen } from '@testing-library/react-native';
import React from 'react';

const exercises: Exercise[] = [
  { id: 'e1', name: 'Bench Press', reps: 10, numberOfSets: 3, weight: 60 },
  { id: 'e2', name: 'Push Up', reps: 12, numberOfSets: 4 },
];

describe('WorkoutStats', () => {
  it('renders all stat labels', () => {
    render(<WorkoutStats exercises={exercises} />);
    expect(screen.getByText('Volume')).toBeTruthy();
    expect(screen.getByText('Total Reps')).toBeTruthy();
    expect(screen.getByText('Est. Time')).toBeTruthy();
  });

  it('computes total volume correctly (skips exercises without weight)', () => {
    // Bench Press: 60 * 10 * 3 = 1800; Push Up: no weight → 0
    render(<WorkoutStats exercises={exercises} />);
    expect(screen.getByText('1.8k')).toBeTruthy();
  });

  it('computes total reps correctly', () => {
    // (10 * 3) + (12 * 4) = 30 + 48 = 78
    render(<WorkoutStats exercises={exercises} />);
    expect(screen.getByText('78')).toBeTruthy();
  });

  it('computes estimated time correctly', () => {
    // totalReps = 78, totalSets = 7, estMinutes = round((78*3 + 7*90) / 60) = round(14.4) = 14
    render(<WorkoutStats exercises={exercises} />);
    expect(screen.getByText('14')).toBeTruthy();
  });

  it('renders zero stats for empty exercises', () => {
    render(<WorkoutStats exercises={[]} />);
    // Volume=0, TotalReps=0, EstTime=0
    expect(screen.getAllByText('0')).toHaveLength(3);
  });

  it('handles a single exercise', () => {
    const single: Exercise[] = [
      { id: 'e1', name: 'Squat', reps: 5, numberOfSets: 5, weight: 100 },
    ];
    // volume = 100*5*5 = 2500, totalReps = 25, estMinutes = round((25*3 + 5*90) / 60) = round(8.75) = 9
    render(<WorkoutStats exercises={single} />);
    expect(screen.getByText('2.5k')).toBeTruthy();
    expect(screen.getByText('25')).toBeTruthy();
    expect(screen.getByText('9')).toBeTruthy();
  });
});
