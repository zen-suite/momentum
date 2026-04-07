import { NotificationSettings } from '@/types/settings-types';
import { WorkoutLog, Workout } from '@/types/workout';
import { getWorkoutQuote } from '@/utils/workoutQuotes';

export const WORKOUT_REMINDER_CHANNEL_ID = 'workout-reminders';
export const WORKOUT_REMINDER_KIND = 'workout-reminder';
export const WORKOUT_REMINDER_HORIZON_DAYS = 14;
export const WORKOUT_REMINDER_MINIMUM_REMAINING = 7;

export interface WorkoutReminderContent {
  title: string;
  body: string;
  triggerDate: Date;
  workoutName: string;
  quote: string;
}

export function getLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function parseLocalDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function setLocalTime(date: Date, hour: number, minute: number): Date {
  const result = new Date(date);
  result.setHours(hour, minute, 0, 0);
  return result;
}

export function differenceInCalendarDays(a: Date, b: Date): number {
  const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

  return Math.round((utcA - utcB) / (24 * 60 * 60 * 1000));
}

export function isWorkoutDay(
  date: Date,
  notifications: NotificationSettings,
): boolean {
  if (!notifications.patternAnchorDate || notifications.workoutDays <= 0) {
    return false;
  }

  const anchorDate = parseLocalDateKey(notifications.patternAnchorDate);
  const cycleLength = notifications.workoutDays + notifications.breakDays;

  if (cycleLength <= 0) {
    return false;
  }

  const offset = differenceInCalendarDays(date, anchorDate);
  const normalizedOffset = ((offset % cycleLength) + cycleLength) % cycleLength;

  return normalizedOffset < notifications.workoutDays;
}

export function getNextWorkout(
  workouts: Workout[],
  history: WorkoutLog[],
): Workout | null {
  if (workouts.length === 0) {
    return null;
  }

  const workoutIds = new Set(workouts.map((workout) => workout.id));

  const latestCompletedWorkout = [...history]
    .filter((entry) => entry.completedAt && workoutIds.has(entry.workout.id))
    .sort((left, right) => {
      return right.completedAt!.getTime() - left.completedAt!.getTime();
    })[0];

  if (!latestCompletedWorkout) {
    return workouts[0];
  }

  const latestIndex = workouts.findIndex(
    (workout) => workout.id === latestCompletedWorkout.workout.id,
  );

  if (latestIndex === -1) {
    return workouts[0];
  }

  return workouts[(latestIndex + 1) % workouts.length];
}

export function buildWorkoutReminderQueue({
  now,
  workouts,
  history,
  notifications,
  horizonDays = WORKOUT_REMINDER_HORIZON_DAYS,
}: {
  now: Date;
  workouts: Workout[];
  history: WorkoutLog[];
  notifications: NotificationSettings;
  horizonDays?: number;
}): WorkoutReminderContent[] {
  if (
    !notifications.enabled ||
    !notifications.patternAnchorDate ||
    workouts.length === 0
  ) {
    return [];
  }

  const nextWorkout = getNextWorkout(workouts, history);
  if (!nextWorkout) {
    return [];
  }

  const reminderQueue: WorkoutReminderContent[] = [];
  const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  for (let offset = 0; offset < horizonDays; offset += 1) {
    const candidateDay = addDays(startDate, offset);
    if (!isWorkoutDay(candidateDay, notifications)) {
      continue;
    }

    const triggerDate = setLocalTime(
      candidateDay,
      notifications.sendHour,
      notifications.sendMinute,
    );

    if (triggerDate <= now) {
      continue;
    }

    const quote = getWorkoutQuote(getLocalDateKey(candidateDay));
    reminderQueue.push({
      title: 'Momentum reminder',
      body: `${nextWorkout.name} is up next. “${quote}”`,
      triggerDate,
      workoutName: nextWorkout.name,
      quote,
    });
  }

  return reminderQueue;
}

export function formatReminderTime(hour: number, minute: number): string {
  const meridiem = hour >= 12 ? 'PM' : 'AM';
  const normalizedHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${normalizedHour}:${`${minute}`.padStart(2, '0')} ${meridiem}`;
}

export function formatReminderDate(date: Date, now: Date = new Date()): string {
  const dayDifference = differenceInCalendarDays(date, now);

  if (dayDifference === 0) {
    return 'Today';
  }

  if (dayDifference === 1) {
    return 'Tomorrow';
  }

  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}
