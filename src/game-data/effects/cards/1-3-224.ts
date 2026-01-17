import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // ■幽冥の神威
  // このユニットがフィールドに出た時、対戦相手の全てのレベル3以上のユニットを破壊する。対戦相手に1ライフダメージを与える。
  // 対戦相手のフィールドにレベル3以上のユニットが2体以上いる場合、さらに1ライフダメージを与える。
  // 対戦相手のインターセプトカードの効果が発動した時、あなたの捨札にあるユニットカードを1枚ランダムで手札に加える。

  // 召喚時効果
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    // 対戦相手のレベル3以上のユニットを検索
    const level3PlusUnits = stack.processing.owner.opponent.field.filter(unit => unit.lv >= 3);

    // レベル3以上のユニット数
    const level3Count = level3PlusUnits.length;

    if (level3Count > 0) {
      await System.show(
        stack,
        '幽冥の神威',
        `レベル3以上のユニットを破壊\n${level3Count >= 2 ? '2ライフダメージ' : '1ライフダメージ'}`
      );

      // レベル3以上のユニットを全て破壊
      for (const unit of level3PlusUnits) {
        Effect.break(stack, stack.processing, unit, 'effect');
      }

      [...Array(level3PlusUnits.length >= 2 ? 2 : 1)].forEach(() =>
        Effect.modifyLife(stack, stack.processing, stack.processing.owner.opponent, -1)
      );
    }
  },

  // 対戦相手のインターセプト発動時効果
  onIntercept: async (stack: StackWithCard<Unit>): Promise<void> => {
    // 対戦相手のインターセプトの場合のみ発動
    if (
      stack.target &&
      'owner' in stack.target &&
      stack.target.owner.id === stack.processing.owner.opponent.id
    ) {
      // 捨札のユニットカード
      const unitsInTrash = stack.processing.owner.trash.filter(card => card instanceof Unit);

      if (unitsInTrash.length > 0) {
        await System.show(stack, '幽冥の神威', '捨札からユニットを1枚回収');

        // ランダムで1枚選択
        const selectedUnits = EffectHelper.random(unitsInTrash, 1);

        // 手札に加える（TypeScript対策として非nullアサーションは避ける）
        for (const unit of selectedUnits) {
          Effect.move(stack, stack.processing, unit, 'hand');
          break; // 1枚だけ追加
        }
      }
    }
  },
};
