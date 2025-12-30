import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // ■ブレイク・クロック
  // このユニット以外のあなたのユニットが破壊されるたび
  checkBreak: (stack: StackWithCard): boolean => {
    return (
      stack.target instanceof Unit &&
      stack.target.owner.id === stack.processing.owner.id &&
      stack.target.id !== stack.processing.id
    );
  },

  onBreak: async (stack: StackWithCard): Promise<void> => {
    const candidates = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id === stack.processing.owner.id,
      stack.processing.owner
    );

    if (candidates.length > 0) {
      await System.show(stack, 'ブレイク・クロック', 'レベル+1');
      const [target] = await EffectHelper.selectUnit(
        stack,
        stack.processing.owner,
        candidates,
        'レベルを上げるユニットを選択'
      );
      Effect.clock(stack, stack.processing, target, 1);
    }
  },

  // ■蒼炎のグロウアウト
  // このユニットがクロックアップした時
  onClockupSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const candidates = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id === stack.processing.owner.opponent.id && unit.lv >= 3,
      stack.processing.owner
    );

    if (candidates.length > 0) {
      await System.show(stack, '蒼炎のグロウアウト', 'レベル3以上のユニットを破壊');
      const [target] = await EffectHelper.selectUnit(
        stack,
        stack.processing.owner,
        candidates,
        '破壊するユニットを選択'
      );
      Effect.break(stack, stack.processing, target);
    }
  },
};
