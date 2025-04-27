import type { Stack } from '@/package/core/class/stack';
import type { Card } from '@/package/core/class/card/Card';
import type { Unit } from '@/package/core/class/card';

/**
 * A Stack with a guaranteed Card in the processing property
 * Used for card effect methods where we can guarantee processing is a Card
 */
export type StackWithCard = Stack & { processing: Card };
export type StackWithUnit = Stack & { processing: Unit };

/**
 * Type for card effect methods starting with "on"
 * These methods return Promise<void>
 */
export type OnEffectMethod = (stack: StackWithCard) => Promise<void>;

/**
 * Type for card effect methods starting with "check"
 * These methods return Promise<boolean>
 */
export type CheckEffectMethod = (stack: StackWithCard) => Promise<boolean> | boolean;

/**
 * Interface for the effects object exported by card effect files
 * Defines the structure and types for card effect methods
 */
export interface CardEffects {
  [key: `on${string}`]: OnEffectMethod;
  [key: `check${string}`]: CheckEffectMethod;
}
