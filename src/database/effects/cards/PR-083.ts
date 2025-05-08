import type { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // 自身が召喚された時に発動する効果を記述
  onDriveSelf: async (stack: StackWithCard): Promise<void> => {
    await System.show(
      stack,
      '炎王獣の闘気',
      '【スピードムーブ】\n【無我の境地】\n【不屈】\n敵全体のBP-2000'
    );
    Effect.keyword(stack, stack.processing, stack.processing as Unit, '無我の境地');
    Effect.keyword(stack, stack.processing, stack.processing as Unit, '不屈');
    Effect.speedMove(stack, stack.processing as Unit);
  },

  onAttackSelf: async (stack: StackWithCard): Promise<void> => {
    const candidate = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id !== stack.processing.owner.id && unit.currentBP < unit.bp
    );
    if (candidate.length > 0) {
      await System.show(stack, '炎王獣の大咆哮', 'ユニットを破壊\n1ライフダメージ');
      const [target] = await System.prompt(stack, stack.processing.owner.id, {
        title: '破壊するユニットを選択',
        type: 'unit',
        items: candidate,
      });
      const unit = candidate.find(unit => unit.id === target);
      if (unit) {
        Effect.break(stack, stack.processing, unit, 'effect');
        stack.processing.owner.opponent.damage();
      }
    }
  },

  fieldEffect: (stack: StackWithCard) => {
    stack.processing.owner.opponent.field.forEach(unit => {
      if (!unit.delta.some(delta => delta.source?.unit === stack.processing.id)) {
        Effect.modifyBP(stack, stack.processing, unit, -2000, {
          source: { unit: stack.processing.id },
        });
      }
    });
  },
};
