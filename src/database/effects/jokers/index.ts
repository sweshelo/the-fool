import { Hermit } from './the-hermit';
import { DeathOmega } from './death-omega';
import type { CardEffects } from '../classes/types';

export const jokerEffects: Record<string, CardEffects> = {
  ...Hermit,
  ...DeathOmega,
};
