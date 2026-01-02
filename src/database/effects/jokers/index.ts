import { Death } from './death';
import { DeathOmega } from './death-omega';
import { Justice } from './justice';
import { Strength } from './strength';
import { Chariot } from './the-chariot';
import { Devil } from './the-devil';
import { Emperor } from './the-emperor';
import { Empress } from './the-empress';
import { Hermit } from './the-hermit';
import { HighPriestess } from './the-high-priestess';
import { Lovers } from './the-lovers';
import { Magician } from './the-magician';
import { Moon } from './the-moon';
import { Star } from './the-star';
import { Tower } from './the-tower';
import type { CardEffects } from '../classes/types';

export const jokerEffects: Record<string, CardEffects | undefined> = {
  ...Death,
  ...DeathOmega,
  ...Justice,
  ...Strength,
  ...Chariot,
  ...Devil,
  ...Emperor,
  ...Empress,
  ...Hermit,
  ...HighPriestess,
  ...Lovers,
  ...Magician,
  ...Moon,
  ...Star,
  ...Tower,
};
