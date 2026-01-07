import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // カードが発動可能であるかを調べ、発動条件を満たしていれば true を、そうでなければ false を返す。
  checkDrive: (stack: StackWithCard) => {
    const oppCandidateFilter = (unit: Unit) => unit.owner.id !== stack.processing.owner.id;
    const oppCandidate_selectable = EffectHelper.isUnitSelectable(
      stack.core,
      oppCandidateFilter,
      stack.processing.owner
    );
    const ownCandidateFilter = (unit: Unit) => unit.owner.id === stack.processing.owner.id;
    const ownCandidate_selectable = EffectHelper.isUnitSelectable(
      stack.core,
      ownCandidateFilter,
      stack.processing.owner
    );

    const isChoice1Avail = stack.processing.owner.cp.current >= 1 && oppCandidate_selectable;
    const isChoice2Avail = ownCandidate_selectable;

    return (
      stack.target instanceof Unit &&
      stack.processing.owner.id === stack.target.owner.id &&
      (isChoice1Avail || isChoice2Avail)
    );
  },

  // 実際の効果本体
  // 関数名に self は付かない
  onDrive: async (stack: StackWithCard): Promise<void> => {
    const oppCandidateFilter = (unit: Unit) => unit.owner.id !== stack.processing.owner.id;
    const oppCandidate_selectable = EffectHelper.isUnitSelectable(
      stack.core,
      oppCandidateFilter,
      stack.processing.owner
    );
    const ownCandidateFilter = (unit: Unit) => unit.owner.id === stack.processing.owner.id;
    const ownCandidate_selectable = EffectHelper.isUnitSelectable(
      stack.core,
      ownCandidateFilter,
      stack.processing.owner
    );

    const isChoice1Avail = stack.processing.owner.cp.current >= 1 && oppCandidate_selectable;
    const isChoice2Avail = ownCandidate_selectable;

    let choice: string | undefined = undefined;
    if (isChoice1Avail && isChoice2Avail) {
      [choice] = await System.prompt(stack, stack.processing.owner.id, {
        title: '選略・モノクローム',
        type: 'option',
        items: [
          { id: '1', description: 'CP-1\n手札に戻す' },
          { id: '2', description: '【沈黙効果耐性】を与える' },
        ],
      });
    } else {
      if (isChoice1Avail) choice = '1';
      if (isChoice2Avail) choice = '2';
    }

    switch (choice) {
      case '1': {
        await System.show(stack, '選略・モノクローム', 'CP-1\n手札に戻す');
        const [target] = await EffectHelper.pickUnit(
          stack,
          stack.processing.owner,
          oppCandidateFilter,
          '手札に戻すユニットを選択して下さい'
        );
        Effect.modifyCP(stack, stack.processing, stack.processing.owner, -1);
        Effect.bounce(stack, stack.processing, target, 'hand');
        break;
      }

      case '2': {
        await System.show(stack, '選略・モノクローム', '【沈黙効果耐性】を与える');
        const [target] = await EffectHelper.pickUnit(
          stack,
          stack.processing.owner,
          ownCandidateFilter,
          '【沈黙効果耐性】を与えるユニットを選択して下さい'
        );
        Effect.keyword(stack, stack.processing, target, '沈黙効果耐性');
        break;
      }
    }
  },
};
