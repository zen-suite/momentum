import TrendingUp from '@/components/icons/TrendingUp';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { WorkoutStats } from '@/hooks/useWorkoutStats';
import { Pressable, View } from 'react-native';

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
}

function StatCard({ label, value, unit }: StatCardProps) {
  return (
    <Card variant="filled" className="flex-1 rounded-2xl px-4 py-4">
      <Text className="mb-1 text-xs font-bold uppercase tracking-widest opacity-50">
        {label}
      </Text>
      <View className="flex-row items-baseline gap-1">
        <Text className="text-base font-black">{value}</Text>
        {unit && (
          <Text className="text-xs font-bold uppercase tracking-widest opacity-50">
            {unit}
          </Text>
        )}
      </View>
    </Card>
  );
}

interface HistoryStatsOverviewProps {
  stats: WorkoutStats;
  onSeeAll: () => void;
}

export function HistoryStatsOverview({
  stats,
  onSeeAll,
}: HistoryStatsOverviewProps) {
  const volumeDisplay =
    stats.totalVolumeKg >= 1000
      ? `${(stats.totalVolumeKg / 1000).toFixed(1).replace(/\.0$/, '')}k`
      : String(stats.totalVolumeKg);

  return (
    <View className="mb-6">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-xs font-bold uppercase tracking-widest opacity-50">
          Overview
        </Text>
        <Pressable
          testID="see-all-stats"
          onPress={onSeeAll}
          className="flex-row items-center gap-1"
          hitSlop={8}
        >
          <TrendingUp size={14} className="text-typography-950" />
          <Text className="text-xs font-bold uppercase tracking-widest">
            All Stats
          </Text>
        </Pressable>
      </View>
      <View className="flex-row gap-3">
        <StatCard label="Workouts" value={stats.totalWorkouts} />
        <StatCard label="Streak" value={stats.currentStreak} unit="days" />
        <StatCard label="Volume" value={volumeDisplay} unit="kg" />
      </View>
    </View>
  );
}
