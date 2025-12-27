import type { Stack } from '@/package/core/class/stack';
import type { Card } from '@/package/core/class/card/Card';
import type { Unit } from '@/package/core/class/card';
import type { Core } from '@/package/core/core';
import type {
  EventCheckHandlers,
  EventOnHandlers,
  EventOnHandlersWithSuffix,
  HANDLER_SUFFIXES,
} from './eventHandlers';

/**
 * A Stack with a guaranteed Card in the processing property
 * Used for card effect methods where we can guarantee processing is a Card
 */
export type StackWithCard<T extends Card = Card> = Stack & { processing: T };

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

// 全てのサフィックス付きハンドラーを展開
type AllSuffixHandlers = Partial<
  EventOnHandlersWithSuffix<OnEffectMethod, (typeof HANDLER_SUFFIXES)[number]>
>;

/**
 * Interface for the effects object exported by card effect files
 * Defines the structure and types for card effect methods
 */
export interface CardEffects
  extends Partial<EventCheckHandlers<CheckEffectMethod>>,
    Partial<EventOnHandlers<OnEffectMethod>>,
    AllSuffixHandlers {
  fieldEffect?: (stack: StackWithCard<Unit>) => void;
  isBootable?: (core: Core, self: Unit) => boolean;
  handEffect?: ((core: Core, self: Card) => void) | ((core: Core, self: Unit) => void);
}
