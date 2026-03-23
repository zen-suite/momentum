import { render, fireEvent } from '@testing-library/react-native';
import React from 'react';
import { SideDrawer } from './SideDrawer';

jest.mock('@/components/ui/drawer', () => {
  const mockReact = require('react');
  const { Pressable, ScrollView, View: mockView } = require('react-native');
  return {
    Drawer: ({
      isOpen,
      children,
    }: {
      isOpen: boolean;
      children: React.ReactNode;
    }) =>
      isOpen
        ? mockReact.createElement(mockReact.Fragment, null, children)
        : null,
    DrawerBackdrop: ({
      testID,
      onPress,
    }: {
      testID?: string;
      onPress?: () => void;
    }) => mockReact.createElement(Pressable, { testID, onPress }),
    DrawerContent: ({
      testID,
      children,
    }: {
      testID?: string;
      children: React.ReactNode;
    }) => mockReact.createElement(mockView, { testID }, children),
    DrawerBody: ({ children }: { children: React.ReactNode }) =>
      mockReact.createElement(ScrollView, null, children),
    DrawerFooter: ({ children }: { children: React.ReactNode }) =>
      mockReact.createElement(mockView, null, children),
  };
});

describe('SideDrawer', () => {
  it('renders nothing when closed', () => {
    const { queryByTestId } = render(
      <SideDrawer isOpen={false} onClose={jest.fn()} onNavigate={jest.fn()} />,
    );
    expect(queryByTestId('drawer-panel')).toBeNull();
  });

  it('renders navigation items when open', () => {
    const { getByText } = render(
      <SideDrawer isOpen={true} onClose={jest.fn()} onNavigate={jest.fn()} />,
    );
    expect(getByText('LOG')).toBeTruthy();
    expect(getByText('WORKOUTS')).toBeTruthy();
    expect(getByText('HISTORY')).toBeTruthy();
    expect(getByText('SETTINGS')).toBeTruthy();
    expect(getByText('PROFILE')).toBeTruthy();
  });

  it('calls onClose when backdrop pressed', () => {
    const onClose = jest.fn();
    const { getByTestId } = render(
      <SideDrawer isOpen={true} onClose={onClose} onNavigate={jest.fn()} />,
    );
    fireEvent.press(getByTestId('drawer-backdrop'));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onNavigate with route and then onClose when a routed item is pressed', () => {
    const onNavigate = jest.fn();
    const onClose = jest.fn();
    const { getByText } = render(
      <SideDrawer isOpen={true} onClose={onClose} onNavigate={onNavigate} />,
    );
    fireEvent.press(getByText('LOG'));
    expect(onNavigate).toHaveBeenCalledWith('/(tabs)/index');
    expect(onClose).toHaveBeenCalled();
  });

  it('only calls onClose (not onNavigate) for items without a route', () => {
    const onNavigate = jest.fn();
    const onClose = jest.fn();
    const { getByText } = render(
      <SideDrawer isOpen={true} onClose={onClose} onNavigate={onNavigate} />,
    );
    fireEvent.press(getByText('HISTORY'));
    expect(onNavigate).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it('shows version number', () => {
    const { getByText } = render(
      <SideDrawer isOpen={true} onClose={jest.fn()} onNavigate={jest.fn()} />,
    );
    expect(getByText('V 2.0.4 KINETIC')).toBeTruthy();
  });
});
