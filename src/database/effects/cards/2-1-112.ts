import { Unit } from '@/package/core/class/card';
import { Effect } from '../classes/effect';
import { System } from '../classes/system';
import type { CardEffects, StackWithCard } from '../classes/types';
import { EffectHelper } from '../classes/helper';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    const self = stack.processing;
    const owner = self.owner;
    const unitsToDestroy = stack.processing.owner.opponent.field.filter(
      unit => unit.currentBP > unit.bp
    );

    if (owner.hand.length === 0 || unitsToDestroy.length === 0) return;

    // 選択肢を表示
    const choices = [
      { id: '1', description: '効果なし' },
      { id: '2', description: '手札を2枚捨てる\nユニットを破壊' },
    ];

    const [response] = await System.prompt(stack, owner.id, {
      type: 'option',
      title: '選略・校則違反よ！',
      items: choices,
    });

    if (response === '2') {
      await System.show(stack, '選略・校則違反よ！', '手札を2枚捨てる\nユニットを破壊');

      // ランダムで2枚捨てる
      EffectHelper.random(owner.hand, 2).forEach(card => Effect.handes(stack, self, card));

      // BPが一時的に上昇している対戦相手のユニットを破壊
      unitsToDestroy.forEach(unit => Effect.break(stack, self, unit, 'effect'));
    }
  },
};
