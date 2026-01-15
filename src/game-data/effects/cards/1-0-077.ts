import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  //■アーマーブレイク
  //あなたのユニットがフィールドに出た時、対戦相手のユニットを1体選ぶ。それに3000ダメージを与える。

  checkDrive: (stack: StackWithCard): boolean => {
    const owner = stack.processing.owner;
    const selectCheck = EffectHelper.isUnitSelectable(stack.core, 'opponents', owner);

    const ownerCheck = stack.source.id === owner.id;

    return selectCheck && ownerCheck;
  },

  onDrive: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, 'アーマーブレイク', '対戦相手のユニットに3000ダメージ');

    const [target] = await EffectHelper.pickUnit(
      stack,
      stack.processing.owner,
      'opponents',
      'ダメージを与えるユニットを選択'
    );

    Effect.damage(stack, stack.processing, target, 3000);
  },
};
