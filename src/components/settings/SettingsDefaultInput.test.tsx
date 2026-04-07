import { SettingsDefaultInput } from '@/components/settings/SettingsDefaultInput';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

describe('SettingsDefaultInput', () => {
  it('renders the label and forwards text changes', () => {
    const onChangeText = jest.fn();

    render(
      <SettingsDefaultInput
        label="Reps"
        testID="settings-default-input"
        value="10"
        placeholder="0"
        keyboardType="numeric"
        onChangeText={onChangeText}
      />,
    );

    expect(screen.getByText('Reps')).toBeTruthy();
    expect(screen.getByDisplayValue('10')).toBeTruthy();

    fireEvent.changeText(screen.getByTestId('settings-default-input'), '12');

    expect(onChangeText).toHaveBeenCalledWith('12');
  });
});
