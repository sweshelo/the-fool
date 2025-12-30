import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // ■カウンター・クロック
  // あなたがプレイヤーアタックを受けるたび
  checkPlayerAttack: (stack: StackWithCard): boolean => {
    return stack.source.id === stack.processing.owner.opponent.id;
  },

  onPlayerAttack: async (stack: StackWithCard): Promise<void> => {
    const candidates = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id === stack.processing.owner.id,
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
  },

  // ■雷神太鼓
  // このユニットがクロックアップするたび
  onClockupSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const usedUnits = [
      ...stack.processing.owner.field,
      ...stack.processing.owner.opponent.field,
    ].filter(unit => !unit.active);

    if (usedUnits.length > 0) {
      await System.show(stack, '雷神太鼓', '行動済ユニットに3000ダメージ');
      usedUnits.forEach(unit => {
        Effect.damage(stack, stack.processing, unit, 3000);
      });
    }
  },
};
