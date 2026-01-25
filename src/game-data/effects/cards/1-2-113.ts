import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { PermanentEffect } from '../engine/permanent';
import { Color } from '@/submodule/suit/constant/color';

export const effects: CardEffects = {
  // 青属性の【珍獣】ユニットのBPを+1000する。
  // 青属性以外の【珍獣】ユニットのBPを-1000する
  fieldEffect: (stack: StackWithCard<Unit>): void => {
    PermanentEffect.mount(stack.processing, {
      targets: ['both'],
      effect: (unit, source) => {
        if (unit instanceof Unit && unit.catalog.species?.includes('珍獣')) {
          if (unit.catalog.color == Color.BLUE) {
            Effect.modifyBP(stack, stack.processing, unit, 1000, { source });
          } else {
            Effect.modifyBP(stack, stack.processing, unit, -1000, { source });
          }
        }
      },
      effectCode: 'どくどくフィールド',
    });
  },

  //このユニットが効果によって破壊された時
  onBreakSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    if (stack.option?.type !== 'break' || stack.option.cause !== 'effect') return;

    const owner = stack.processing.owner;
    //あなたのフィールドにユニットが4体以下の場合
    if (owner.field.length <= 4) {
      //あなたの捨札にある進化ユニット以外の青属性の【珍獣】ユニットをランダムで1体【特殊召喚】する
      const targets = owner.trash.filter(
        unit =>
          unit instanceof Unit &&
          unit.catalog.color === Color.BLUE &&
          unit.catalog.species?.includes('珍獣') &&
          unit.catalog.type === 'unit'
      );
      if (targets.length > 0) {
        await System.show(stack, '友を訪ねて', '青属性の【珍獣】ユニットを【特殊召喚】');
        const [target] = EffectHelper.random(targets);
        if (target instanceof Unit) {
          await Effect.summon(stack, stack.processing, target);
        }
      }
    }
  },
};
