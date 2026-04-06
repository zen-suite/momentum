import { MomentumLogo } from '@/components/MomentumLogo';
import { SideDrawer } from '@/components/SideDrawer';
import { ThemedView } from '@/components/ThemedView';
import Menu from '@/components/icons/Menu';
import { Text } from '@/components/ui/text';
import { useLeftEdgeSwipeToOpen } from '@/hooks/useLeftEdgeSwipeToOpen';
import { usePathname, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface TabScreenLayoutProps {
  children: React.ReactNode;
  headerRight?: React.ReactNode;
}

export function TabScreenLayout({
  children,
  headerRight,
}: TabScreenLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const openDrawer = useCallback(() => {
    setDrawerOpen(true);
  }, []);
  const panHandlers = useLeftEdgeSwipeToOpen({
    onOpen: openDrawer,
    isDisabled: drawerOpen,
  });

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      className="flex-1 bg-background-0"
      {...panHandlers}
    >
      <ThemedView className="flex-1 px-4">
        <View className="mb-4 flex-row items-center py-4">
          <Pressable
            testID="hamburger-button"
            onPress={openDrawer}
            hitSlop={8}
          >
            <Menu size={24} className="text-primary" />
          </Pressable>
          <View
            className="absolute left-0 right-0 flex-row items-center justify-center gap-2"
            pointerEvents="none"
          >
            <MomentumLogo size={24} />
            <Text className="text-xl font-bold tracking-widest">Momentum</Text>
          </View>
          {headerRight && <View className="ml-auto">{headerRight}</View>}
        </View>
        {children}
      </ThemedView>

      <SideDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onNavigate={(route) => router.navigate(route as never)}
        activeRoute={pathname}
      />
    </SafeAreaView>
  );
}
