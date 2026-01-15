import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import type { Core } from '@/package/core/core';

export const effects: CardEffects = {
  // ■起動・コンバットエクスチェンジャー
  // フィールドのユニットを1体選び、それ以外のユニットを1体選ぶ。それらのBPを入れ替え、それぞれの基本BPにする。
  isBootable: (core: Core, _self: Unit): boolean => {
    // フィールド上に2体以上のユニットが存在するか確認
    // 自分自身も含めた全ユニット数をチェック
    const allUnits = core.players.flatMap(player => player.field);
    return allUnits.length >= 2;
  },

  onBootSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const allUnits = stack.core.players.flatMap(player => player.field);

    if (allUnits.length >= 2) {
      await System.show(stack, 'コンバットエクスチェンジャー', '2体のユニットのBPを入れ替え');

      try {
        // 1体目のユニットを選択
        const [firstUnit] = await EffectHelper.pickUnit(
          stack,
          stack.processing.owner,
          () => true,
          'BPを入れ替えるユニットを選択'
        );

        const [secondUnit] = await EffectHelper.pickUnit(
          stack,
          stack.processing.owner,
          (unit: Unit) => unit.id !== firstUnit.id,
          'BPを入れ替えるユニットを選択'
        );

        // 現在のBPを取得
        const firstBP = firstUnit.currentBP;
        const secondBP = secondUnit.currentBP;

        // 過不足分を計算し Effect.modifyBP する
        // FIXME: 間違っている
        Effect.modifyBP(stack, stack.processing, firstUnit, secondBP - firstBP, { isBaseBP: true });
        Effect.modifyBP(stack, stack.processing, secondUnit, firstBP - secondBP, {
          isBaseBP: true,
        });
      } catch (error) {
        console.error('ユニット選択エラー:', error);
      }
    }
  },
};
