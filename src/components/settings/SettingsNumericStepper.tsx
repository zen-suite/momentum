import { Text } from '@/components/ui/text';
import { cn } from '@/utils/styles';
import React from 'react';
import { Pressable, View } from 'react-native';

interface SettingsNumericStepperProps {
  label: string;
  value: number;
  minValue: number;
  maxValue?: number;
  onChange: (value: number) => void;
}

export function SettingsNumericStepper({
  label,
  value,
  minValue,
  maxValue,
  onChange,
}: SettingsNumericStepperProps) {
  const decrementDisabled = value <= minValue;
  const incrementDisabled = maxValue !== undefined && value >= maxValue;

  return (
    <View className="flex-1 rounded-[28px] bg-background-50 px-4 py-5 ">
      <Text className="text-[11px] font-bold uppercase tracking-[0.3em] opacity-45">
        {label}
      </Text>
      <View className="mt-5 flex-row items-end justify-between">
        <Text className="text-5xl font-extrabold tracking-tight">{value}</Text>
        <View className="flex-row gap-2">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Decrease value"
            disabled={decrementDisabled}
            onPress={() => onChange(Math.max(minValue, value - 1))}
            className={cn(
              'h-12 w-12 items-center justify-center rounded-full bg-typography-900',
              decrementDisabled && 'opacity-25',
            )}
          >
            <Text className="text-2xl font-semibold text-typography-0">−</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Increase value"
            disabled={!!incrementDisabled}
            onPress={() =>
              onChange(maxValue ? Math.min(maxValue, value + 1) : value + 1)
            }
            className={cn(
              'h-12 w-12 items-center justify-center rounded-full bg-typography-900',
              incrementDisabled && 'opacity-25',
            )}
          >
            <Text className="text-2xl font-semibold text-typography-0">+</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
