import { Unit } from '@/package/core/class/card';
import { EffectHelper, System, Effect } from '..';
import type { StackWithCard } from '../classes/types';
import { Delta } from '@/package/core/class/delta';

export const effects = {
  // 自身が召喚された時に発動する効果を記述
  onDriveSelf: async (stack: StackWithCard) => {
    const opponent = stack.processing.owner.opponent;
    const targets = [...opponent.field, ...opponent.hand, ...opponent.trigger];
    if (targets.length > 0 && stack.processing.owner.purple) {
      await System.show(stack, '破壊光線', 'ランダムに消滅');
      EffectHelper.random(targets, stack.processing.owner.purple).forEach(card => {
        if (card instanceof Unit && opponent.field.some(unit => unit.id === card.id)) {
          Effect.delete(stack, stack.processing, card);
        } else {
          Effect.move(stack, stack.processing, card, 'delete');
        }
      });

      await Effect.modifyPurple(
        stack,
        stack.processing,
        stack.processing.owner,
        -stack.processing.owner.purple
      );
    }
  },

  handEffect: (core: unknown, self: Unit) => {
    if (!self.delta.some(delta => delta.source?.unit === self.id)) {
      if (!self.owner.purple || self.owner.purple <= 3)
        self.delta.push(new Delta({ type: 'cost', value: -1 }, { source: { unit: self.id } }));
    } else {
      if (self.owner.purple && self.owner.purple > 3)
        self.delta = self.delta.filter(delta => delta.source?.unit !== self.id);
    }
  },

  onModifyPurple: async (stack: StackWithCard<Unit>) => {
    if (
      stack.option?.type === 'purple' &&
      stack.option.value > 0 &&
      stack.processing.owner.id === stack.target?.id
    ) {
      await System.show(stack, '破壊光線', '自身以外に1000ダメージ');
      EffectHelper.exceptSelf(stack.core, stack.processing, unit =>
        Effect.damage(stack, stack.processing, unit, 1000, 'effect')
      );
    }
  },
};
