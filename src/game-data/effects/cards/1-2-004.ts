import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // ■ヒトデ爆弾
  // このユニットがオーバークロックした時、対戦相手のユニットを2体まで選ぶ。それらに5000ダメージを与える。

  // オーバークロック時の効果
  onOverclockSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    // 相手のユニットが存在する場合のみ処理
    if (opponent.field.length > 0) {
      // 対象を選択可能なユニットを取得
      if (EffectHelper.isUnitSelectable(stack.core, 'opponents', owner)) {
        await System.show(stack, 'ヒトデ爆弾', '5000ダメージ');

        // 相手ユニットを最大2体選択
        const targets: Unit[] = await EffectHelper.pickUnit(
          stack,
          owner,
          'opponents',
          `5000ダメージを与えるユニットを選択`,
          2
        );

        // 選択したユニットに5000ダメージを与える
        for (const target of targets) {
          Effect.damage(stack, stack.processing, target, 5000);
        }
      }
    }
  },
};
