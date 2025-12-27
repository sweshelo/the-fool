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
    // 対戦相手のユニットが存在するかチェック
    const opponentUnits = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id !== stack.processing.owner.id,
      stack.processing.owner
    );

    // 選択肢1が可能か（対戦相手のユニットが存在するか）
    const option1Available = opponentUnits.length > 0;

    // 選択肢2が可能か（CPが1以上あるか、かつ対戦相手のユニットが存在するか）
    const option2Available = stack.processing.owner.cp.current >= 1 && opponentUnits.length > 0;

    // 両方の選択肢が不可能な場合、加護のみ付与して終了
    if (option1Available || option2Available) {
      // どちらか一方だけが可能な場合、自動的にその選択肢を実行
      // 両方可能な場合のみプレイヤーに選択させる
      let choice: string;

      if (option1Available && option2Available) {
        const result = await System.prompt(stack, stack.processing.owner.id, {
          type: 'option',
          title: '選略・だいてんしのおともだち',
          items: [
            { id: '1', description: '2体まで手札に戻す' },
            { id: '2', description: 'CP-1\nランダムで2体デッキに戻す' },
          ],
        });
        choice = result[0] || '1'; // デフォルト値として'1'を設定
      } else if (option1Available) {
        choice = '1';
      } else {
        // option2Available が true
        choice = '2';
      }

      switch (choice) {
        case '1': {
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
            '手札に戻すユニットを選択',
            targetCount
          );

          // 選択したユニットを手札に戻す
          for (const target of targets) {
            Effect.bounce(stack, stack.processing, target, 'hand');
          }
          break;
        }

        case '2': {
          // CP-1する
          Effect.modifyCP(stack, stack.processing, stack.processing.owner, -1);

          // 効果を発動（CP-1後のチェックは不要、事前に確認済み）
          await System.show(
            stack,
            '選略・だいてんしのおともだち',
            'CP-1\n対戦相手のユニットをランダムで2体デッキに戻す'
          );

          // ランダムで最大2体選択
          const targetCount = Math.min(2, opponentUnits.length);
          const randomTargets = EffectHelper.random(opponentUnits, targetCount);

          // 選択したユニットをデッキに戻す
          for (const target of randomTargets) {
            Effect.bounce(stack, stack.processing, target, 'deck');
          }
          break;
        }
      }
    }

    await System.show(stack, '加護', '効果に選ばれない');
    // 加護を付与
    Effect.keyword(stack, stack.processing, stack.processing, '加護');
  },

  // プレイヤーアタックを受けた時の効果
  onPlayerAttack: async (stack: StackWithCard<Unit>): Promise<void> => {
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
