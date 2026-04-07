import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Exercise } from '@/types/workout';
import { View } from 'react-native';

function formatStat(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  }
  return String(value);
}

interface WorkoutStatsProps {
  exercises: Exercise[];
}

export function WorkoutStats({ exercises }: WorkoutStatsProps) {
  const totalReps = exercises.reduce(
    (sum, e) => sum + e.reps * e.numberOfSets,
    0,
  );
  const totalSets = exercises.reduce((sum, e) => sum + e.numberOfSets, 0);
  const estMinutes = Math.round((totalReps * 3 + totalSets * 90) / 60);
  const totalVolume = Math.round(
    exercises.reduce(
      (sum, e) => sum + (e.weight ?? 0) * e.reps * e.numberOfSets,
      0,
    ),
  );

  return (
    <View className="mt-5 gap-3">
      <Text className="text-xs font-bold uppercase tracking-widest opacity-50">
        Stats
      </Text>
      <View className="flex-row gap-3">
        <Card variant="filled" className="flex-1 rounded-2xl px-4 py-4">
          <Text className="mb-1 text-xs font-bold uppercase tracking-widest opacity-50">
            Volume
          </Text>
          <View className="flex-row items-baseline gap-1">
            <Text className="text-base font-black">
              {formatStat(totalVolume)}
            </Text>
            <Text className="text-xs font-bold uppercase tracking-widest opacity-50">
              kg
            </Text>
          </View>
        </Card>
        <Card variant="filled" className="flex-1 rounded-2xl px-4 py-4">
          <Text className="mb-1 text-xs font-bold uppercase tracking-widest opacity-50">
            Total Reps
          </Text>
          <Text className="text-base font-black">{formatStat(totalReps)}</Text>
        </Card>
        <Card variant="filled" className="flex-1 rounded-2xl px-4 py-4">
          <Text className="mb-1 text-xs font-bold uppercase tracking-widest opacity-50">
            Est. Time
          </Text>
          <View className="flex-row items-baseline gap-1">
            <Text className="text-base font-black">
              {formatStat(estMinutes)}
            </Text>
            <Text className="text-xs font-bold uppercase tracking-widest opacity-50">
              min
            </Text>
          </View>
        </Card>
      </View>
    </View>
  );
}
