import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import type { Core } from '@/package/core/core';
import { Color } from '@/submodule/suit/constant/color';

export const effects: CardEffects = {
  // ■起動・殺戮と破壊の演舞
  isBootable(core: Core, self: Unit): boolean {
    // CP1以上かつBP一時減少中の相手ユニットがいるか
    const hasCP = self.owner.cp.current >= 1;
    const targets = self.owner.opponent.field.filter(unit => unit.bp > unit.currentBP);
    return hasCP && targets.length > 0;
  },

  async onBootSelf(stack: StackWithCard<Unit>) {
    const self = stack.processing;
    const owner = self.owner;
    const opponent = owner.opponent;
    const targets = opponent.field.filter(unit => unit.bp > unit.currentBP);
    if (owner.cp.current >= 1 && targets.length > 0) {
      await System.show(stack, '殺戮と破壊の演舞', 'CP-1\nBP減少中の敵ユニット1体を破壊');
      const [target] = await EffectHelper.selectUnit(
        stack,
        owner,
        targets,
        '破壊するユニットを選択'
      );
      Effect.modifyCP(stack, self, owner, -1);
      Effect.break(stack, self, target, 'effect');
    }
  },

  // ■爆神鼓舞
  async onDriveSelf(stack: StackWithCard<Unit>) {
    const self = stack.processing;
    const owner = self.owner;
    // 赤属性ユニット
    const redUnits = owner.field.filter(unit => unit.catalog.color === Color.RED);
    if (redUnits.length > 0) {
      await System.show(stack, '爆神鼓舞', 'レベル+2');
      const [target] = await EffectHelper.selectUnit(
        stack,
        owner,
        redUnits,
        'レベルを上げるユニットを選択'
      );
      Effect.clock(stack, self, target, 2);
    }
  },
};
