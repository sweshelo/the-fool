import type { Unit } from '@/package/core/class/card';
import { EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // カードが発動可能であるかを調べ、発動条件を満たしていれば true を、そうでなければ false を返す。
  checkDrive: async (stack: StackWithCard): Promise<boolean> => {
    const owner = EffectHelper.owner(stack.core, stack.processing);
    const unitOwner = EffectHelper.owner(stack.core, stack.source);

    const isOwenersUnit = owner.id === unitOwner.id;
    const isOceanUnit = (stack.source as Unit).catalog.species!.includes('海洋');

    return isOwenersUnit && isOceanUnit;
  },

  // 実際の効果本体
  // 関数名に self は付かない
  onDrive: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, '海底の楽園', 'カードを2枚引く');
    const owner = EffectHelper.owner(stack.core, stack.processing);
    [...Array(2)].forEach(() => EffectTemplate.draw(owner, stack.core));
  },
};
