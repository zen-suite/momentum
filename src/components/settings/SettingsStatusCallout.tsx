import { Text } from '@/components/ui/text';
import { cn } from '@/utils/styles';
import React from 'react';
import { Pressable, View } from 'react-native';

interface SettingsStatusCalloutProps {
  eyebrow: string;
  title: string;
  body: string;
  actionLabel?: string;
  onPressAction?: () => void;
  tone?: 'default' | 'warning';
}

export function SettingsStatusCallout({
  eyebrow,
  title,
  body,
  actionLabel,
  onPressAction,
  tone = 'default',
}: SettingsStatusCalloutProps) {
  return (
    <View
      className={cn(
        'rounded-[28px] px-5 py-5',
        tone === 'warning' ? 'bg-error-950/20' : 'bg-background-50',
      )}
    >
      <Text className="text-[11px] font-bold uppercase tracking-[0.28em] opacity-45">
        {eyebrow}
      </Text>
      <Text className="mt-3 text-xl font-bold tracking-tight">{title}</Text>
      <Text className="mt-2 text-sm leading-6 opacity-70">{body}</Text>
      {actionLabel && onPressAction ? (
        <Pressable onPress={onPressAction} className="mt-4 self-start">
          <Text className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
