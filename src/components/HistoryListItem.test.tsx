import { render, screen } from '@testing-library/react-native';
import React from 'react';

import { WorkoutLog } from '@/types/workout';
import { HistoryListItem } from './HistoryListItem';

jest.mock('@/hooks/useColorScheme', () => ({
  useColorScheme: () => 'light',
}));

const baseDate = new Date('2026-03-28T10:00:00Z');

const mockLog: WorkoutLog = {
  id: '1',
  workout: {
    id: '1',
    name: 'Chest Day',
    exercises: [
      { id: 'e1', name: 'Bench Press', reps: 10, numberOfSets: 3, weight: 60 },
      { id: 'e2', name: 'Push Up', reps: 12, numberOfSets: 3 },
    ],
    createdAt: baseDate,
  },
  exercises: [
    {
      id: 'el1',
      exercise: {
        id: 'e1',
        name: 'Bench Press',
        reps: 10,
        numberOfSets: 3,
        weight: 60,
      },
      completedSets: 3,
      completedAt: baseDate,
    },
    {
      id: 'el2',
      exercise: { id: 'e2', name: 'Push Up', reps: 12, numberOfSets: 3 },
      completedSets: 2,
      completedAt: undefined,
    },
  ],
  completedAt: baseDate,
};

describe('HistoryListItem', () => {
  it('renders workout name', () => {
    render(<HistoryListItem log={mockLog} />);
    expect(screen.getByText('Chest Day')).toBeTruthy();
  });

  it('renders exercise completion count', () => {
    render(<HistoryListItem log={mockLog} />);
    expect(screen.getByText('1/2 exercises')).toBeTruthy();
  });

  it('renders total sets', () => {
    render(<HistoryListItem log={mockLog} />);
    expect(screen.getByText('5 sets')).toBeTruthy();
  });

  it('renders volume when weight is present', () => {
    render(<HistoryListItem log={mockLog} />);
    // 60 * 10 * 3 = 1800 kg
    expect(screen.getByText(/1\.8k/)).toBeTruthy();
  });

  it('does not render volume when no exercises have weight', () => {
    const noWeightLog: WorkoutLog = {
      ...mockLog,
      exercises: [
        {
          id: 'el1',
          exercise: { id: 'e1', name: 'Push Up', reps: 12, numberOfSets: 3 },
          completedSets: 3,
          completedAt: baseDate,
        },
      ],
    };
    render(<HistoryListItem log={noWeightLog} />);
    expect(screen.queryByText(/kg/)).toBeNull();
  });
});
