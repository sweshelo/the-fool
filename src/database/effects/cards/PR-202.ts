import type { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // 自身が召喚された時に発動する効果を記述
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    if (
      stack.processing.owner.opponent.hand.length > 0 &&
      stack.processing.owner.hand.length < stack.core.room.rule.player.max.hand
    ) {
      await System.show(stack, 'イリシットレジャー', '対戦相手の手札を1枚作成');
      EffectHelper.random(stack.processing.owner.opponent.hand, 1).forEach(card => {
        const target = card.clone(stack.processing.owner);
        stack.processing.owner.hand.push(target);
      });
    }
  },

  onPlayerAttackSelf: async (stack: StackWithCard): Promise<void> => {
    const targets = stack.processing.owner.opponent.hand.filter(
      card => card.catalog.type === 'unit'
    ) as Unit[];
    if (targets.length > 0) {
      await System.show(stack, 'ギルティー・ロスト', '手札から【特殊召喚】\n【沈黙】を与える');
      await Promise.all(
        EffectHelper.random(targets, 1).map(async unit => {
          await Effect.summon(stack, stack.processing, unit);
          Effect.keyword(stack, stack.processing, unit, '沈黙');
        })
      );
    }
  },

  onTurnEnd: async (stack: StackWithCard): Promise<void> => {
    const filter = (unit: Unit) =>
      unit.owner.id !== stack.processing.owner.id && unit.hasKeyword('沈黙');
    if (
      stack.processing.owner.id === stack.core.getTurnPlayer().id &&
      stack.processing.owner.field.length <= 4 &&
      EffectHelper.isUnitSelectable(stack.core, filter, stack.processing.owner)
    ) {
      await System.show(stack, 'ギルティー・ロスト', '【沈黙】を持つユニットを【複製】し破壊');
      const [target] = await EffectHelper.pickUnit(
        stack,
        stack.processing.owner,
        filter,
        '【複製】して破壊するユニットを選択',
        1
      );
      await Effect.clone(stack, stack.processing, target, stack.processing.owner);
      Effect.break(stack, stack.processing, target, 'effect');
    }
  },
};
