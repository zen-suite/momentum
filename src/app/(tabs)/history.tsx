import { HistoryListItem } from '@/components/HistoryListItem';
import { HistoryStatsOverview } from '@/components/HistoryStatsOverview';
import { TabScreenLayout } from '@/components/TabScreenLayout';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { useWorkoutHistory } from '@/hooks/useWorkoutHistory';
import { useWorkoutStats } from '@/hooks/useWorkoutStats';
import { WorkoutLog } from '@/types/workout';
import { useRouter } from 'expo-router';
import { FlatList, View } from 'react-native';

interface HistoryViewProps {
  history: WorkoutLog[];
  onSeeAllStats: () => void;
}

function HistoryView({ history, onSeeAllStats }: HistoryViewProps) {
  const stats = useWorkoutStats(history);
  const sorted = [...history].sort((a, b) => {
    const aTime = a.completedAt?.getTime() ?? 0;
    const bTime = b.completedAt?.getTime() ?? 0;
    return bTime - aTime;
  });

  return (
    <TabScreenLayout>
      <View className="mb-6">
        <Heading size="2xl" className="font-bold">
          History
        </Heading>
        <Text className="mt-1 text-xs font-semibold uppercase tracking-widest opacity-50">
          Your Training Record
        </Text>
      </View>

      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <HistoryListItem log={item} />}
        contentContainerStyle={{ gap: 12, paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <HistoryStatsOverview stats={stats} onSeeAll={onSeeAllStats} />
        }
        ListEmptyComponent={
          <View className="mt-4 items-center">
            <Text className="text-center text-sm opacity-50">
              No workouts logged yet. Complete a workout to see it here.
            </Text>
          </View>
        }
      />
    </TabScreenLayout>
  );
}

function withHistory(Component: typeof HistoryView) {
  return function HistoryContainer() {
    const { history } = useWorkoutHistory();
    const router = useRouter();
    return (
      <Component
        history={history}
        onSeeAllStats={() => router.push('/stats')}
      />
    );
  };
}

export default withHistory(HistoryView);
