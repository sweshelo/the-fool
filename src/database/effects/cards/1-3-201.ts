import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // ■試作型・Vフィールド
  // このユニットがフィールドに出た時、あなたのユニットを1体選ぶ。それに【消滅効果耐性】（対戦相手の効果によって消滅しない）を与える。
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;

    // 自分のユニットをフィルタリング
    const filter = (unit: Unit) => unit.owner.id === stack.processing.owner.id;

    if (EffectHelper.isUnitSelectable(stack.core, filter, stack.processing.owner)) {
      await System.show(stack, '試作型・Vフィールド', '【消滅効果耐性】を付与');

      // ユニットを1体選択
      const [target] = await EffectHelper.pickUnit(
        stack,
        owner,
        filter,
        '【消滅効果耐性】を付与するユニットを選択'
      );

      if (target) {
        // 消滅効果耐性を付与
        Effect.keyword(stack, stack.processing, target, '消滅効果耐性');
      }
    }
  },

  // ■サポーター
  // あなたのターン開始時、あなたのユニットを1体選ぶ。ターン終了時までそれのBPを+1000する。
  onTurnStart: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;

    // 自分のターン開始時のみ発動
    if (owner.id === stack.core.getTurnPlayer().id) {
      // 自分のユニットをフィルタリング
      const filter = (unit: Unit) => unit.owner.id === owner.id;

      if (EffectHelper.isUnitSelectable(stack.core, filter, owner)) {
        await System.show(stack, 'サポーター', 'BP+1000');

        // ユニットを1体選択
        const [target] = await EffectHelper.pickUnit(
          stack,
          owner,
          filter,
          'BP+1000するユニットを選択'
        );

        if (target) {
          // ターン終了時までBP+1000
          Effect.modifyBP(stack, stack.processing, target, 1000, {
            event: 'turnEnd',
            count: 1,
          });
        }
      }
    }
  },
};
