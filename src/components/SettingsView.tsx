import ExternalLink from '@/components/icons/ExternalLink';
import Monitor from '@/components/icons/Monitor';
import Moon from '@/components/icons/Moon';
import Sun from '@/components/icons/Sun';
import { Input, InputField } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useSettings } from '@/hooks/useSettings';
import { ExerciseDefaults, ThemeMode } from '@/types/settings-types';
import { cn } from '@/utils/styles';
import React from 'react';
import { Linking, Pressable, ScrollView, View } from 'react-native';

// TODO: Replace with your app's actual URLs
const PRIVACY_POLICY_URL = 'https://example.com/privacy';
const TERMS_OF_SERVICE_URL = 'https://example.com/terms';

interface ThemeOptionProps {
  mode: ThemeMode;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onPress: () => void;
}

function ThemeOption({ label, icon, active, onPress }: ThemeOptionProps) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        'flex-1 flex-row items-center justify-center gap-2 rounded-xl py-3',
        active ? 'bg-typography-900 dark:bg-typography-50' : 'bg-transparent',
      )}
    >
      <View
        className={cn(
          active
            ? 'text-typography-0 dark:text-typography-950'
            : 'text-primary opacity-40',
        )}
      >
        {icon}
      </View>
      <Text
        className={cn(
          'text-xs font-bold uppercase tracking-widest',
          active
            ? 'text-typography-0 dark:text-typography-950'
            : 'text-typography-950 opacity-40 dark:text-typography-50',
        )}
      >
        {label}
      </Text>
    </Pressable>
  );
}

interface LegalRowProps {
  label: string;
  url: string;
}

function LegalRow({ label, url }: LegalRowProps) {
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

export interface SettingsViewProps {
  theme: ThemeMode;
  defaultReps: number;
  defaultSets: number;
  defaultWeight: number | undefined;
  onThemeChange: (theme: ThemeMode) => void;
  onDefaultsChange: (defaults: Partial<ExerciseDefaults>) => void;
}

export function SettingsView({
  theme,
  defaultReps,
  defaultSets,
  defaultWeight,
  onThemeChange,
  onDefaultsChange,
}: SettingsViewProps) {
  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 64 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Page title */}
      <View className="mb-10 mt-2">
        <Text className="text-4xl font-extrabold uppercase tracking-widest">
          Settings
        </Text>
      </View>

      {/* APPEARANCE */}
      <View className="mb-10">
        <Text className="mb-4 text-xs font-bold uppercase tracking-widest opacity-40">
          Appearance
        </Text>
        <View className="flex-row gap-2 rounded-2xl bg-background-100 p-1.5 dark:bg-background-800">
          <ThemeOption
            mode="light"
            label="Light"
            active={theme === 'light'}
            onPress={() => onThemeChange('light')}
            icon={
              <Sun
                size={16}
                className={cn(
                  theme === 'light'
                    ? 'text-typography-0 dark:text-typography-950'
                    : 'text-primary opacity-40',
                )}
              />
            }
          />
          <ThemeOption
            mode="dark"
            label="Dark"
            active={theme === 'dark'}
            onPress={() => onThemeChange('dark')}
            icon={
              <Moon
                size={16}
                className={cn(
                  theme === 'dark'
                    ? 'text-typography-0 dark:text-typography-950'
                    : 'text-primary opacity-40',
                )}
              />
            }
          />
          <ThemeOption
            mode="system"
            label="System"
            active={theme === 'system'}
            onPress={() => onThemeChange('system')}
            icon={
              <Monitor
                size={16}
                className={cn(
                  theme === 'system'
                    ? 'text-typography-0 dark:text-typography-950'
                    : 'text-primary opacity-40',
                )}
              />
            }
          />
        </View>
      </View>

      {/* WORKOUT DEFAULTS */}
      <View className="mb-10">
        <Text className="mb-4 text-xs font-bold uppercase tracking-widest opacity-40">
          Workout Defaults
        </Text>
        <Text className="mb-6 text-xs opacity-40">
          Auto-populated when a new exercise is created.
        </Text>
        <View className="flex-row">
          {/* Sets */}
          <View className="flex-1 items-center">
            <Text className="mb-2 text-xs font-bold uppercase tracking-widest opacity-50">
              Sets
            </Text>
            <Input variant="underlined" className="w-full">
              <InputField
                value={defaultSets.toString()}
                onChangeText={(value) => {
                  const num = parseInt(value, 10);
                  if (value === '' || (!isNaN(num) && num >= 0)) {
                    onDefaultsChange({ sets: isNaN(num) ? 0 : num });
                  }
                }}
                keyboardType="numeric"
                placeholder="0"
                style={{ fontSize: 36, fontWeight: '800', textAlign: 'center' }}
              />
            </Input>
          </View>

          {/* Reps */}
          <View className="flex-1 items-center">
            <Text className="mb-2 text-xs font-bold uppercase tracking-widest opacity-50">
              Reps
            </Text>
            <Input variant="underlined" className="w-full">
              <InputField
                value={defaultReps.toString()}
                onChangeText={(value) => {
                  const num = parseInt(value, 10);
                  if (value === '' || (!isNaN(num) && num >= 0)) {
                    onDefaultsChange({ reps: isNaN(num) ? 0 : num });
                  }
                }}
                keyboardType="numeric"
                placeholder="0"
                style={{ fontSize: 36, fontWeight: '800', textAlign: 'center' }}
              />
            </Input>
          </View>

          {/* Weight (KG) */}
          <View className="flex-1 items-center">
            <Text className="mb-2 text-xs font-bold uppercase tracking-widest opacity-50">
              KG
            </Text>
            <Input variant="underlined" className="w-full">
              <InputField
                value={defaultWeight?.toString() ?? ''}
                onChangeText={(value) => {
                  if (value === '') {
                    onDefaultsChange({ weight: undefined });
                    return;
                  }
                  if (!/^\d*\.?\d*$/.test(value)) return;
                  const num = parseFloat(value);
                  if (!isNaN(num) && num >= 0) {
                    onDefaultsChange({ weight: num });
                  }
                }}
                keyboardType="decimal-pad"
                placeholder="—"
                style={{ fontSize: 36, fontWeight: '800', textAlign: 'center' }}
              />
            </Input>
          </View>
        </View>
      </View>

      {/* LEGAL */}
      <View>
        <Text className="mb-2 text-xs font-bold uppercase tracking-widest opacity-40">
          Legal
        </Text>
        <LegalRow label="Privacy Policy" url={PRIVACY_POLICY_URL} />
        <View className="h-px bg-outline-200 opacity-15" />
        <LegalRow label="Terms of Service" url={TERMS_OF_SERVICE_URL} />
      </View>
    </ScrollView>
  );
}

export function withSettings(Component: typeof SettingsView) {
  return function SettingsContainer() {
    const { settings, updateTheme, updateExerciseDefaults } = useSettings();

    return (
      <Component
        theme={settings.theme}
        defaultReps={settings.exerciseDefaults.reps}
        defaultSets={settings.exerciseDefaults.sets}
        defaultWeight={settings.exerciseDefaults.weight}
        onThemeChange={updateTheme}
        onDefaultsChange={updateExerciseDefaults}
      />
    );
  };
}

export default withSettings(SettingsView);
