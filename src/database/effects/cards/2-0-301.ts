import { Unit } from '@/package/core/class/card';
import { EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // ■募獣
  // このユニット以外のあなたの【獣】ユニットがフィールドに出た時、【獣】ユニットのカードを1枚ランダムで手札に加える。

  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    if (
      stack.target instanceof Unit &&
      stack.target.catalog.species?.includes('獣') // 獣ユニット
    ) {
      await System.show(stack, '募獣', '【獣】ユニットを1枚引く');
      EffectTemplate.reinforcements(stack, stack.processing.owner, { species: '獣' });
    }
  },

  // ユニット召喚時の効果
  onDrive: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;

    // 自分の獣ユニットが召喚された時のみ発動
    if (
      stack.target instanceof Unit &&
      stack.target.owner.id === owner.id &&
      stack.target.id !== stack.processing.id && // 自分自身以外
      stack.target.catalog.species?.includes('獣') // 獣ユニット
    ) {
      await System.show(stack, '募獣', '【獣】ユニットを1枚引く');
      EffectTemplate.reinforcements(stack, stack.processing.owner, { species: '獣' });
    }
  },
};
