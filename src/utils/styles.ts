import classnames, { type ArgumentArray } from 'classnames';
import { twMerge } from 'tailwind-merge';

export function cn(...args: ArgumentArray) {
  return twMerge(classnames(...args));
}
