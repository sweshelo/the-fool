import { Delta } from '@/package/core/class/delta';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import type { Unit } from '@/package/core/class/card';
import { Core } from '@/package/core';

export const effects: CardEffects = {
  // コスト減少（手札効果）
  handEffect(core: Core, self: Unit) {
    const owner = self.owner;
    const opponent = owner.opponent;
    if (owner.hand.includes(self) && opponent.field.length >= 2 && owner.field.length === 0) {
      if (!self.delta.find(delta => delta.source?.unit === self.id))
        self.delta.push(new Delta({ type: 'cost', value: -3 }, { source: { unit: self.id } }));
    } else {
      self.delta = self.delta.filter(delta => delta.source?.unit !== self.id);
    }
  },

  // フィールドに出た時: 相手ユニット1体破壊→自身の基本BP+破壊したユニットのBP
  async onDriveSelf(stack: StackWithCard<Unit>) {
    const self = stack.processing;
    const owner = self.owner;
    if (EffectHelper.isUnitSelectable(stack.core, 'opponents', stack.processing.owner)) {
      await System.show(
        stack,
        'わんわんどりーみん',
        'ユニットを破壊\n自身の基本BP+[破壊したユニットのBP]'
      );
      const [target] = await EffectHelper.pickUnit(
        stack,
        owner,
        'opponents',
        '破壊するユニットを選択'
      );
      const bp = target.currentBP;
      Effect.break(stack, self, target, 'effect');
      Effect.modifyBP(stack, self, self, bp, { isBaseBP: true });
    }
  },

  // 相手インターセプト効果発動時: 相手全ユニットの基本BP-1000
  async onIntercept(stack: StackWithCard<Unit>) {
    if (stack.processing.owner.id !== stack.source.id) {
      const opponent = stack.processing.owner.opponent;
      await System.show(stack, 'わんわんどりーみん', '基本BP-1000');
      for (const unit of opponent.field) {
        Effect.modifyBP(stack, stack.processing, unit, -1000, { isBaseBP: true });
      }
    }
  },
};
