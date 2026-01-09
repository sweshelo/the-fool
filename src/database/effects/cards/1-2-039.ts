import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // ■カウンター・クロック
  // あなたがプレイヤーアタックを受けるたび
  onPlayerAttack: async (stack: StackWithCard): Promise<void> => {
    if (stack.target?.id === stack.processing.owner.id) {
      const filter = (unit: Unit) => unit.lv < 3;

      if (EffectHelper.isUnitSelectable(stack.core, filter, stack.processing.owner)) {
        await System.show(stack, 'カウンター・クロック', 'レベル+1');
        const [target] = await EffectHelper.pickUnit(
          stack,
          stack.processing.owner,
          filter,
          'レベルを上げるユニットを選択'
        );
        Effect.clock(stack, stack.processing, target, 1);
      }
    }
  },

  // ■極楽浄土
  // このユニットがクロックアップするたび
  onClockupSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const trashUnits = stack.processing.owner.trash.filter(card => card instanceof Unit);

    const [reviveCard] = EffectHelper.random(trashUnits, 1);
    const isUnitSelectable = EffectHelper.isUnitSelectable(
      stack.core,
      'owns',
      stack.processing.owner
    );

    const messages = [
      reviveCard ? '捨札から1枚回収' : undefined,
      isUnitSelectable ? 'ユニットを1体破壊' : undefined,
    ].filter(message => !!message);

    if (messages.length > 0) {
      await System.show(stack, '極楽浄土', messages.join('\n'));

      if (isUnitSelectable) {
        const [target] = await EffectHelper.pickUnit(
          stack,
          stack.processing.owner,
          'owns',
          '破壊するユニットを選択'
        );
        Effect.break(stack, stack.processing, target);
      }

      if (reviveCard) {
        Effect.move(stack, stack.processing, reviveCard, 'hand');
      }
    }
  },
};
