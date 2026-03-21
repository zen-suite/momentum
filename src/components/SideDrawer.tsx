import Dumbbell from '@/components/icons/Dumbbell';
import History from '@/components/icons/History';
import ListChecks from '@/components/icons/ListChecks';
import Settings from '@/components/icons/Settings';
import User from '@/components/icons/User';
import {
  Drawer,
  DrawerBackdrop,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
} from '@/components/ui/drawer';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

type NavRoute = '/(tabs)/index' | '/(tabs)/workouts';

interface NavItem {
  label: string;
  icon: React.ComponentType<{ size: number; className?: string }>;
  route: NavRoute | null;
}

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: NavRoute) => void;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'LOG', icon: ListChecks, route: '/(tabs)/index' },
  { label: 'WORKOUTS', icon: Dumbbell, route: '/(tabs)/workouts' },
  { label: 'HISTORY', icon: History, route: null },
  { label: 'SETTINGS', icon: Settings, route: null },
  { label: 'PROFILE', icon: User, route: null },
];

export function SideDrawer({ isOpen, onClose, onNavigate }: SideDrawerProps) {
  return (
    <Drawer isOpen={isOpen} onClose={onClose} anchor="left" size="lg">
      <DrawerBackdrop testID="drawer-backdrop" onPress={onClose} />
      <DrawerContent testID="drawer-panel" className="py-8">
        <DrawerBody>
          <View className="mb-10 mt-4">
            <Text className="text-3xl font-bold tracking-wider text-primary">
              KINETIC
            </Text>
          </View>
          <View className="gap-6">
            {NAV_ITEMS.map(({ label, icon: Icon, route }) => (
              <Pressable
                key={label}
                className="flex-row items-center gap-4"
                onPress={() => {
                  if (route) onNavigate(route);
                  onClose();
                }}
              >
                <Icon size={22} className="text-primary" />
                <Text className="text-base font-bold tracking-widest text-primary">
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>
        </DrawerBody>
        <DrawerFooter className="justify-start">
          <Text className="text-xs tracking-widest text-primary opacity-40">
            V 2.0.4 KINETIC
          </Text>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
