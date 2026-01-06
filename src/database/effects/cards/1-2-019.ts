import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // ■カウンター・クロック
  // あなたがプレイヤーアタックを受けるたび
  onPlayerAttack: async (stack: StackWithCard): Promise<void> => {
    if (stack.target?.id === stack.processing.owner.id) {
      const candidates = EffectHelper.candidate(
        stack.core,
        unit => unit.lv < 3,
        stack.processing.owner
      );

      if (candidates.length > 0) {
        await System.show(stack, 'カウンター・クロック', 'レベル+1');
        const [target] = await EffectHelper.selectUnit(
          stack,
          stack.processing.owner,
          candidates,
          'レベルを上げるユニットを選択'
        );
        Effect.clock(stack, stack.processing, target, 1);
      }
    }
  },

  // ■ふぃーりんぐたいむ
  // このユニットがクロックアップするたび
  onClockupSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const candidates = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id === stack.processing.owner.opponent.id,
      stack.processing.owner
    );

    if (candidates.length > 0) {
      await System.show(stack, 'ふぃーりんぐたいむ', '行動権を消費');
      const [target] = await EffectHelper.selectUnit(
        stack,
        stack.processing.owner,
        candidates,
        '行動権を消費するユニットを選択'
      );
      Effect.activate(stack, stack.processing, target, false);
    }
  },
};
