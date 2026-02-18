import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  //■憤怒の炎
  //このユニットがフィールドに出た時、対戦相手のユニット全体に3000ダメージを与える。
  //■ダメージブレイク
  //このユニットがプレイヤーアタックに成功した時、対戦相手のユニットを1体選ぶ。それに7000ダメージを与える

  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const opponent = stack.processing.owner.opponent;
    if (opponent.field.length === 0) {
      return;
    }

    await System.show(stack, '憤怒の炎', '対戦相手のユニット全体に3000ダメージ');

    //対戦相手のユニット全体に3000ダメージを与える
    for (const unit of opponent.field) {
      Effect.damage(stack, stack.processing, unit, 3000);
    }
  },

  onPlayerAttackSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;

    if (!EffectHelper.isUnitSelectable(stack.core, 'opponents', owner)) {
      return;
    }

    await System.show(stack, 'ダメージブレイク', '対戦相手のユニットに7000ダメージ');

    const [target] = await EffectHelper.pickUnit(
      stack,
      owner,
      'opponents',
      'ダメージを与えるユニットを選択'
    );

    Effect.damage(stack, stack.processing, target, 7000);
  },
};
