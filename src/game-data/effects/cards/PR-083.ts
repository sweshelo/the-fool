import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { PermanentEffect } from '../engine/permanent';

export const effects: CardEffects = {
  // 自身が召喚された時に発動する効果を記述
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(
      stack,
      '炎王獣の闘気',
      '【スピードムーブ】\n【無我の境地】\n【不屈】\n敵全体のBP-2000'
    );
    Effect.keyword(stack, stack.processing, stack.processing, '無我の境地');
    Effect.keyword(stack, stack.processing, stack.processing, '不屈');
    Effect.speedMove(stack, stack.processing);
  },

  onAttackSelf: async (stack: StackWithCard): Promise<void> => {
    const filter = (unit: Unit) =>
      unit.owner.id !== stack.processing.owner.id && unit.currentBP < unit.bp;
    if (EffectHelper.isUnitSelectable(stack.core, filter, stack.processing.owner)) {
      await System.show(stack, '炎王獣の大咆哮', 'ユニットを破壊\n1ライフダメージ');
      const [target] = await EffectHelper.pickUnit(
        stack,
        stack.processing.owner,
        filter,
        '破壊するユニットを選択して下さい'
      );
      Effect.break(stack, stack.processing, target, 'effect');
      Effect.modifyLife(stack, stack.processing, stack.processing.owner.opponent, -1);
    }
  },

  fieldEffect: (stack: StackWithCard) => {
    PermanentEffect.mount(stack.processing, {
      targets: ['opponents'],
      effect: (target, source) => {
        if (target instanceof Unit) {
          Effect.modifyBP(stack, stack.processing, target, -2000, { source });
        }
      },
      effectCode: '炎王獣の闘気',
    });
  },
};
