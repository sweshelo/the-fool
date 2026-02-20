import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, EffectTemplate } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // あなたのユニットがフィールドに出た時
  checkDrive: (stack: StackWithCard) => {
    return stack.target instanceof Unit && stack.processing.owner.id === stack.target.owner.id;
  },

  onDrive: async (stack: StackWithCard): Promise<void> => {
    const owner = stack.processing.owner;
    if (!(stack.target instanceof Unit)) return;

    const isGiantUnit = stack.target.catalog.species?.includes('巨人');
    const giantUnits = owner.field.filter(unit => unit.catalog.species?.includes('巨人'));

    await EffectHelper.combine(stack, [
      // 【巨人】ユニットがフィールドに出た時
      // あなたの【巨人】ユニットの基本BPを+2000する
      {
        title: '巨人の集落',
        description: '【巨人】ユニットの基本BP+2000',
        effect: () => {
          giantUnits.forEach(unit => {
            Effect.modifyBP(stack, stack.processing, unit, 2000, { isBaseBP: true });
          });
        },
        condition: isGiantUnit && giantUnits.length > 0,
      },
      // 【巨人】ユニット以外のユニットがフィールドに出た時
      // 【巨人】ユニットのカードを1枚ランダムで手札に加える。
      {
        title: '巨人の集落',
        description: '【巨人】を1枚引く',
        effect: () => EffectTemplate.reinforcements(stack, owner, { species: '巨人' }),
        condition: !isGiantUnit,
      },
    ]);
  },
};
