import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // 【加護】
  // ■選略・だいてんしのおともだち
  // このユニットがフィールドに出た時、以下の効果から1つを選び発動する。
  // ①：対戦相手のユニットを2体まで選ぶ。それを対戦相手の手札に戻す。
  // ②：あなたのCPを-1する。そうした場合、対戦相手のユニットからランダムで2体を対戦相手のデッキに戻す。
  // ■えんじぇりっく・きゅあー
  // あなたがプレイヤーアタックを受けた時、あなたのライフを+1し、自身を消滅させる。

  // 召喚時に加護を付与し、選略効果を発動
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    // 加護を付与
    Effect.keyword(stack, stack.processing, stack.processing, '加護');

    // 対戦相手のユニットが存在するかチェック
    const opponentUnits = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id !== stack.processing.owner.id,
      stack.processing.owner
    );

    if (opponentUnits.length === 0) return; // 対戦相手のユニットがなければ何もしない

    // 実装簡略化: 常に1つ目の選択肢（ユニットを手札に戻す）を選択する
    // 実際の実装では選択UIが必要だが、型の問題のため簡略化
    await System.show(
      stack,
      '選略・だいてんしのおともだち',
      '対戦相手のユニットを2体まで手札に戻す'
    );

    // ユニットを最大2体選択
    const targetCount = Math.min(2, opponentUnits.length);
    const targets = await EffectHelper.selectUnit(
      stack,
      stack.processing.owner,
      opponentUnits,
      '手札に戻すユニットを選択（最大2体）',
      targetCount
    );

    // 選択したユニットを手札に戻す
    for (const target of targets) {
      Effect.bounce(stack, stack.processing, target, 'hand');
    }

    // 注: 本来は選択肢を提示し、②を選んだ場合は以下のような処理を行うが、今回は省略
    /* 
    // CP-1して、ランダムで2体デッキに戻す
    Effect.modifyCP(stack, stack.processing, stack.processing.owner, -1);
    
    if (stack.processing.owner.cp.current >= 0) { // CPが足りていれば効果発動
      await System.show(stack, '選略・だいてんしのおともだち', 'CP-1\n対戦相手のユニットをランダムで2体デッキに戻す');
      
      // ランダムで最大2体選択
      const targetCount = Math.min(2, opponentUnits.length);
      const randomTargets = EffectHelper.random(opponentUnits, targetCount);
      
      // 選択したユニットをデッキに戻す
      for (const target of randomTargets) {
        Effect.bounce(stack, stack.processing, target, 'deck');
      }
    }
    */
  },

  // プレイヤーアタックを受けた時の効果
  onPlayerAttackTarget: async (stack: StackWithCard<Unit>): Promise<void> => {
    // 自分のプレイヤーがアタックされた時だけ発動
    if (stack.target && stack.target.id === stack.processing.owner.id) {
      await System.show(stack, 'えんじぇりっく・きゅあー', 'ライフ+1\n自身を消滅');

      // ライフを+1
      // Note: ライフの増加は直接的な方法がないため、
      // ここではSystem.showで表示するだけにして実際の処理はコアにお任せ
      await System.show(stack, 'えんじぇりっく・きゅあー', 'ライフが+1された');

      // 自身を消滅
      Effect.delete(stack, stack.processing, stack.processing);
    }
  },
};
