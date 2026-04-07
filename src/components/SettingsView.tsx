import Monitor from '@/components/icons/Monitor';
import Moon from '@/components/icons/Moon';
import Sun from '@/components/icons/Sun';
import { SettingsDefaultInput } from '@/components/settings/SettingsDefaultInput';
import { SettingsLegalRow } from '@/components/settings/SettingsLegalRow';
import { SettingsNotificationPreview } from '@/components/settings/SettingsNotificationPreview';
import { SettingsNumericStepper } from '@/components/settings/SettingsNumericStepper';
import { SettingsStatusCallout } from '@/components/settings/SettingsStatusCallout';
import { SettingsThemeOption } from '@/components/settings/SettingsThemeOption';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { useSettings } from '@/hooks/useSettings';
import { useWorkoutHistory } from '@/hooks/useWorkoutHistory';
import { useWorkouts } from '@/hooks/useWorkouts';
import {
  getWorkoutReminderPermissionStatusAsync,
  openWorkoutReminderSettingsAsync,
  requestWorkoutReminderPermissionsAsync,
} from '@/notifications/workoutReminderScheduler';
import {
  buildWorkoutReminderQueue,
  formatReminderDate,
  formatReminderTime,
  getLocalDateKey,
  getNextWorkout,
} from '@/notifications/workoutReminderUtils';
import { ExerciseDefaults, ThemeMode } from '@/types/settings-types';
import { cn } from '@/utils/styles';
import { getWorkoutQuote } from '@/utils/workoutQuotes';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import React, { useEffect, useMemo, useState } from 'react';
import { AppState, Platform, Pressable, ScrollView, View } from 'react-native';

const PRIVACY_POLICY_URL = 'https://example.com/privacy';
const TERMS_OF_SERVICE_URL = 'https://example.com/terms';
const NOTIFICATION_SWITCH_TRACK_COLOR = {
  false: '#F6F6F6',
  true: '#262627',
};
const NOTIFICATION_SWITCH_THUMB_COLOR = '#FFFFFF';

type NotificationPermissionState =
  | 'unknown'
  | 'undetermined'
  | 'denied'
  | 'granted';

export interface SettingsViewProps {
  theme: ThemeMode;
  defaultReps: number;
  defaultSets: number;
  defaultWeight: number | undefined;
  notificationEnabled: boolean;
  notificationWorkoutDays: number;
  notificationBreakDays: number;
  notificationTimeLabel: string;
  notificationPermissionState: NotificationPermissionState;
  hasWorkouts: boolean;
  nextReminderScheduleLabel: string;
  previewWorkoutName: string | null;
  previewQuote: string | null;
  onThemeChange: (theme: ThemeMode) => void;
  onDefaultsChange: (defaults: Partial<ExerciseDefaults>) => void;
  onToggleNotifications: () => void;
  onNotificationWorkoutDaysChange: (value: number) => void;
  onNotificationBreakDaysChange: (value: number) => void;
  onNotificationTimePress: () => void;
  onOpenNotificationSettings: () => void;
  notificationTimePicker?: React.ReactNode;
}

export function SettingsView({
  theme,
  defaultReps,
  defaultSets,
  defaultWeight,
  notificationEnabled,
  notificationWorkoutDays,
  notificationBreakDays,
  notificationTimeLabel,
  notificationPermissionState,
  hasWorkouts,
  nextReminderScheduleLabel,
  previewWorkoutName,
  previewQuote,
  onThemeChange,
  onDefaultsChange,
  onToggleNotifications,
  onNotificationWorkoutDaysChange,
  onNotificationBreakDaysChange,
  onNotificationTimePress,
  onOpenNotificationSettings,
  notificationTimePicker,
}: SettingsViewProps) {
  const showPermissionWarning = notificationPermissionState === 'denied';
  const showEmptyWorkoutState = !hasWorkouts;

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <View className="mt-4 pb-20">
        <View className="mb-12 gap-4">
          <Text className="max-w-[280px] text-5xl font-extrabold uppercase tracking-[0.06em]">
            Settings
          </Text>
          <Text className="max-w-[320px] text-base leading-7 opacity-70">
            Shape how Momentum feels, how workouts are seeded, and when your
            routine calls you back.
          </Text>
        </View>

        <View className="mb-12 gap-4">
          <Text className="text-[11px] font-bold uppercase tracking-[0.32em] opacity-40">
            Appearance
          </Text>
          <View className="rounded-[28px] bg-background-50 p-1.5">
            <View className="flex-row gap-2">
              <SettingsThemeOption
                label="Light"
                active={theme === 'light'}
                onPress={() => onThemeChange('light')}
                icon={
                  <Sun
                    size={16}
                    className={cn(
                      'text-typography-950',
                      theme === 'light' && 'text-typography-0',
                    )}
                  />
                }
              />
              <SettingsThemeOption
                label="Dark"
                active={theme === 'dark'}
                onPress={() => onThemeChange('dark')}
                icon={
                  <Moon
                    size={16}
                    className={cn(
                      'text-typography-950',
                      theme === 'dark' && 'text-typography-0',
                    )}
                  />
                }
              />
              <SettingsThemeOption
                label="System"
                active={theme === 'system'}
                onPress={() => onThemeChange('system')}
                icon={
                  <Monitor
                    size={16}
                    className={cn(
                      'text-typography-950',
                      theme === 'system' && 'text-typography-0',
                    )}
                  />
                }
              />
            </View>
          </View>
        </View>

        <View className="mb-12 gap-4">
          <Text className="text-[11px] font-bold uppercase tracking-[0.32em] opacity-40">
            Workout Defaults
          </Text>
          <Text className="max-w-[320px] text-sm leading-6 opacity-65">
            Every new exercise begins with the same editorial baseline. Tune it
            once and let the routine inherit the structure.
          </Text>
          <View className="flex-row gap-3">
            <SettingsDefaultInput
              label="Sets"
              testID="default-sets-input"
              value={defaultSets.toString()}
              onChangeText={(value) => {
                const num = parseInt(value, 10);
                if (value === '' || (!isNaN(num) && num >= 0)) {
                  onDefaultsChange({ sets: isNaN(num) ? 0 : num });
                }
              }}
              keyboardType="numeric"
              placeholder="0"
            />
            <SettingsDefaultInput
              label="Reps"
              testID="default-reps-input"
              value={defaultReps.toString()}
              onChangeText={(value) => {
                const num = parseInt(value, 10);
                if (value === '' || (!isNaN(num) && num >= 0)) {
                  onDefaultsChange({ reps: isNaN(num) ? 0 : num });
                }
              }}
              keyboardType="numeric"
              placeholder="0"
            />
            <SettingsDefaultInput
              label="Kg"
              testID="default-weight-input"
              value={defaultWeight?.toString() ?? ''}
              onChangeText={(value) => {
                if (value === '') {
                  onDefaultsChange({ weight: undefined });
                  return;
                }

                if (!/^\d*\.?\d*$/.test(value)) {
                  return;
                }

                const num = parseFloat(value);
                if (!isNaN(num) && num >= 0) {
                  onDefaultsChange({ weight: num });
                }
              }}
              keyboardType="decimal-pad"
              placeholder="—"
            />
          </View>
        </View>

        {showEmptyWorkoutState ? (
          <SettingsStatusCallout
            eyebrow="Notifications"
            title="Create a workout to enable notifications"
            body="You need to create at least 1 workout to enable notifications."
            className="mb-6"
          />
        ) : null}

        <View
          pointerEvents={showEmptyWorkoutState ? 'none' : 'auto'}
          className={cn('mb-12 gap-4', showEmptyWorkoutState && 'opacity-40')}
        >
          <View className="flex-row items-center justify-between gap-4">
            <View className="flex-1 gap-2">
              <Text className="text-[11px] font-bold uppercase tracking-[0.32em] opacity-40">
                Notifications
              </Text>
              <Text className="text-sm leading-6 opacity-65">
                Set your workout rhythm and Momentum will remind you when
                it&apos;s time.
              </Text>
            </View>
            <View
              className={cn(
                'flex min-w-[100px] items-center justify-start',
                showEmptyWorkoutState && !notificationEnabled && 'opacity-40',
              )}
            >
              <Switch
                testID="notification-toggle"
                accessibilityRole="switch"
                accessibilityState={{ checked: notificationEnabled }}
                disabled={showEmptyWorkoutState && !notificationEnabled}
                value={notificationEnabled}
                onValueChange={() => onToggleNotifications()}
                trackColor={NOTIFICATION_SWITCH_TRACK_COLOR}
                thumbColor={NOTIFICATION_SWITCH_THUMB_COLOR}
                ios_backgroundColor={NOTIFICATION_SWITCH_TRACK_COLOR.false}
              />
            </View>
          </View>

          <View className="gap-3">
            <View className="flex-row gap-3">
              <SettingsNumericStepper
                label="Workout Days"
                value={notificationWorkoutDays}
                minValue={1}
                maxValue={30}
                onChange={onNotificationWorkoutDaysChange}
              />
              <SettingsNumericStepper
                label="Break Days"
                value={notificationBreakDays}
                minValue={0}
                maxValue={30}
                onChange={onNotificationBreakDaysChange}
              />
            </View>

            <Pressable
              testID="notification-time-button"
              onPress={onNotificationTimePress}
              className="rounded-[28px] bg-background-50 px-5 py-5"
            >
              <Text className="text-[11px] font-bold uppercase tracking-[0.32em] opacity-45">
                Reminder Time
              </Text>
              <View className="mt-4 flex-row items-end justify-between gap-4">
                <Text className="text-4xl font-extrabold tracking-tight">
                  {notificationTimeLabel}
                </Text>
                <Text className="text-xs font-bold uppercase tracking-[0.24em] opacity-45">
                  Change
                </Text>
              </View>
            </Pressable>

            {!showEmptyWorkoutState ? notificationTimePicker : null}

            {showPermissionWarning ? (
              <SettingsStatusCallout
                eyebrow="Permission"
                title="Notifications are blocked"
                body="Momentum can queue reminders, but the system is currently blocking delivery. Open device settings to allow alerts and sounds."
                actionLabel="Open Settings"
                onPressAction={onOpenNotificationSettings}
                tone="warning"
              />
            ) : null}

            {!showEmptyWorkoutState ? (
              <SettingsNotificationPreview
                nextWorkoutName={previewWorkoutName}
                quote={previewQuote}
                scheduleLabel={nextReminderScheduleLabel}
              />
            ) : null}
          </View>
        </View>

        <View className="gap-2">
          <Text className="text-[11px] font-bold uppercase tracking-[0.32em] opacity-40">
            Legal
          </Text>
          <SettingsLegalRow label="Privacy Policy" url={PRIVACY_POLICY_URL} />
          <View className="h-px bg-outline-200 opacity-15" />
          <SettingsLegalRow
            label="Terms of Service"
            url={TERMS_OF_SERVICE_URL}
          />
        </View>
      </View>
    </ScrollView>
  );
}

export function withSettings(Component: typeof SettingsView) {
  return function SettingsContainer() {
    const {
      settings,
      updateTheme,
      updateExerciseDefaults,
      updateNotificationSettings,
      setNotificationsEnabled,
    } = useSettings();
    const { workouts } = useWorkouts();
    const { history } = useWorkoutHistory();
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [permissionState, setPermissionState] =
      useState<NotificationPermissionState>('unknown');

    useEffect(() => {
      let isMounted = true;

      const syncPermissionState = () => {
        return getWorkoutReminderPermissionStatusAsync()
          .then((status) => {
            if (isMounted) {
              setPermissionState(status.status as NotificationPermissionState);
            }
          })
          .catch(() => {
            if (isMounted) {
              setPermissionState('unknown');
            }
          });
      };

      void syncPermissionState();

      const subscription = AppState.addEventListener('change', (nextState) => {
        if (nextState === 'active') {
          void syncPermissionState();
        }
      });

      return () => {
        isMounted = false;
        subscription.remove();
      };
    }, []);

    const previewQueue = useMemo(() => {
      return buildWorkoutReminderQueue({
        now: new Date(),
        workouts,
        history,
        notifications: settings.notifications,
      });
    }, [history, settings.notifications, workouts]);

    const previewWorkout = useMemo(() => {
      return getNextWorkout(workouts, history);
    }, [history, workouts]);

    const previewQuote =
      previewQueue[0]?.quote ??
      (previewWorkout ? getWorkoutQuote(getLocalDateKey(new Date())) : null);

    const previewScheduleLabel = previewQueue[0]
      ? `${formatReminderDate(previewQueue[0].triggerDate)} · ${formatReminderTime(
          settings.notifications.sendHour,
          settings.notifications.sendMinute,
        )}`
      : `Workout days · ${formatReminderTime(
          settings.notifications.sendHour,
          settings.notifications.sendMinute,
        )}`;

    const handleNotificationToggle = async () => {
      if (settings.notifications.enabled) {
        setNotificationsEnabled(false);
        return;
      }

      if (workouts.length === 0) {
        return;
      }

      const permissionStatus = await requestWorkoutReminderPermissionsAsync();
      setPermissionState(
        permissionStatus.status as NotificationPermissionState,
      );

      if (!permissionStatus.granted) {
        return;
      }

      if (!settings.notifications.patternAnchorDate) {
        updateNotificationSettings({
          patternAnchorDate: getLocalDateKey(new Date()),
        });
      }
      setNotificationsEnabled(true);
    };

    const handleTimeChange = (
      event: DateTimePickerEvent,
      selectedDate?: Date,
    ) => {
      if (Platform.OS === 'android') {
        setShowTimePicker(false);
      }

      if (event.type === 'dismissed' || !selectedDate) {
        return;
      }

      updateNotificationSettings({
        sendHour: selectedDate.getHours(),
        sendMinute: selectedDate.getMinutes(),
      });
    };

    return (
      <Component
        theme={settings.theme}
        defaultReps={settings.exerciseDefaults.reps}
        defaultSets={settings.exerciseDefaults.sets}
        defaultWeight={settings.exerciseDefaults.weight}
        notificationEnabled={settings.notifications.enabled}
        notificationWorkoutDays={settings.notifications.workoutDays}
        notificationBreakDays={settings.notifications.breakDays}
        notificationTimeLabel={formatReminderTime(
          settings.notifications.sendHour,
          settings.notifications.sendMinute,
        )}
        notificationPermissionState={permissionState}
        hasWorkouts={workouts.length > 0}
        nextReminderScheduleLabel={previewScheduleLabel}
        previewWorkoutName={previewWorkout?.name ?? null}
        previewQuote={previewQuote}
        onThemeChange={updateTheme}
        onDefaultsChange={updateExerciseDefaults}
        onToggleNotifications={() => {
          void handleNotificationToggle();
        }}
        onNotificationWorkoutDaysChange={(value) =>
          updateNotificationSettings({
            workoutDays: value,
            patternAnchorDate: getLocalDateKey(new Date()),
          })
        }
        onNotificationBreakDaysChange={(value) =>
          updateNotificationSettings({
            breakDays: value,
            patternAnchorDate: getLocalDateKey(new Date()),
          })
        }
        onNotificationTimePress={() => setShowTimePicker(true)}
        onOpenNotificationSettings={() => {
          void openWorkoutReminderSettingsAsync();
        }}
        notificationTimePicker={
          showTimePicker ? (
            <View className="overflow-hidden rounded-[28px] bg-background-50 px-2 py-2 dark:bg-background-900">
              <DateTimePicker
                value={
                  new Date(
                    2026,
                    0,
                    1,
                    settings.notifications.sendHour,
                    settings.notifications.sendMinute,
                  )
                }
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleTimeChange}
              />
            </View>
          ) : null
        }
      />
    );
  };
}

export default withSettings(SettingsView);
