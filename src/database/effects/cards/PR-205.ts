import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // カードが発動可能であるかを調べ、発動条件を満たしていれば true を、そうでなければ false を返す。
  checkDrive: (stack: StackWithCard) => {
    const oppCandidate = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id !== stack.processing.owner.id,
      stack.processing.owner
    );
    const ownCandidate = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id === stack.processing.owner.id,
      stack.processing.owner
    );

    const isChoice1Avail = stack.processing.owner.cp.current >= 1 && oppCandidate.length > 0;
    const isChoice2Avail = ownCandidate.length > 0;

    return (
      stack.target instanceof Unit &&
      stack.processing.owner.id === stack.target.owner.id &&
      (isChoice1Avail || isChoice2Avail)
    );
  },

  // 実際の効果本体
  // 関数名に self は付かない
  onDrive: async (stack: StackWithCard): Promise<void> => {
    const oppCandidate = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id !== stack.processing.owner.id,
      stack.processing.owner
    );
    const ownCandidate = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id === stack.processing.owner.id,
      stack.processing.owner
    );

    const isChoice1Avail = stack.processing.owner.cp.current >= 1 && oppCandidate.length > 0;
    const isChoice2Avail = ownCandidate.length > 0;

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
        const [target] = await EffectHelper.selectUnit(
          stack,
          stack.processing.owner,
          oppCandidate,
          '手札に戻すユニットを選択して下さい'
        );
        Effect.modifyCP(stack, stack.processing, stack.processing.owner, -1);
        Effect.bounce(stack, stack.processing, target, 'hand');
        break;
      }

      case '2': {
        const [target] = await EffectHelper.selectUnit(
          stack,
          stack.processing.owner,
          ownCandidate,
          '【沈黙効果耐性】を与えるユニットを選択して下さい'
        );
        Effect.keyword(stack, stack.processing, target, '沈黙効果耐性');
        break;
      }
    }
  },
};
