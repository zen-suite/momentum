import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { WorkoutLog } from '@/types/workout';
import { View } from 'react-native';

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

interface HistoryListItemProps {
  log: WorkoutLog;
}

export function HistoryListItem({ log }: HistoryListItemProps) {
  const completedExercises = log.exercises.filter((e) => e.completedAt).length;
  const totalExercises = log.exercises.length;
  const totalSets = log.exercises.reduce((sum, e) => sum + e.completedSets, 0);
  const totalVolume = Math.round(
    log.exercises.reduce(
      (sum, e) =>
        sum + (e.exercise.weight ?? 0) * e.exercise.reps * e.completedSets,
      0,
    ),
  );

  return (
    <Card variant="filled" className="rounded-2xl px-4 py-4">
      <View className="flex-row items-start justify-between">
        <Heading size="md" className="flex-1 pr-4">
          {log.workout.name}
        </Heading>
        {log.completedAt && (
          <Text className="text-xs font-semibold opacity-50">
            {formatDate(log.completedAt)}
          </Text>
        )}
      </View>

      <View className="mt-3 flex-row flex-wrap gap-2">
        <View className="rounded bg-background-100 px-2 py-1">
          <Text className="text-xs font-bold uppercase tracking-widest">
            {completedExercises}/{totalExercises} exercises
          </Text>
        </View>
        <View className="rounded bg-background-100 px-2 py-1">
          <Text className="text-xs font-bold uppercase tracking-widest">
            {totalSets} sets
          </Text>
        </View>
        {totalVolume > 0 && (
          <View className="rounded bg-background-100 px-2 py-1">
            <Text className="text-xs font-bold uppercase tracking-widest">
              {totalVolume >= 1000
                ? `${(totalVolume / 1000).toFixed(1).replace(/\.0$/, '')}k`
                : totalVolume}{' '}
              kg
            </Text>
          </View>
        )}
      </View>
    </Card>
  );
}
