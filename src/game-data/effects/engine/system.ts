import { createMessage } from '@/submodule/suit/types';
import type { Stack } from '@/package/core/class/stack';
import type { Choices } from '@/submodule/suit/types/game/system';
import { Unit } from '@/package/core/class/card';

export class System {
  /**
   * 指定時間待機する（テスト時にモック可能）
   * @param ms 待機時間（ミリ秒）
   */
  static sleep: (ms: number) => Promise<void> = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  /**
   * スタックの処理状態をクライアントに通知する
   * @param stack 対象のスタック
   * @param core ゲームのコアインスタンス
   * @param state 処理の状態 ('start'|'end')
   */
  static async notify(stack: Stack, state: 'start' | 'end'): Promise<void> {
    // 通知メッセージを送信
    stack.core.room.broadcastToAll(
      createMessage({
        action: {
          type: 'debug',
          handler: 'client',
        },
        payload: {
          type: 'DebugPrint',
          message: {
            stackId: stack.id,
            stackType: stack.type,
            state: state,
            source: stack.source,
            target: stack.target,
          },
        },
      })
    );

    // 少し待機してアニメーションなどの時間を確保
    await System.sleep(300);
  }

  /**
   * ユーザーに選択を促す
   * @param stack 対象のスタック
   * @param playerId 選択を行うプレイヤーID
   * @param choices 選択肢の配列
   * @returns 選択された選択肢
   */
  static async prompt(stack: Stack, playerId: string, choices: Choices): Promise<string[]> {
    // 一意のプロンプトIDを生成
    const promptId = `${stack.id}_${Date.now()}`;

    // クライアントに選択肢を送信
    stack.core.room.broadcastToAll(
      createMessage({
        action: {
          type: 'pause',
          handler: 'client',
        },
        payload: {
          type: 'Choices',
          promptId,
          choices,
          player: playerId,
        },
      })
    );

    // クライアントからの応答を待つ
    const result: string[] = await new Promise(resolve => {
      stack.core.setEffectDisplayHandler(promptId, (choice: string[]) => {
        if (choices.type === 'unit') stack.core.room.soundEffect('bang');
        resolve(choice);
      });
    });

    if (choices.type === 'option') {
      stack.core.room.soundEffect('select');
    }

    stack.core.room.broadcastToAll(
      createMessage({
        action: {
          type: 'continue',
          handler: 'client',
        },
        payload: {
          type: 'Selected',
          promptId,
        },
      })
    );

    return result;
  }

  /**
   * ユーザーに効果内容を表示する
   * @param stack 対象のスタック
   * @param title 効果名
   * @param message 表示メッセージ
   */
  static async show(stack: Stack, title: string, message: string): Promise<void> {
    // 一意のプロンプトIDを生成
    const promptId = `${stack.id}_${Date.now()}`;

    // クライアントにエフェクトを送信
    stack.core.room.broadcastToAll(
      createMessage({
        action: {
          type: 'pause',
          handler: 'client',
        },
        payload: {
          type: 'DisplayEffect',
          promptId,
          stackId: stack.id,
          title,
          message,
          unitId: stack.processing instanceof Unit ? stack.processing.id : undefined,
        },
      })
    );

    // クライアントからの応答を待つ
    return new Promise(resolve => {
      stack.core.setEffectDisplayHandler(promptId, () => {
        resolve();
      });
    });
  }
}
