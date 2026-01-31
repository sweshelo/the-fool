import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // カードが発動可能であるかを調べ、発動条件を満たしていれば true を、そうでなければ false を返す。
  checkDrive: (stack: StackWithCard) => {
    const target = stack.target;
    const owner = stack.processing.owner;
    const opponent = owner.opponent;
    if (!(target instanceof Unit)) return false;
    if (!(target.owner.id === opponent.id)) return false;

    return target.lv <= 2 || opponent.field.some(unit => unit.id === target.id);
  },

  // 実際の効果本体
  // 関数名に self は付かない
  onDrive: async (stack: StackWithCard): Promise<void> => {
    const target = stack.target;
    const owner = stack.processing.owner;
    const opponent = owner.opponent;
    if (!(target instanceof Unit)) return;

    switch (target.lv) {
      case 1:
      case 2: {
        await EffectHelper.combine(stack, [
          {
            title: '封札の死壊石',
            description: 'レベル+1',
            effect: () => Effect.clock(stack, stack.processing, target, 1),
            condition: opponent.field.some(unit => unit.id === target.id),
          },
          {
            title: '封札の死壊石',
            description: '捨札からユニットカードを回収',
            effect: () =>
              EffectHelper.random(owner.trash.filter(card => card instanceof Unit)).forEach(unit =>
                Effect.move(stack, stack.processing, unit, 'hand')
              ),
          },
        ]);
        break;
      }
      case 3: {
        await System.show(stack, '封札の死壊石', 'ユニットを破壊する');
        Effect.break(stack, stack.processing, target, 'effect');
        break;
      }
    }
  },
};
