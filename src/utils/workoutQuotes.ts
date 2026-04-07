const QUOTES = [
  'Consistent routine is the foundation of cinematic progress.',
  'The only bad workout is the one that did not happen.',
  'Strength does not come from the body. It comes from the will.',
  'Your body can stand almost anything. It is your mind you have to convince.',
  'Push yourself because no one else is going to do it for you.',
  'Success is not given. It is earned in the gym, rep by rep.',
  'Discipline is choosing between what you want now and what you want most.',
];

function hashSeed(seed: string): number {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }
  return hash;
}

export function getWorkoutQuote(seed?: string): string {
  if (!seed) {
    return QUOTES[Math.floor(Math.random() * QUOTES.length)];
  }

  return QUOTES[hashSeed(seed) % QUOTES.length];
}

export function getWorkoutQuotes(): string[] {
  return QUOTES;
}
