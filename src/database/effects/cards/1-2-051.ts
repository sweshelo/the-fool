import { Unit } from '@/package/core/class/card';
import { Effect } from '../classes/effect';
import type { CardEffects, StackWithCard } from '../classes/types';
import { System } from '../classes/system';
import { EffectHelper } from '../classes/helper';

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
    const candidates = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id === self.owner.id,
      self.owner
    );
    if (candidates.length === 0) return;

    await System.show(stack, '鼓舞のワルツ', '基本BP+5000');

    // 自分のユニットを1体選ぶ
    const [buffTarget] = await EffectHelper.selectUnit(
      stack,
      self.owner,
      candidates,
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
    const opponentCandidates = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id === opponent.id,
      owner
    );
    const hasOpponentUnit = opponentCandidates.length > 0;

    // 自分のフィールドにユニットが存在するか確認
    const ownCandidates = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id === owner.id,
      owner
    );
    const hasOwnUnit = ownCandidates.length > 0;

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
      const [debuffTarget] = await EffectHelper.selectUnit(
        stack,
        owner,
        opponentCandidates,
        '基本BP-1000するユニットを選んでください'
      );

      if (debuffTarget) {
        Effect.modifyBP(stack, self, debuffTarget, -1000, { isBaseBP: true });
      }
    }

    // 自分のユニットを1体選ぶ
    if (hasOwnUnit) {
      const [buffTarget] = await EffectHelper.selectUnit(
        stack,
        owner,
        ownCandidates,
        '基本BP+1000するユニットを選んでください'
      );

      if (buffTarget) {
        Effect.modifyBP(stack, self, buffTarget, 1000, { isBaseBP: true });
      }
    }
  },
};
