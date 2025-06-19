import { Color } from '@/submodule/suit/constant/color';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  // カードが発動可能であるかを調べ、発動条件を満たしていれば true を、そうでなければ false を返す。
  checkDrive: (stack: StackWithCard): boolean => {
    const owner = stack.processing.owner;
    const colors = Array.from(new Set(owner.field.map(card => card.catalog.color)));
    return (
      owner.id === stack.source.id && colors.includes(Color.GREEN) && colors.includes(Color.PURPLE)
    );
  },

  // 実際の効果本体
  // 関数名に self は付かない
  onDrive: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, '未知との遭遇', '基本BP+2000\nCP+1\n紫ゲージ+1');
    const owner = stack.processing.owner;
    const target = stack.target;

    if (!(target instanceof Unit)) throw new Error('ユニットでないターゲットが渡されました');

    Effect.modifyBP(stack, stack.processing, target, 2000, { isBaseBP: true });
    Effect.modifyCP(stack, stack.processing, owner, 1);
    await Effect.modifyPurple(stack, stack.processing, owner, 1);
  },
};
