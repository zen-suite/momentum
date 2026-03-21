import Dumbbell from '@/components/icons/Dumbbell';
import ListChecks from '@/components/icons/ListChecks';
import { Tabs } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { WrappedIcon } from '@/components/icons/utils';
import { cn } from '@/utils/styles';

const tabClassName = (focused: boolean) =>
  cn({
    'text-typography-950': focused,
    'text-typography-600': !focused,
  });

function TabLabel({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text
      className={cn('text-xs', {
        'font-semibold text-typography-950': focused,
        'font-normal text-typography-600': !focused,
      })}
    >
      {label}
    </Text>
  );
}

function TabIcon({
  icon: Icon,
  focused,
}: {
  icon: WrappedIcon;
  focused: boolean;
}) {
  return <Icon size={24} className={tabClassName(focused)} />;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={Dumbbell} focused={focused} />
          ),
          tabBarLabel: ({ focused }) => (
            <TabLabel label="Logs" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="workouts"
        options={{
          title: 'Workouts',
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={ListChecks} focused={focused} />
          ),
          tabBarLabel: ({ focused }) => (
            <TabLabel label="Workouts" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
