import type { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // カードが発動可能であるかを調べ、発動条件を満たしていれば true を、そうでなければ false を返す。
  checkDrive: (stack: StackWithCard) => {
    const isSelectable =
      EffectHelper.candidate(
        stack.core,
        unit => unit.owner.id === stack.processing.owner.id,
        stack.processing.owner
      ).length > 0 &&
      EffectHelper.candidate(
        stack.core,
        unit => unit.owner.id === stack.processing.owner.opponent.id,
        stack.processing.owner
      ).length > 0;
    const isOwnUnitDriven = stack.source.id === stack.processing.owner.id;

    return isSelectable && isOwnUnitDriven;
  },

  // 実際の効果本体
  // 関数名に self は付かない
  onDrive: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, '終わらない戦い', '【狂戦士】と【強制防御】を与える');
    const candidatesSet = [
      EffectHelper.candidate(
        stack.core,
        unit => unit.owner.id === stack.processing.owner.id,
        stack.processing.owner
      ),
      EffectHelper.candidate(
        stack.core,
        unit => unit.owner.id === stack.processing.owner.opponent.id,
        stack.processing.owner
      ),
    ];

    const targets: (Unit | undefined)[] = [];
    for (const candidates of candidatesSet) {
      const [unitId] = await System.prompt(stack, stack.processing.owner.id, {
        type: 'unit',
        title: '【狂戦士】【強制防御】を与えるユニットを選択',
        items: candidates,
      });
      targets.push(candidates.find(unit => unit.id === unitId));
    }

    targets
      .filter(v => v !== undefined)
      .forEach(unit => {
        Effect.keyword(stack, stack.processing, unit, '強制防御');
        Effect.keyword(stack, stack.processing, unit, '狂戦士');
      });
  },
};
