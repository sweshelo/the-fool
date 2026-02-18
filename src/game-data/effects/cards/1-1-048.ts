import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // このユニットがフィールドに出た時
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const self = stack.processing;
    const opponent = self.owner.opponent;
    const opponentUnits = opponent.field;

    await EffectHelper.combine(stack, [
      {
        title: '不動の呪詛',
        description: '敵全体に【呪縛】を与える',
        effect: () => {
          opponentUnits.forEach(unit => Effect.keyword(stack, self, unit, '呪縛'));
        },
        condition: opponentUnits.length > 0,
      },
      {
        title: '破壊効果耐性',
        description: '対戦相手の効果によって破壊されない',
        effect: () => Effect.keyword(stack, self, self, '破壊効果耐性'),
      },
    ]);
  },

  // 対戦相手のターン開始時
  onTurnStart: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;
    // 対戦相手のターン時のみ発動
    if (stack.source.id !== opponent.id) return;

    // 対戦相手のユニットが存在するか確認
    if (EffectHelper.isUnitSelectable(stack.core, 'opponents', owner)) {
      await System.show(stack, '守神の覇気', '行動権を消費');

      // 対象を1体選択
      const [target] = await EffectHelper.pickUnit(
        stack,
        owner,
        'opponents',
        '行動権を消費するユニットを選択'
      );

      // 行動権を消費
      Effect.activate(stack, stack.processing, target, false);
    }
  },
};
