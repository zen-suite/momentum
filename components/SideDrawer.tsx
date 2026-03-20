import Dumbbell from '@/components/icons/Dumbbell';
import History from '@/components/icons/History';
import ListChecks from '@/components/icons/ListChecks';
import Settings from '@/components/icons/Settings';
import User from '@/components/icons/User';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
  if (!isOpen) return null;

  return (
    <View className="absolute inset-0 z-50 flex-row">
      <Pressable
        testID="drawer-backdrop"
        className="absolute inset-0 bg-black/60"
        onPress={onClose}
      />
      <SafeAreaView testID="drawer-panel" className="w-72 bg-background-0">
        <View className="flex-1 px-6 py-8">
          <View className="mb-10 mt-4">
            <Text className="text-3xl font-bold italic tracking-wider text-primary">
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
        </View>
        <View className="px-6 pb-8">
          <Text className="text-xs tracking-widest text-primary opacity-40">
            V 2.0.4 KINETIC
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}
