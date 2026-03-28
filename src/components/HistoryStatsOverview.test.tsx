import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import { WorkoutStats } from '@/hooks/useWorkoutStats';
import { HistoryStatsOverview } from './HistoryStatsOverview';

jest.mock('@/hooks/useColorScheme', () => ({
  useColorScheme: () => 'light',
}));

const mockStats: WorkoutStats = {
  totalWorkouts: 12,
  currentStreak: 3,
  totalVolumeKg: 5400,
  thisWeek: 4,
  thisMonth: 10,
  mostFrequentWorkout: 'Chest Day',
  totalSets: 84,
};

describe('HistoryStatsOverview', () => {
  it('renders total workouts', () => {
    render(<HistoryStatsOverview stats={mockStats} onSeeAll={jest.fn()} />);
    expect(screen.getByText('12')).toBeTruthy();
  });

  it('renders current streak', () => {
    render(<HistoryStatsOverview stats={mockStats} onSeeAll={jest.fn()} />);
    expect(screen.getByText('3')).toBeTruthy();
  });

  it('renders volume formatted as 5.4k', () => {
    render(<HistoryStatsOverview stats={mockStats} onSeeAll={jest.fn()} />);
    expect(screen.getByText('5.4k')).toBeTruthy();
  });

  it('calls onSeeAll when All Stats is pressed', () => {
    const onSeeAll = jest.fn();
    render(<HistoryStatsOverview stats={mockStats} onSeeAll={onSeeAll} />);
    fireEvent.press(screen.getByTestId('see-all-stats'));
    expect(onSeeAll).toHaveBeenCalledTimes(1);
  });
});
