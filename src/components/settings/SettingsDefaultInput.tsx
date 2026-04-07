import { Input, InputField } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import React from 'react';
import { View } from 'react-native';

interface SettingsDefaultInputProps {
  label: string;
  testID: string;
  value: string;
  placeholder: string;
  keyboardType?: React.ComponentProps<typeof InputField>['keyboardType'];
  onChangeText: (value: string) => void;
}

export function SettingsDefaultInput({
  label,
  testID,
  value,
  placeholder,
  keyboardType = 'default',
  onChangeText,
}: SettingsDefaultInputProps) {
  return (
    <View className="flex-1 items-center rounded-[28px] bg-background-50 px-3 py-5">
      <Text className="mb-3 text-[11px] font-bold uppercase tracking-[0.28em] opacity-45">
        {label}
      </Text>
      <Input variant="underlined" size="xl" className="w-full">
        <InputField
          testID={testID}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          placeholder={placeholder}
          className="text-center font-extrabold"
        />
      </Input>
    </View>
  );
}
