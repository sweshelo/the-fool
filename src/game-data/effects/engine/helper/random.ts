import { helperShuffle } from './shuffle';

export function helperRandom<T>(targets: T[], number = 1): T[] {
  if (!Array.isArray(targets) || targets.length === 0 || number <= 0) return [];

  return helperShuffle(targets).slice(0, Math.min(number, targets.length));
}
