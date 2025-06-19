import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // 【固着】
  // ■巨象の粉塵炎
  // あなたの【獣】ユニットがフィールドに出るたび、対戦相手のユニットを1体選ぶ。それに2000ダメージを与える。
  // ■巨象の業塵炎
  // このユニットがオーバークロックした時、対戦相手の全てのユニットにあなたのフィールドにいる【獣】1体につき2000ダメージを与える。

  // 召喚時の効果：固着を付与
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const targetCandidates = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id === stack.processing.owner.opponent.id,
      stack.processing.owner
    );

    if (targetCandidates.length > 0) {
      await System.show(
        stack,
        '巨象の粉塵炎＆固着',
        '2000ダメージ\n対戦相手の効果によって手札に戻らない'
      );
      // ユニットを1体選択
      const [target] = await EffectHelper.selectUnit(
        stack,
        stack.processing.owner,
        targetCandidates,
        '2000ダメージを与えるユニットを選択'
      );

      // 2000ダメージを与える
      Effect.damage(stack, stack.processing, target, 2000);
    } else {
      await System.show(stack, '固着', '対戦相手の効果によって手札に戻らない');
    }

    // 固着を付与
    Effect.keyword(stack, stack.processing, stack.processing, '固着');
  },

  // 味方獣ユニットがフィールドに出た時の効果
  onDrive: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;
    const targetCandidates = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id === opponent.id,
      owner
    );

    // 自分の獣ユニットが出た時のみ処理
    if (
      stack.target instanceof Unit &&
      stack.target.owner.id === owner.id &&
      stack.target.catalog.species?.includes('獣') &&
      stack.target.id !== stack.processing.id
    ) {
      // 相手のユニットが存在する場合のみ処理
      if (targetCandidates.length > 0) {
        await System.show(stack, '巨象の粉塵炎', '2000ダメージ');

        // ユニットを1体選択
        const [target] = await EffectHelper.selectUnit(
          stack,
          owner,
          targetCandidates,
          '2000ダメージを与えるユニットを選択'
        );

        // 2000ダメージを与える
        Effect.damage(stack, stack.processing, target, 2000);
      }
    }
  },

  // オーバークロック時の効果
  onOverclockSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    // フィールドにいる獣ユニットの数を取得
    const beastCount = owner.field.filter(unit => unit.catalog.species?.includes('獣')).length;

    // ダメージ量を計算
    const damage = 2000 * beastCount;

    if (damage > 0 && opponent.field.length > 0) {
      await System.show(stack, '巨象の業塵炎', `敵全体に[獣×2000]ダメージ`);

      // 相手の全ユニットにダメージを与える
      for (const target of opponent.field) {
        Effect.damage(stack, stack.processing, target, damage);
      }
    }
  },
};
