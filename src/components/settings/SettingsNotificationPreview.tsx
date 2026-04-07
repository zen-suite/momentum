import { Text } from '@/components/ui/text';
import React from 'react';
import { View } from 'react-native';

interface SettingsNotificationPreviewProps {
  nextWorkoutName: string | null;
  quote: string | null;
  scheduleLabel: string;
}

export function SettingsNotificationPreview({
  nextWorkoutName,
  quote,
  scheduleLabel,
}: SettingsNotificationPreviewProps) {
  return (
    <View className="rounded-[32px] bg-background-50 px-5 py-6">
      <Text className="text-[11px] font-bold uppercase tracking-[0.32em] opacity-45">
        Next Reminder
      </Text>
      <Text className="mt-3 text-sm uppercase tracking-[0.2em] opacity-45">
        {scheduleLabel}
      </Text>
      <Text className="mt-3 text-3xl font-extrabold tracking-tight">
        {nextWorkoutName ?? 'No workout queued'}
      </Text>
      <Text className="mt-4 text-sm leading-6 opacity-70">
        {quote
          ? `“${quote}”`
          : 'Create a workout to preview your reminder copy.'}
      </Text>
    </View>
  );
}
