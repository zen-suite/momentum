import {
  buildWorkoutReminderQueue,
  formatReminderTime,
  getNextWorkout,
  isWorkoutDay,
} from '@/notifications/workoutReminderUtils';
import { DEFAULT_NOTIFICATION_SETTINGS } from '@/utils/settings';
import { Workout, WorkoutLog } from '@/types/workout';

const workouts: Workout[] = [
  {
    id: 'push',
    name: 'Push Day',
    exercises: [],
    createdAt: new Date('2026-04-01T08:00:00.000Z'),
  },
  {
    id: 'pull',
    name: 'Pull Day',
    exercises: [],
    createdAt: new Date('2026-04-02T08:00:00.000Z'),
  },
  {
    id: 'legs',
    name: 'Leg Day',
    exercises: [],
    createdAt: new Date('2026-04-03T08:00:00.000Z'),
  },
];

function makeHistoryEntry(workoutId: string, completedAt: string): WorkoutLog {
  const workout =
    workouts.find((entry) => entry.id === workoutId) ?? workouts[0];

  return {
    id: `${workoutId}:${completedAt}`,
    workout,
    exercises: [],
    completedAt: new Date(completedAt),
  };
}

describe('workoutReminderUtils', () => {
  it('calculates workout and break days from the anchor date', () => {
    const notifications = {
      ...DEFAULT_NOTIFICATION_SETTINGS,
      enabled: true,
      patternAnchorDate: '2026-04-06',
      workoutDays: 3,
      breakDays: 1,
    };

    expect(isWorkoutDay(new Date(2026, 3, 6), notifications)).toBe(true);
    expect(isWorkoutDay(new Date(2026, 3, 8), notifications)).toBe(true);
    expect(isWorkoutDay(new Date(2026, 3, 9), notifications)).toBe(false);
    expect(isWorkoutDay(new Date(2026, 3, 10), notifications)).toBe(true);
  });

  it('returns the next workout from current routine order', () => {
    const history = [makeHistoryEntry('push', '2026-04-06T10:00:00.000Z')];

    expect(getNextWorkout(workouts, history)?.name).toBe('Pull Day');
  });

  it('falls back to the first workout when the latest completed workout was deleted', () => {
    const history = [
      {
        id: 'deleted:2026-04-06T10:00:00.000Z',
        workout: {
          id: 'deleted',
          name: 'Deleted Day',
          exercises: [],
          createdAt: new Date('2026-04-01T08:00:00.000Z'),
        },
        exercises: [],
        completedAt: new Date('2026-04-06T10:00:00.000Z'),
      },
    ];

    expect(getNextWorkout(workouts, history)?.name).toBe('Push Day');
  });

  it('builds reminder dates only for future workout days in the horizon', () => {
    const queue = buildWorkoutReminderQueue({
      now: new Date(2026, 3, 6, 20, 0),
      workouts,
      history: [makeHistoryEntry('push', '2026-04-05T09:00:00.000Z')],
      notifications: {
        ...DEFAULT_NOTIFICATION_SETTINGS,
        enabled: true,
        patternAnchorDate: '2026-04-06',
        workoutDays: 2,
        breakDays: 1,
        sendHour: 19,
        sendMinute: 0,
      },
      horizonDays: 5,
    });

    expect(queue.map((entry) => entry.triggerDate.getDate())).toEqual([
      7, 9, 10,
    ]);
    expect(queue[0]?.workoutName).toBe('Pull Day');
  });

  it('formats reminder times in 12-hour format', () => {
    expect(formatReminderTime(6, 5)).toBe('6:05 AM');
    expect(formatReminderTime(19, 0)).toBe('7:00 PM');
  });
});
