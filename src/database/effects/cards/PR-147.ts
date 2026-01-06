import { Unit } from '@/package/core/class/card';
import { Effect, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  //■VIP待遇
  //あなたのコスト6以上のユニットがフィールドに出た時、あなたはカードを1枚引く。あなたのCPを+1する。

  //インターセプト条件確認
  checkDrive: (stack: StackWithCard): boolean => {
    //ユニットかつ、コスト6以上かつ、効果の所有者のユニットであることを確認
    return (
      stack.target instanceof Unit &&
      stack.target.catalog.cost >= 6 &&
      stack.processing.owner.id === stack.target.owner.id
    );
  },

  onDrive: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;

    await System.show(stack, 'VIP待遇', 'カードを1枚引く\nCP+1');
    EffectTemplate.draw(owner, stack.core);
    Effect.modifyCP(stack, stack.processing, owner, 1);
  },
};
