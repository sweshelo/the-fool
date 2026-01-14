import { Unit } from '@/package/core/class/card';
import { Effect } from '../engine/effect';
import type { CardEffects, StackWithCard } from '../schema/types';
import { System } from '../engine/system';
import { EffectHelper } from '../engine/helper';

export const effects: CardEffects = {
  onDrive: async (stack: StackWithCard<Unit>) => {
    const self = stack.processing;
    const target = stack.target instanceof Unit ? stack.target : undefined;

    // 対象が進化ユニットでない、または対象が対戦相手のユニットでない場合は発動しない
    if (
      !target ||
      target.catalog.type !== 'advanced_unit' ||
      target.owner.id !== self.owner.opponent.id
    )
      return;

    // 自分のフィールドにユニットが存在するか確認
    const filter = (unit: Unit) => unit.owner.id === self.owner.id;
    if (!EffectHelper.isUnitSelectable(stack.core, filter, self.owner)) return;

    await System.show(stack, '鼓舞のワルツ', '基本BP+5000');

    // 自分のユニットを1体選ぶ
    const [buffTarget] = await EffectHelper.pickUnit(
      stack,
      self.owner,
      filter,
      '基本BP+5000するユニットを選んでください'
    );

    if (!buffTarget) return;

    Effect.modifyBP(stack, self, buffTarget, 5000, { isBaseBP: true });
  },

  onPlayerAttack: async (stack: StackWithCard<Unit>) => {
    const self = stack.processing;
    const owner = self.owner;
    const opponent = owner.opponent;

    // 対象が対戦相手のユニットか確認
    if (!(stack.source instanceof Unit) || stack.source.owner.id !== opponent.id) return;

    // 対戦相手のフィールドにユニットが存在するか確認
    const opponentFilter = (unit: Unit) => unit.owner.id === opponent.id;
    const hasOpponentUnit = EffectHelper.isUnitSelectable(stack.core, opponentFilter, owner);

    // 自分のフィールドにユニットが存在するか確認
    const ownFilter = (unit: Unit) => unit.owner.id === owner.id;
    const hasOwnUnit = EffectHelper.isUnitSelectable(stack.core, ownFilter, owner);

    // どちらも選択不可の場合は発動しない
    if (!hasOpponentUnit && !hasOwnUnit) return;

    // 効果テキストを構築
    let effectText = '';
    if (hasOpponentUnit) effectText += '基本BP-1000';
    if (hasOwnUnit) {
      if (effectText) effectText += '\n';
      effectText += '基本BP+1000';
    }

    await System.show(stack, '木の守護精霊', effectText);

    // 対戦相手のユニットを1体選ぶ
    if (hasOpponentUnit) {
      const [debuffTarget] = await EffectHelper.pickUnit(
        stack,
        owner,
        opponentFilter,
        '基本BP-1000するユニットを選んでください'
      );

      if (debuffTarget) {
        Effect.modifyBP(stack, self, debuffTarget, -1000, { isBaseBP: true });
      }
    }

    // 自分のユニットを1体選ぶ
    if (hasOwnUnit) {
      const [buffTarget] = await EffectHelper.pickUnit(
        stack,
        owner,
        ownFilter,
        '基本BP+1000するユニットを選んでください'
      );

      if (buffTarget) {
        Effect.modifyBP(stack, self, buffTarget, 1000, { isBaseBP: true });
      }
    }
  },
};
