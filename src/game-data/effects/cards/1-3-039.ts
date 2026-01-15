import { Card } from '@/package/core/class/card';
import type { CardEffects, StackWithCard } from '../schema/types';
import { System } from '../engine/system';
import { EffectHelper } from '../engine/helper';
import { EffectTemplate } from '../engine/templates';

export const effects: CardEffects = {
  checkHandes: stack =>
    stack.source instanceof Card &&
    stack.target instanceof Card &&
    stack.source.owner.id !== stack.target.owner.id &&
    stack.target.owner.id === stack.processing.owner.id,
  onHandes: async (stack: StackWithCard) => {
    await System.show(stack, '謀略の祝杯', 'カードを3枚引く');
    EffectHelper.repeat(3, () => EffectTemplate.draw(stack.processing.owner, stack.core));
  },
};
