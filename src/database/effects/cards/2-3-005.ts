import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import master from '@/submodule/suit/catalog/catalog';

export const effects: CardEffects = {
  // 自身が召喚された時に発動する効果を記述
  onDriveSelf: async (stack: StackWithCard): Promise<void> => {
    if (EffectHelper.isUnitSelectable(stack.core, 'opponents', stack.processing.owner)) {
      await System.show(stack, 'ヘスティアのハピネスクッキング♪', '4000ダメージ');
      const [target1] = await EffectHelper.pickUnit(
        stack,
        stack.processing.owner,
        'opponents',
        'ダメージを与えるユニットを選択して下さい',
        1
      );
      const result1 = Effect.damage(stack, stack.processing, target1, 4000, 'effect');

      const filter = (unit: Unit) =>
        unit.id !== target1.id && unit.owner.id !== stack.processing.owner.id;
      if (result1 && EffectHelper.isUnitSelectable(stack.core, filter, stack.processing.owner)) {
        await System.show(stack, 'ヘスティアのハピネスクッキング♪', '3000ダメージ');
        const [target2] = await EffectHelper.pickUnit(
          stack,
          stack.processing.owner,
          filter,
          'ダメージを与えるユニットを選択して下さい',
          1
        );
        const result2 = Effect.damage(stack, stack.processing, target2, 3000, 'effect');

        if (result2) {
          await System.show(stack, 'ヘスティアのハピネスクッキング♪', '2000ダメージ');
          stack.processing.owner.opponent.field.forEach(unit =>
            Effect.damage(stack, stack.processing, unit, 2000, 'effect')
          );
        }
      }
    }
  },

  onTurnEnd: async (stack: StackWithCard): Promise<void> => {
    if (stack.processing.owner.hand.length < stack.core.room.rule.player.max.hand) {
      await System.show(stack, '笑顔のハートフルキッチン♪', 'ランダムな【魔導士】を1枚作成');
      const [target] = EffectHelper.random(
        Array.from(master.values()).filter(catalog => catalog.species?.includes('魔導士'))
      );

      if (target) Effect.make(stack, stack.processing.owner, target.id);
    }
  },
};
