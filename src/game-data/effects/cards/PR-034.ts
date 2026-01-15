import { Unit } from '@/package/core/class/card';
import { EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // カードが発動可能であるかを調べ、発動条件を満たしていれば true を、そうでなければ false を返す。
  checkDrive: (stack: StackWithCard): boolean => {
    const owner = stack.processing.owner;
    const target = stack.target instanceof Unit ? stack.target : undefined;
    const unitOwner = target?.owner;

    const isOwnersUnit = owner.id === unitOwner?.id;
    const isOceanUnit = target?.catalog.species?.includes('海洋');

    return (isOwnersUnit && isOceanUnit) ?? false;
  },

  // 実際の効果本体
  // 関数名に self は付かない
  onDrive: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, '海底の楽園', 'カードを2枚引く');
    const owner = stack.processing.owner;
    EffectHelper.repeat(2, () => EffectTemplate.draw(owner, stack.core));
  },
};
