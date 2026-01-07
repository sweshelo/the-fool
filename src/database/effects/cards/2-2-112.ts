import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import type { Core } from '@/package/core/core';

export const effects: CardEffects = {
  // ■起動・寒慄の咆哮
  // あなたのユニットと対戦相手のユニットをそれぞれ1体ずつ選ぶ。それらに【沈黙】を与える。
  // （この効果は1ターンに1度発動できる）
  isBootable: (core: Core, self: Unit): boolean => {
    // 自分と対戦相手のユニットが存在するか確認
    return (
      EffectHelper.isUnitSelectable(core, 'owns', self.owner) &&
      EffectHelper.isUnitSelectable(core, 'owns', self.owner)
    );
  },

  onBootSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    if (
      EffectHelper.isUnitSelectable(stack.core, 'opponents', owner) &&
      EffectHelper.isUnitSelectable(stack.core, 'owns', owner)
    ) {
      await System.show(stack, '寒慄の咆哮', '味方と敵それぞれ1体に【沈黙】');

      try {
        // 自分のユニットを選択
        const [selectedSelf] = await EffectHelper.pickUnit(
          stack,
          owner,
          'owns',
          '【沈黙】を与えるユニットを選択して下さい'
        );

        // 対戦相手のユニットを選択
        const [selectedOpponent] = await EffectHelper.pickUnit(
          stack,
          owner,
          'opponents',
          '【沈黙】を与えるユニットを選択して下さい'
        );

        // 選んだユニットに【沈黙】を与える
        Effect.keyword(stack, stack.processing, selectedSelf, '沈黙');
        Effect.keyword(stack, stack.processing, selectedOpponent, '沈黙');
      } catch (error) {
        console.error('ユニット選択エラー:', error);
      }
    }
  },

  // ■ガンマレイ
  // あなたのターン開始時、【沈黙】の効果を発動している対戦相手のユニットを1体選ぶ。それを破壊する。
  onTurnStart: async (stack: StackWithCard): Promise<void> => {
    // 自分のターン開始時のみ発動
    if (stack.source.id === stack.processing.owner.id) {
      const opponent = stack.processing.owner.opponent;

      // 選択可能なユニットを確認（沈黙状態の相手ユニット）
      const filter = (unit: Unit) =>
        unit.owner.id === opponent.id && unit.hasKeyword('沈黙') ? true : false;
      if (EffectHelper.isUnitSelectable(stack.core, filter, stack.processing.owner)) {
        await System.show(stack, 'ガンマレイ', '【沈黙】状態の敵ユニット1体を破壊');

        try {
          // ユニットを選択
          const [selected] = await EffectHelper.pickUnit(
            stack,
            stack.processing.owner,
            filter,
            '破壊するユニットを選択して下さい'
          );

          // 選んだユニットを破壊
          Effect.break(stack, stack.processing, selected);
        } catch (error) {
          console.error('ユニット選択エラー:', error);
        }
      }
    }
  },
};
