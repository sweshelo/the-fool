import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import type { Core } from '@/package/core/core';

export const effects: CardEffects = {
  // ■起動・愛熱のキスショット
  isBootable(core: Core, self: Unit): boolean {
    const myUnits = self.owner.field;
    const opponentUnits = self.owner.opponent.field;
    return myUnits_selectable && opponentUnits_selectable;
  },

  async onBootSelf(stack: StackWithCard<Unit>): Promise<void> {
    const filter = (unit: Unit) => unit.owner.id === stack.processing.owner.id;
    const filter = (unit: Unit) => unit.owner.id === stack.processing.owner.opponent.id;
    if (
      EffectHelper.isSelectable(stack.core, filter, stack.processing.owner) &&
      opponentCandidates_selectable
    ) {
      await System.show(stack, '愛熱のキスショット', '選んだユニットに1000ダメージ');

      const [myTarget] = await EffectHelper.pickUnit(
        stack,
        stack.processing.owner,
        filter,
        '自分のユニットを選択'
      );

      const [opponentTarget] = await EffectHelper.pickUnit(
        stack,
        stack.processing.owner,
        filter,
        '相手のユニットを選択'
      );

      Effect.damage(stack, stack.processing, myTarget, 1000);
      Effect.damage(stack, stack.processing, opponentTarget, 1000);
    }
  },

  // ■選略・魅惑のキャノンショット
  async onDriveSelf(stack: StackWithCard<Unit>): Promise<void> {
    const handUnits = stack.processing.owner.hand.filter(card => card instanceof Unit);
    const filter = (unit: Unit) => unit.owner.id === stack.processing.owner.id;
    const isOption1Available = handUnits_selectable;
    const isOption2Available = fieldUnits_selectable;

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
      const [target] = await EffectHelper.pickUnit(
        stack,
        stack.processing.owner,
        filter,
        'レベルを上げるユニットを選択'
      );
      Effect.clock(stack, stack.processing, target, 1);
    }
  },
};
