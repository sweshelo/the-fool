import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // ■起動・一斉掃射
  // 対戦相手の全ての行動済ユニットに2000ダメージを与える。（この効果は1ターンに1度発動できる）
  isBootable: (core, self: Unit): boolean => {
    const opponentInactiveUnits = self.owner.opponent.field.filter(unit => !unit.active);

    return opponentInactiveUnits.length > 0;
  },

  onBootSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const opponentInactiveUnits = stack.processing.owner.opponent.field.filter(
      unit => !unit.active
    );

    if (opponentInactiveUnits.length > 0) {
      await System.show(stack, '一斉掃射', '行動済の敵全体に2000ダメージ');

      // 対戦相手の全ての行動済ユニットに2000ダメージを与える
      opponentInactiveUnits.forEach(unit => {
        Effect.damage(stack, stack.processing, unit, 2000);
      });
    }
  },

  // ■救援部隊投入
  // このユニットがフィールドに出た時、あなたのフィールドにユニットが4体以下の場合、あなたのコスト3以下の【機械】ユニットを1体選ぶ。それをあなたのフィールドに【複製】する。
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;
    const hasFieldSpace = owner.field.length <= 4;

    if (hasFieldSpace) {
      // コスト3以下の機械ユニットを検索
      const machineUnits = EffectHelper.candidate(
        stack.core,
        unit =>
          unit instanceof Unit &&
          unit.catalog.cost <= 3 &&
          (unit.catalog.species?.includes('機械') ?? false),
        stack.processing.owner
      );

      if (machineUnits.length > 0) {
        await System.show(stack, '救援部隊投入', 'コスト3以下の【機械】を【複製】');

        // ユーザーに選択させる
        const [choice] = await EffectHelper.selectUnit(
          stack,
          owner,
          machineUnits,
          '【複製】する【機械】ユニットを選択'
        );

        await Effect.clone(stack, stack.processing, choice, stack.processing.owner);
      }
    }
  },
};
