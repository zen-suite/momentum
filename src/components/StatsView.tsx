import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useWorkoutHistory } from '@/hooks/useWorkoutHistory';
import { WorkoutStats, useWorkoutStats } from '@/hooks/useWorkoutStats';
import { View } from 'react-native';
import { ScrollView } from 'react-native';

interface StatRowProps {
  label: string;
  value: string | number;
  unit?: string;
}

function StatRow({ label, value, unit }: StatRowProps) {
  return (
    <View className="min-h-[56px] flex-row items-center justify-between py-4">
      <Text className="text-sm font-semibold">{label}</Text>
      <View className="flex-row items-baseline gap-1">
        <Text className="text-base font-black">{value}</Text>
        {unit && (
          <Text className="text-xs font-bold uppercase tracking-widest opacity-50">
            {unit}
          </Text>
        )}
      </View>
    </View>
  );
}

interface StatSectionProps {
  title: string;
  children: React.ReactNode;
}

function StatSection({ title, children }: StatSectionProps) {
  return (
    <View className="mb-8">
      <Text className="mb-3 text-xs font-bold uppercase tracking-widest opacity-40">
        {title}
      </Text>
      <Card variant="filled" className="rounded-2xl px-4">
        {children}
      </Card>
    </View>
  );
}

function Divider() {
  return <View className="h-px bg-outline-200 opacity-15" />;
}

export interface StatsViewProps {
  stats: WorkoutStats;
}

export function StatsView({ stats }: StatsViewProps) {
  const volumeDisplay =
    stats.totalVolumeKg >= 1000
      ? `${(stats.totalVolumeKg / 1000).toFixed(1).replace(/\.0$/, '')}k`
      : String(stats.totalVolumeKg);

  return (
    <ScrollView
      contentContainerStyle={{ padding: 24, paddingBottom: 64 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="mb-10 mt-2">
        <Text className="text-4xl font-extrabold uppercase tracking-widest">
          Stats
        </Text>
      </View>

      <StatSection title="Activity">
        <StatRow label="Total Workouts" value={stats.totalWorkouts} />
        <Divider />
        <StatRow
          label="Current Streak"
          value={stats.currentStreak}
          unit="days"
        />
        <Divider />
        <StatRow label="This Week" value={stats.thisWeek} />
        <Divider />
        <StatRow label="This Month" value={stats.thisMonth} />
      </StatSection>

      <StatSection title="Volume">
        <StatRow label="Total Volume" value={volumeDisplay} unit="kg" />
        <Divider />
        <StatRow label="Total Sets" value={stats.totalSets} />
      </StatSection>

      <StatSection title="Favourites">
        <StatRow
          label="Most Frequent Workout"
          value={stats.mostFrequentWorkout ?? '—'}
        />
      </StatSection>
    </ScrollView>
  );
}

export function withStats(Component: typeof StatsView) {
  return function StatsContainer() {
    const { history } = useWorkoutHistory();
    const stats = useWorkoutStats(history);
    return <Component stats={stats} />;
  };
}

export default withStats(StatsView);
