import type { Card, Unit } from '@/package/core/class/card';
import { EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // カードが発動可能であるかを調べ、発動条件を満たしていれば true を、そうでなければ false を返す。
  checkDrive: (stack: StackWithCard): boolean => {
    const owner = stack.processing.owner;
    const unitOwner = (stack.target as Card).owner;

    const isOwnersUnit = owner.id === unitOwner.id;
    const isOceanUnit = (stack.target as Unit).catalog.species!.includes('海洋');

    return isOwnersUnit && isOceanUnit;
  },

  // 実際の効果本体
  // 関数名に self は付かない
  onDrive: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, '海底の楽園', 'カードを2枚引く');
    const owner = stack.processing.owner;
    [...Array(2)].forEach(() => EffectTemplate.draw(owner, stack.core));
  },
};
