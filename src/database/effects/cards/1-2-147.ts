import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // カードが発動可能であるかを調べ、発動条件を満たしていれば true を、そうでなければ false を返す。
  checkDrive: (stack: StackWithCard) => {
    return stack.processing.owner.id !== stack.source.id;
  },

  // 実際の効果本体
  // 関数名に self は付かない
  onDrive: async (stack: StackWithCard): Promise<void> => {
    if (!(stack.target instanceof Unit)) return;

    switch (stack.target.lv) {
      case 1:
      case 2: {
        await System.show(stack, '封札の死壊石', 'レベル+1\n捨札からユニットカードを回収');
        Effect.clock(stack, stack.processing, stack.target, 1);
        EffectHelper.random(
          stack.processing.owner.trash.filter(card => card instanceof Unit)
        ).forEach(unit => Effect.move(stack, stack.processing, unit, 'hand'));
        break;
      }
      case 3: {
        await System.show(stack, '封札の死壊石', 'ユニットを破壊する');
        Effect.break(stack, stack.processing, stack.target, 'effect');
        break;
      }
    }
  },
};
