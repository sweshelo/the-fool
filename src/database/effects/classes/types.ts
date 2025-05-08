import type { Stack } from '@/package/core/class/stack';
import type { Card } from '@/package/core/class/card/Card';
import type { Unit } from '@/package/core/class/card';
import type { Core } from '@/package/core/core';

/**
 * A Stack with a guaranteed Card in the processing property
 * Used for card effect methods where we can guarantee processing is a Card
 */
export type StackWithCard<T = Card> = Stack & { processing: T };

/**
 * Type for card effect methods starting with "on"
 * These methods return Promise<void>
 */
export type OnEffectMethod =
  | ((stack: StackWithCard<Unit>) => Promise<void>)
  | ((stack: StackWithCard<Card>) => Promise<void>);

/**
 * Type for card effect methods starting with "check"
 * These methods return Promise<boolean>
 */
export type CheckEffectMethod = (stack: StackWithCard<Card>) => Promise<boolean> | boolean;

/**
 * Interface for the effects object exported by card effect files
 * Defines the structure and types for card effect methods
 */
export interface CardEffects {
  [key: `on${string}`]: OnEffectMethod;
  [key: `check${string}`]: CheckEffectMethod;
  fieldEffect?: (stack: StackWithCard) => void;
  isBootable?: (core: Core, self: Unit) => boolean;
  handEffect?: ((core: Core, self: Card) => void) | ((core: Core, self: Unit) => void);
}
