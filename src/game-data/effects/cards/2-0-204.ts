import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  // スピードムーブ効果
  async onDriveSelf(stack: StackWithCard<Unit>) {
    // スピードムーブの説明表示
    await System.show(stack, 'スピードムーブ', '行動制限の影響を受けない');

    // スピードムーブの適用（行動制限を除去）
    Effect.speedMove(stack, stack.processing);
  },

  // ■闇夜の切り裂き魔
  // このユニットがアタックした時、自身以外の全てのユニットに1000ダメージを与える。
  async onAttackSelf(stack: StackWithCard<Unit>) {
    // 全ユニットを取得
    const allUnits = stack.core.players
      .map(p => p.field)
      .flat()
      .filter(unit => unit.id !== stack.processing.id);

    if (allUnits.length > 0) {
      await System.show(stack, '闇夜の切り裂き魔', '自身以外に1000ダメージ');
      allUnits.forEach(unit => Effect.damage(stack, stack.processing, unit, 1000));
    }
  },

  // ■パーフェクトクライム
  // このユニットがプレイヤーアタックに成功した時、あなたのトリガーゾーンにあるカードを2枚ランダムで破壊する。
  // そうした場合、このユニットをあなたの手札に戻す
  async onPlayerAttackSelf(stack: StackWithCard<Unit>) {
    const owner = stack.processing.owner;
    const triggers = owner.trigger;

    // トリガーが2枚以上ある場合のみ処理
    if (triggers.length >= 2) {
      await System.show(stack, 'パーフェクトクライム', 'トリガーゾーンを2枚破壊\n手札に戻る');

      // ランダムで2枚選んで破壊
      const destroyTargets = EffectHelper.random(triggers, 2);
      for (const card of destroyTargets) {
        Effect.move(stack, stack.processing, card, 'trash');
      }

      // このユニットを手札に戻す
      Effect.bounce(stack, stack.processing, stack.processing);
    }
  },
};
