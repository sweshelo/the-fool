import type { Stack } from './stack';
import type { Core } from '../core';
import type { IAtom } from '@/submodule/suit/types';
import type { Choices } from '@/submodule/suit/types/game/system';

/**
 * カード効果ハンドラの型定義
 * スタック、カード、コアを受け取り、非同期で効果を処理する
 */
export interface EffectHandler {
  (stack: Stack, card: IAtom, core: Core): Promise<void>;
}

/**
 * カード効果のタイプ定義
 * 各スタックタイプに対応する効果ハンドラを持つ
 */
export interface CardEffects {
  // 召喚時の効果
  onDrive?: EffectHandler;
  // 破壊時の効果
  onBreak?: EffectHandler;
  // ダメージを与えた時の効果
  onDamage?: EffectHandler;
  // ドローした時の効果
  onDraw?: EffectHandler;
  // [その他の効果タイプ]
}

/**
 * カタログ拡張用の型定義
 * カタログデータにCardEffectsを含める
 */
export interface ExtendedCatalog {
  id: string;
  name: string;
  cost: number;
  // 他のカタログフィールド

  // 効果ハンドラ
  onDrive?: EffectHandler;
  onBreak?: EffectHandler;
  onDamage?: EffectHandler;
  onDraw?: EffectHandler;
  // [その他の効果タイプ]
}

/**
 * 効果ユーティリティ関数群
 * 一般的な効果の実装を提供する
 */
export class EffectUtils {
  /**
   * カードをドローする効果
   * @param count ドローするカード枚数
   * @returns EffectHandler
   */
  static drawCards(count: number = 1): EffectHandler {
    return async (stack: Stack, card: IAtom, core: Core): Promise<void> => {
      // カードの所有者を特定
      const player = core.players.find(
        p => p.field.some(c => c.id === card.id) || p.hand.some(c => c.id === card.id)
      );

      if (player) {
        // 指定枚数のカードをドロー
        for (let i = 0; i < count; i++) {
          player.draw();
        }
      }
    };
  }

  /**
   * 対象を破壊する効果
   * @param targetSelector 対象を選択する関数
   * @returns EffectHandler
   */
  static breakTargets(
    targetSelector: (stack: Stack, card: IAtom, core: Core) => Promise<IAtom[]>
  ): EffectHandler {
    return async (stack: Stack, card: IAtom, core: Core): Promise<void> => {
      // 対象を選択
      const targets = await targetSelector(stack, card, core);

      // 各対象に対して破壊処理
      for (const target of targets) {
        // 対象の所有者を特定
        for (const player of core.players) {
          const index = player.field.findIndex(c => c.id === target.id);
          if (index >= 0) {
            // 対象をフィールドから取り除き、墓地に置く
            const removedCard = player.field.splice(index, 1)[0];
            if (removedCard) {
              player.trash.unshift(removedCard);
            }

            // 破壊スタックを作成
            // const breakStack = stack.addChildStack('break', card, target);

            break; // 見つかったらループ終了
          }
        }
      }
    };
  }

  /**
   * 相手の全ユニットを対象にする選択関数
   */
  static selectAllOpponentUnits(stack: Stack, card: IAtom, core: Core): Promise<IAtom[]> {
    // 現在のターンプレイヤーを取得
    const turnPlayerId = core.getTurnPlayerId();
    if (!turnPlayerId) return Promise.resolve([]);

    // 非ターンプレイヤーのユニットを全て選択
    const opponents = core.players.filter(p => p.id !== turnPlayerId);
    const units: IAtom[] = [];

    for (const opponent of opponents) {
      units.push(...opponent.field);
    }

    return Promise.resolve(units);
  }
}

export class EffectHelper {
  /**
   * プレイヤーに選択を促し、選択結果を返す
   * @param stack 現在処理中のスタック
   * @param card 効果の発動元カード
   * @param core ゲームコア
   * @param playerId 選択を行うプレイヤーID
   * @param options 選択肢
   * @returns 選択された項目のID
   */
  static async promptChoice(
    stack: Stack,
    card: IAtom,
    core: Core,
    playerId: string,
    choices: Choices
  ): Promise<string[]> {
    return await stack.promptUserChoice(core, playerId, choices);
  }

  static async showEffect(stack: Stack, core: Core, title: string, message: string): Promise<void> {
    return await stack.displayEffect(core, title, message);
  }
}
