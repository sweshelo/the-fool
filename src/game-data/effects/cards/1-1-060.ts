import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // チェック
  checkDrive: (stack: StackWithCard) => {
    return stack.target instanceof Unit && stack.target.owner.id === stack.processing.owner.id;
  },

  // あなたのユニットがフィールドに出た時、【精霊】ユニットのカードを1枚ランダムで手札に加える。
  onDrive: async (stack: StackWithCard) => {
    await System.show(stack, '世界樹の恵み', '【精霊】を1枚引く');
    EffectTemplate.reinforcements(stack, stack.processing.owner, {
      species: '精霊',
    });
  },

  // あなたの【精霊】ユニットがアタックした時、対戦相手のユニットを1体選ぶ。それの行動権を消費する。
  checkAttack: (stack: StackWithCard) => {
    return (
      (stack.target instanceof Unit &&
        stack.target.owner.id === stack.processing.owner.id &&
        stack.target.catalog.species?.includes('精霊') &&
        EffectHelper.isUnitSelectable(stack.core, 'opponents', stack.processing.owner)) ??
      false
    );
  },

  onAttack: async (stack: StackWithCard) => {
    await System.show(stack, '世界樹の恵み', '行動権を消費');
    const [target] = await EffectHelper.pickUnit(
      stack,
      stack.processing.owner,
      'opponents',
      '行動権を消費するユニットを選んでください',
      1
    );

    Effect.activate(stack, stack.processing, target, false);
  },
};
