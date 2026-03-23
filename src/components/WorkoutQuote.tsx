import { Text } from '@/components/ui/text';
import { cn } from '@/utils/styles';
import { useMemo } from 'react';

const QUOTES = [
  'Consistent routine is the foundation of cinematic progress.',
  'The only bad workout is the one that did not happen.',
  'Strength does not come from the body. It comes from the will.',
  'Your body can stand almost anything. It is your mind you have to convince.',
  'Push yourself because no one else is going to do it for you.',
  'Success is not given. It is earned in the gym, rep by rep.',
  'Discipline is choosing between what you want now and what you want most.',
];

interface WorkoutQuoteProps {
  className?: string;
}

export function WorkoutQuote({ className }: WorkoutQuoteProps) {
  const quote = useMemo(
    () => QUOTES[Math.floor(Math.random() * QUOTES.length)],
    [],
  );

  return (
    <Text className={cn('text-center text-sm italic opacity-60', className)}>
      &quot;{quote}&quot;
    </Text>
  );
}
