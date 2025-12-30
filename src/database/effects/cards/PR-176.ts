import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import type { Core } from '@/package/core/core';

export const effects: CardEffects = {
  // ■起動・愛熱のキスショット
  isBootable(core: Core, self: Unit): boolean {
    const myUnits = self.owner.field;
    const opponentUnits = self.owner.opponent.field;
    return myUnits.length > 0 && opponentUnits.length > 0;
  },

  async onBootSelf(stack: StackWithCard<Unit>): Promise<void> {
    const candidates = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id === stack.processing.owner.id,
      stack.processing.owner
    );

    const opponentCandidates = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id === stack.processing.owner.opponent.id,
      stack.processing.owner
    );

    if (candidates.length > 0 && opponentCandidates.length > 0) {
      await System.show(stack, '愛熱のキスショット', '選んだユニットに1000ダメージ');

      const [myTarget] = await EffectHelper.selectUnit(
        stack,
        stack.processing.owner,
        candidates,
        '自分のユニットを選択'
      );

      const [opponentTarget] = await EffectHelper.selectUnit(
        stack,
        stack.processing.owner,
        opponentCandidates,
        '相手のユニットを選択'
      );

      Effect.damage(stack, stack.processing, myTarget, 1000);
      Effect.damage(stack, stack.processing, opponentTarget, 1000);
    }
  },

  // ■選略・魅惑のキャノンショット
  async onDriveSelf(stack: StackWithCard<Unit>): Promise<void> {
    const handUnits = stack.processing.owner.hand.filter(card => card instanceof Unit);
    const fieldUnits = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id === stack.processing.owner.id,
      stack.processing.owner
    );

    const isOption1Available = handUnits.length > 0;
    const isOption2Available = fieldUnits.length > 0;

    if (!isOption1Available && !isOption2Available) return;

    // どちらかしか選べない場合は自動選択
    const [choice] = !isOption1Available
      ? ['2']
      : !isOption2Available
        ? ['1']
        : await System.prompt(stack, stack.processing.owner.id, {
            title: '選略・魅惑のキャノンショット',
            type: 'option',
            items: [
              { id: '1', description: '手札のユニットのレベル+1' },
              { id: '2', description: 'フィールドのユニットのレベル+1' },
            ],
          });

    if (choice === '1' && isOption1Available) {
      await System.show(stack, '魅惑のキャノンショット', '手札のユニットのレベル+1');
      const [target] = await EffectHelper.selectCard(
        stack,
        stack.processing.owner,
        handUnits,
        'レベルを上げるユニットを選択',
        1
      );
      if (target instanceof Unit) {
        Effect.clock(stack, stack.processing, target, 1);
      }
    } else if (choice === '2' && isOption2Available) {
      await System.show(stack, '魅惑のキャノンショット', 'フィールドのユニットのレベル+1');
      const [target] = await EffectHelper.selectUnit(
        stack,
        stack.processing.owner,
        fieldUnits,
        'レベルを上げるユニットを選択'
      );
      Effect.clock(stack, stack.processing, target, 1);
    }
  },
};
