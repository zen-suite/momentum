import ExternalLink from '@/components/icons/ExternalLink';
import { Text } from '@/components/ui/text';
import React from 'react';
import { Linking, Pressable } from 'react-native';

interface SettingsLegalRowProps {
  label: string;
  url: string;
}

export function SettingsLegalRow({ label, url }: SettingsLegalRowProps) {
  return (
    <Pressable
      onPress={() => Linking.openURL(url)}
      className="min-h-[56px] flex-row items-center justify-between py-4"
    >
      <Text className="text-sm font-semibold">{label}</Text>
      <ExternalLink size={18} className="text-primary opacity-40" />
    </Pressable>
  );
}
