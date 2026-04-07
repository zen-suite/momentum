import { Text } from '@/components/ui/text';
import { cn } from '@/utils/styles';
import React from 'react';
import { Pressable, View } from 'react-native';

interface SettingsThemeOptionProps {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onPress: () => void;
}

export function SettingsThemeOption({
  label,
  icon,
  active,
  onPress,
}: SettingsThemeOptionProps) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        'flex-1 flex-row items-center justify-center gap-2 rounded-xl py-3',
        active ? 'bg-typography-900' : 'bg-transparent',
      )}
    >
      <View
        className={cn(active ? 'text-typography-0' : 'text-primary opacity-40')}
      >
        {icon}
      </View>
      <Text
        className={cn(
          'text-xs font-bold uppercase tracking-widest',
          active ? 'text-typography-0' : 'text-typography-950 opacity-40',
        )}
      >
        {label}
      </Text>
    </Pressable>
  );
}
