import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

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
      const targetCandidates = EffectHelper.candidate(
        stack.core,
        unit => unit.owner.id === opponent.id,
        owner
      );

      if (targetCandidates.length > 0) {
        await System.show(stack, 'ヒトデ爆弾', '5000ダメージ');

        // 相手ユニットを最大2体選択
        // 選択できるユニットが1体しかない場合は1体だけ選択
        const count = Math.min(2, targetCandidates.length);

        // 複数選択の場合
        const targets: Unit[] = [];

        for (let i = 0; i < count; i++) {
          // 既に選択したユニットを除外した候補を作成
          const remainingCandidates = targetCandidates.filter(
            unit => !targets.some(selected => selected.id === unit.id)
          );

          if (remainingCandidates.length === 0) break;

          const [target] = await EffectHelper.selectUnit(
            stack,
            owner,
            remainingCandidates,
            `5000ダメージを与えるユニットを選択`
          );

          targets.push(target);
        }

        // 選択したユニットに5000ダメージを与える
        for (const target of targets) {
          Effect.damage(stack, stack.processing, target, 5000);
        }
      }
    }
  },
};
