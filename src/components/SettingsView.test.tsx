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
  onThemeChange: jest.fn(),
  onDefaultsChange: jest.fn(),
};

describe('SettingsView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders section headings', () => {
    render(<SettingsView {...defaultProps} />);
    expect(screen.getByText('Appearance')).toBeTruthy();
    expect(screen.getByText('Workout Defaults')).toBeTruthy();
    expect(screen.getByText('Legal')).toBeTruthy();
  });

  it('renders theme options', () => {
    render(<SettingsView {...defaultProps} />);
    expect(screen.getByText('Light')).toBeTruthy();
    expect(screen.getByText('Dark')).toBeTruthy();
    expect(screen.getByText('System')).toBeTruthy();
  });

  it('calls onThemeChange with correct value when theme is pressed', () => {
    const onThemeChange = jest.fn();
    render(<SettingsView {...defaultProps} onThemeChange={onThemeChange} />);
    fireEvent.press(screen.getByText('Light'));
    expect(onThemeChange).toHaveBeenCalledWith('light');
    fireEvent.press(screen.getByText('Dark'));
    expect(onThemeChange).toHaveBeenCalledWith('dark');
    fireEvent.press(screen.getByText('System'));
    expect(onThemeChange).toHaveBeenCalledWith('system');
  });

  it('renders default reps and sets values', () => {
    render(<SettingsView {...defaultProps} />);
    expect(screen.getByDisplayValue('10')).toBeTruthy();
    expect(screen.getByDisplayValue('3')).toBeTruthy();
  });

  it('calls onDefaultsChange when reps input changes', () => {
    const onDefaultsChange = jest.fn();
    render(
      <SettingsView {...defaultProps} onDefaultsChange={onDefaultsChange} />,
    );
    const repsInput = screen.getByDisplayValue('10');
    fireEvent.changeText(repsInput, '12');
    expect(onDefaultsChange).toHaveBeenCalledWith({ reps: 12 });
  });

  it('calls onDefaultsChange when sets input changes', () => {
    const onDefaultsChange = jest.fn();
    render(
      <SettingsView {...defaultProps} onDefaultsChange={onDefaultsChange} />,
    );
    const setsInput = screen.getByDisplayValue('3');
    fireEvent.changeText(setsInput, '4');
    expect(onDefaultsChange).toHaveBeenCalledWith({ sets: 4 });
  });

  it('calls onDefaultsChange with undefined weight when weight cleared', () => {
    const onDefaultsChange = jest.fn();
    render(
      <SettingsView
        {...defaultProps}
        defaultWeight={60}
        onDefaultsChange={onDefaultsChange}
      />,
    );
    const weightInput = screen.getByDisplayValue('60');
    fireEvent.changeText(weightInput, '');
    expect(onDefaultsChange).toHaveBeenCalledWith({ weight: undefined });
  });

  it('renders legal links', () => {
    render(<SettingsView {...defaultProps} />);
    expect(screen.getByText('Privacy Policy')).toBeTruthy();
    expect(screen.getByText('Terms of Service')).toBeTruthy();
  });
});
