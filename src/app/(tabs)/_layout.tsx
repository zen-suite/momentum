import Dumbbell from '@/components/icons/Dumbbell';
import ListChecks from '@/components/icons/ListChecks';
import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/HapticTab';

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
          title: 'LOG',
          tabBarIcon: ({ color }) => <Dumbbell size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="workouts"
        options={{
          title: 'WORKOUTS',
          tabBarIcon: ({ color }) => <ListChecks size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
