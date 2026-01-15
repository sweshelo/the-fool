import type { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // 自身が召喚された時に発動する効果を記述
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, '胎動＆固着', '手札に戻らない\nコスト3以下に【狂戦士】を与える');
    Effect.keyword(stack, stack.processing, stack.processing, '固着');
  },

  onWinSelf: async (stack: StackWithCard): Promise<void> => {
    if (EffectHelper.isUnitSelectable(stack.core, 'opponents', stack.processing.owner)) {
      await System.show(stack, '剪定', '3000ダメージ');
      const [target] = await EffectHelper.pickUnit(
        stack,
        stack.processing.owner,
        'opponents',
        'ダメージを与えるユニットを選択して下さい'
      );
      Effect.damage(stack, stack.processing, target, 3000, 'effect');
    }
  },

  onClockup: async (stack: StackWithCard<Unit>): Promise<void> => {
    const targets = stack.processing.owner.opponent.field;

    if (stack.processing.lv === 3) {
      if (targets.length > 0) {
        await System.show(stack, '剪定', '敵全体に[対戦相手の手札×2000]ダメージ\n自身のレベル-2');
        targets.forEach(unit =>
          Effect.damage(
            stack,
            stack.processing,
            unit,
            stack.processing.owner.opponent.hand.length * 2000
          )
        );
      } else {
        await System.show(stack, '剪定', '自身のレベル-2');
      }
      Effect.clock(stack, stack.processing, stack.processing, -2);
    }
  },

  fieldEffect: (stack: StackWithCard) => {
    stack.processing.owner.opponent.field.forEach(unit => {
      if (
        !unit.delta.some(delta => delta.source?.unit === stack.processing.id) &&
        unit.catalog.cost <= 3
      )
        Effect.keyword(stack, stack.processing, unit, '狂戦士', {
          source: { unit: stack.processing.id },
        });
    });
  },
};
