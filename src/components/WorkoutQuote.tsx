import { Text } from '@/components/ui/text';
import { getWorkoutQuote } from '@/utils/workoutQuotes';
import { cn } from '@/utils/styles';
import { useMemo } from 'react';

interface WorkoutQuoteProps {
  className?: string;
}

export function WorkoutQuote({ className }: WorkoutQuoteProps) {
  const quote = useMemo(() => getWorkoutQuote(), []);

  return (
    <Text className={cn('text-center text-sm italic opacity-60', className)}>
      &quot;{quote}&quot;
    </Text>
  );
}
