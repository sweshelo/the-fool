import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // ■深海の主
  // このユニットがフィールドに出た時、このユニットのレベルによって以下の効果が発動する。
  // 【レベル１】このユニットの基本ＢＰを＋［対戦相手のフィールドにいるユニット×１０００］する。
  // 【レベル２以上】このユニットの基本ＢＰを＋［対戦相手のフィールドにいるユニット×２０００］する。
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const self = stack.processing;
    const opponent = self.owner.opponent;
    const unitCount = opponent.field.length;

    if (unitCount <= 0) return;

    const multiplier = self.lv >= 2 ? 2000 : 1000;
    const bpBonus = unitCount * multiplier;

    const description =
      self.lv >= 2
        ? '基本BP＋[相手フィールドのユニット×2000]'
        : '基本BP＋[相手フィールドのユニット×1000]';
    await System.show(stack, '深海の主', description);
    Effect.modifyBP(stack, self, self, bpBonus, { isBaseBP: true });
  },
};
