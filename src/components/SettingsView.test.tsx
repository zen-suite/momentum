import { SettingsView } from '@/components/SettingsView';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock'),
);

jest.mock('@/hooks/useColorScheme', () => ({
  useColorScheme: () => 'light',
}));

const defaultProps = {
  theme: 'system' as const,
  defaultReps: 10,
  defaultSets: 3,
  defaultWeight: undefined,
  notificationEnabled: false,
  notificationWorkoutDays: 3,
  notificationBreakDays: 1,
  notificationTimeLabel: '7:00 PM',
  notificationPermissionState: 'granted' as const,
  hasWorkouts: true,
  nextReminderScheduleLabel: 'Tomorrow · 7:00 PM',
  previewWorkoutName: 'Pull Day',
  previewQuote:
    'Discipline is choosing between what you want now and what you want most.',
  onThemeChange: jest.fn(),
  onDefaultsChange: jest.fn(),
  onToggleNotifications: jest.fn(),
  onNotificationWorkoutDaysChange: jest.fn(),
  onNotificationBreakDaysChange: jest.fn(),
  onNotificationTimePress: jest.fn(),
  onOpenNotificationSettings: jest.fn(),
};

describe('SettingsView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders section headings', () => {
    render(<SettingsView {...defaultProps} />);

    expect(screen.getByText('Appearance')).toBeTruthy();
    expect(screen.getByText('Workout Defaults')).toBeTruthy();
    expect(screen.getByText('Notifications')).toBeTruthy();
    expect(screen.getByText('Legal')).toBeTruthy();
  });

  it('calls onThemeChange with correct value when theme is pressed', () => {
    const onThemeChange = jest.fn();
    render(<SettingsView {...defaultProps} onThemeChange={onThemeChange} />);

    fireEvent.press(screen.getByText('Light'));
    fireEvent.press(screen.getByText('Dark'));
    fireEvent.press(screen.getByText('System'));

    expect(onThemeChange).toHaveBeenNthCalledWith(1, 'light');
    expect(onThemeChange).toHaveBeenNthCalledWith(2, 'dark');
    expect(onThemeChange).toHaveBeenNthCalledWith(3, 'system');
  });

  it('calls onDefaultsChange when defaults are edited', () => {
    const onDefaultsChange = jest.fn();
    render(
      <SettingsView {...defaultProps} onDefaultsChange={onDefaultsChange} />,
    );

    fireEvent.changeText(screen.getByTestId('default-reps-input'), '12');
    fireEvent.changeText(screen.getByTestId('default-sets-input'), '4');
    fireEvent.changeText(screen.getByTestId('default-weight-input'), '');

    expect(onDefaultsChange).toHaveBeenCalledWith({ reps: 12 });
    expect(onDefaultsChange).toHaveBeenCalledWith({ sets: 4 });
    expect(onDefaultsChange).toHaveBeenCalledWith({ weight: undefined });
  });

  it('calls notification handlers from the cadence controls', () => {
    const onToggleNotifications = jest.fn();
    const onNotificationTimePress = jest.fn();
    const onWorkoutDaysChange = jest.fn();
    const onBreakDaysChange = jest.fn();

    render(
      <SettingsView
        {...defaultProps}
        onToggleNotifications={onToggleNotifications}
        onNotificationTimePress={onNotificationTimePress}
        onNotificationWorkoutDaysChange={onWorkoutDaysChange}
        onNotificationBreakDaysChange={onBreakDaysChange}
      />,
    );

    fireEvent(screen.getByTestId('notification-toggle'), 'valueChange', true);
    fireEvent.press(screen.getByTestId('notification-time-button'));
    fireEvent.press(screen.getAllByLabelText('Increase value')[0]);
    fireEvent.press(screen.getAllByLabelText('Increase value')[1]);

    expect(onToggleNotifications).toHaveBeenCalledTimes(1);
    expect(onNotificationTimePress).toHaveBeenCalledTimes(1);
    expect(onWorkoutDaysChange).toHaveBeenCalledWith(4);
    expect(onBreakDaysChange).toHaveBeenCalledWith(2);
  });

  it('shows the permission warning when notifications are denied', () => {
    const onOpenNotificationSettings = jest.fn();
    render(
      <SettingsView
        {...defaultProps}
        notificationPermissionState="denied"
        onOpenNotificationSettings={onOpenNotificationSettings}
      />,
    );

    expect(screen.getByText('Notifications are blocked')).toBeTruthy();
    fireEvent.press(screen.getByText('Open Settings'));
    expect(onOpenNotificationSettings).toHaveBeenCalledTimes(1);
  });

  it('shows the empty workout state when no workouts exist', () => {
    render(<SettingsView {...defaultProps} hasWorkouts={false} />);

    expect(
      screen.getByText('Create a workout to enable notifications'),
    ).toBeTruthy();
    expect(
      screen.getByText(
        'You need to create at least 1 workout to enable notifications.',
      ),
    ).toBeTruthy();
  });
});
