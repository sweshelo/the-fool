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

  // ■ダメージブレイク
  // このユニットがクロックアップするたび
  onClockupSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const candidates = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id === stack.processing.owner.opponent.id,
      stack.processing.owner
    );

    if (candidates.length > 0) {
      await System.show(stack, 'ダメージブレイク', '5000ダメージ');
      const [target] = await EffectHelper.selectUnit(
        stack,
        stack.processing.owner,
        candidates,
        'ダメージを与えるユニットを選択'
      );
      Effect.damage(stack, stack.processing, target, 5000);
    }
  },
};
