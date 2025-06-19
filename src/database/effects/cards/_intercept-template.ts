import { EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // カードが発動可能であるかを調べ、発動条件を満たしていれば true を、そうでなければ false を返す。
  // (たとえどのような条件でも発動するカードであったとしても) onXXX に対応する check関数が必ず必要。

  // 対戦相手のCPが効果によって増加した時、あなたは[増加したCP×1]枚カードを引く
  checkModifyCP: (stack: StackWithCard) => {
    return (
      stack.target?.id === stack.processing.owner.opponent.id &&
      stack.option?.type === 'cp' &&
      stack.option.value > 0
    );
  },

  // 実際の効果本体
  // 関数名に self は付かない
  onModifyCP: async (stack: StackWithCard): Promise<void> => {
    const count = stack.option?.type === 'cp' ? stack.option.value : 0;

    if (count > 0) {
      await System.show(stack, '効果I', '[増加したCP×1]枚カードを引く');
      [...Array(count)].forEach(() => EffectTemplate.draw(stack.processing.owner, stack.core));
    }
  },
};
