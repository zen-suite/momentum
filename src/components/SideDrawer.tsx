import { MomentumLogo } from '@/components/MomentumLogo';
import Dumbbell from '@/components/icons/Dumbbell';
import History from '@/components/icons/History';
import ListChecks from '@/components/icons/ListChecks';
import Settings from '@/components/icons/Settings';
import { WrappedIcon } from '@/components/icons/utils';
import {
  Drawer,
  DrawerBackdrop,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
} from '@/components/ui/drawer';
import { cn } from '@/utils/styles';
import Constants from 'expo-constants';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

type NavRoute =
  | '/(tabs)'
  | '/(tabs)/workouts'
  | '/(tabs)/history'
  | '/settings';

interface NavItem {
  label: string;
  icon: WrappedIcon;
  route: NavRoute | null;
  pathname: string | null;
}

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: NavRoute) => void;
  activeRoute?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'LOGS', icon: ListChecks, route: '/(tabs)', pathname: '/' },
  {
    label: 'WORKOUTS',
    icon: Dumbbell,
    route: '/(tabs)/workouts',
    pathname: '/workouts',
  },
  {
    label: 'HISTORY',
    icon: History,
    route: '/(tabs)/history',
    pathname: '/history',
  },
  {
    label: 'SETTINGS',
    icon: Settings,
    route: '/settings',
    pathname: '/settings',
  },
];

export function SideDrawer({
  isOpen,
  onClose,
  onNavigate,
  activeRoute,
}: SideDrawerProps) {
  return (
    <Drawer isOpen={isOpen} onClose={onClose} anchor="left" size="lg">
      <DrawerBackdrop testID="drawer-backdrop" onPress={onClose} />
      <DrawerContent testID="drawer-panel" className="py-8">
        <DrawerBody>
          <View className="mb-10 mt-4 flex-row items-center gap-3">
            <MomentumLogo size={28} />
            <Text className="text-3xl font-bold tracking-wider text-primary">
              Momentum
            </Text>
          </View>
          <View className="gap-2">
            {NAV_ITEMS.map(({ label, icon: Icon, route, pathname }) => {
              const active =
                activeRoute !== undefined && activeRoute === pathname;
              return (
                <Pressable
                  key={label}
                  className={cn(
                    'flex-row items-center gap-4 rounded-lg px-4 py-3',
                    active && 'bg-typography-950 dark:bg-typography-0',
                  )}
                  onPress={() => {
                    if (route) onNavigate(route);
                    onClose();
                  }}
                >
                  <Icon
                    size={22}
                    className={cn(
                      'text-primary',
                      active && 'text-typography-0 dark:text-typography-950',
                    )}
                  />
                  <Text
                    className={cn(
                      'text-base font-bold tracking-widest text-primary',
                      active && 'text-typography-0 dark:text-typography-950',
                    )}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </DrawerBody>
        <DrawerFooter className="justify-start">
          <Text className="text-xs tracking-widest text-primary opacity-40">
            V {Constants.expoConfig?.version}
          </Text>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
