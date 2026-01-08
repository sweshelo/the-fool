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
    if (
      EffectHelper.isUnitSelectable(stack.core, 'owns', stack.processing.owner) &&
      EffectHelper.isUnitSelectable(stack.core, 'opponents', stack.processing.owner)
    ) {
      await System.show(stack, '愛熱のキスショット', '選んだユニットに1000ダメージ');

      const [myTarget] = await EffectHelper.pickUnit(
        stack,
        stack.processing.owner,
        'owns',
        'ダメージを与えるユニットを選択して下さい'
      );

      const [opponentTarget] = await EffectHelper.pickUnit(
        stack,
        stack.processing.owner,
        'opponents',
        'ダメージを与えるユニットを選択して下さい'
      );

      Effect.damage(stack, stack.processing, myTarget, 1000);
      Effect.damage(stack, stack.processing, opponentTarget, 1000);
    }
  },

  // ■選略・魅惑のキャノンショット
  async onDriveSelf(stack: StackWithCard<Unit>): Promise<void> {
    const handUnits = stack.processing.owner.hand.filter(card => card instanceof Unit);

    const isOption1Available = handUnits.length > 0;
    const isOption2Available = EffectHelper.isUnitSelectable(
      stack.core,
      'owns',
      stack.processing.owner
    );

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
        'owns',
        'レベルを上げるユニットを選択'
      );
      Effect.clock(stack, stack.processing, target, 1);
    }
  },
};
