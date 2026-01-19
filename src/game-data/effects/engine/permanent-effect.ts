import type { Stack } from '@/package/core/class/stack';
import type { Card, Unit } from '@/package/core/class/card';
import type { DeltaSource } from '@/package/core/class/delta';

/**
 * Effect.keyword や Effect.modifyBP などで使用する共通のOption型
 * Delta に source 情報を付与するために使用
 */
export type DeltaSourceOption = {
  source: DeltaSource;
};

/**
 * 対象の所有者を指定
 */
type TargetOwner = 'self' | 'owns' | 'opponents';

/**
 * 対象の領域を指定
 */
type TargetZone = 'field' | 'hand' | 'trigger';

/**
 * PermanentEffect.mount() の details パラメータの型定義
 * discriminated union により、targets に応じた型推論を実現
 *
 * targets の構造:
 * - ['self']: 自分自身のみ
 * - ['owns']: 自分のフィールド（デフォルト）
 * - ['owns', 'field']: 自分のフィールド（明示的）
 * - ['owns', 'hand']: 自分の手札
 * - ['owns', 'trigger']: 自分のトリガーゾーン
 * - ['opponents']: 相手のフィールド（デフォルト）
 * - ['opponents', 'field']: 相手のフィールド（明示的）
 * - ['opponents', 'hand']: 相手の手札
 * - ['opponents', 'trigger']: 相手のトリガーゾーン
 */
export type EffectDetails =
  | {
      /** 自分自身のみを対象とする */
      targets: ['self'];
      /** 効果を適用する関数 */
      effect: (unit: Unit, option: DeltaSourceOption) => void;
      /** 効果を適用する条件（省略時は常に適用） */
      condition?: (unit: Unit) => boolean;
      /** 効果を識別するためのコード（必須） */
      effectCode: string;
    }
  | {
      /** 自分または相手のフィールド上のユニットを対象とする（第2要素省略時は 'field' がデフォルト） */
      targets: ['owns'] | ['opponents'] | ['owns', 'field'] | ['opponents', 'field'];
      /** 効果を適用する関数 */
      effect: (unit: Unit, option: DeltaSourceOption) => void;
      /** 効果を適用する条件（省略時は常に適用） */
      condition?: (unit: Unit) => boolean;
      /** 効果を識別するためのコード（必須） */
      effectCode: string;
    }
  | {
      /** 自分または相手の手札/トリガーゾーンを対象とする */
      targets:
        | ['owns', 'hand']
        | ['opponents', 'hand']
        | ['owns', 'trigger']
        | ['opponents', 'trigger'];
      /** 効果を適用する関数 */
      effect: (card: Card, option: DeltaSourceOption) => void;
      /** 効果を適用する条件（省略時は常に適用） */
      condition?: (card: Card) => boolean;
      /** 効果を識別するためのコード（必須） */
      effectCode: string;
    };

/**
 * PermanentEffect - フィールド効果や手札効果を簡潔に記述するためのヘルパークラス
 *
 * フィールド上のユニットが他のカードに継続的な効果を与える場合、
 * Delta の管理（追加・削除・重複チェック）を自動化します。
 *
 * @example
 * // Lv2以上の味方ユニットに BP+2000 を付与
 * PermanentEffect.mount(stack, stack.processing, {
 *   targets: ['owns'],  // 自分のフィールド（デフォルト）
 *   effect: (unit, option) =>
 *     Effect.modifyBP(stack, stack.processing, unit, 2000, option),
 *   condition: (unit) => unit.lv >= 2,
 *   effectCode: '豊穣の女神_Lv2',
 * })
 *
 * @example
 * // 自分の手札の赤属性ユニットのコストを-1
 * PermanentEffect.mount(stack, stack.processing, {
 *   targets: ['owns', 'hand'],  // 自分の手札
 *   effect: (card, option) => {
 *     if (card instanceof Unit) {
 *       card.delta.push(new Delta({ type: 'cost', value: -1 }, option));
 *     }
 *   },
 *   condition: (card) => card.catalog.color === Color.RED && card instanceof Unit,
 *   effectCode: '甘い誘い',
 * })
 */
export class PermanentEffect {
  /**
   * 永続効果をマウントする
   *
   * 指定された対象に対して効果を適用し、条件が満たされなくなった場合は自動的に除去します。
   * 同じ effectCode の効果が既に適用されている場合は重複しません。
   *
   * @param stack 現在のスタック
   * @param source 効果の発動元ユニット
   * @param details 効果の詳細設定
   */
  static mount(stack: Stack, source: Unit, details: EffectDetails): void {
    // source 情報を含む option を生成
    const option: DeltaSourceOption = {
      source: {
        unit: source.id,
        effectCode: details.effectCode,
      },
    };

    // 対象を取得
    const targets = this.getTargets(stack, source, details.targets);

    // 各対象に対して効果を適用または除去
    targets.forEach(target => {
      // 既存の Delta を検索
      const existingDelta = target.delta.find(
        delta =>
          delta.source?.unit === source.id && delta.source?.effectCode === details.effectCode
      );

      // 条件を評価
      const conditionMet = !details.condition || details.condition(target as any);

      if (existingDelta) {
        // Delta が既に存在する場合
        if (!conditionMet) {
          // 条件が満たされなくなった → Delta を除去
          target.delta = target.delta.filter(
            delta =>
              !(delta.source?.unit === source.id && delta.source?.effectCode === details.effectCode)
          );
        }
        // 条件が満たされている場合は何もしない（既に適用済み）
      } else {
        // Delta が存在しない場合
        if (conditionMet) {
          // 条件が満たされている → 効果を適用
          details.effect(target as any, option);
        }
        // 条件が満たされていない場合は何もしない
      }
    });
  }

  /**
   * targets 指定に基づいて対象のカードリストを取得
   *
   * targets の形式:
   * - ['self']: 自分自身
   * - [owner]: owner のフィールド（デフォルト）
   * - [owner, zone]: owner の zone
   *
   * @private
   */
  private static getTargets(
    stack: Stack,
    source: Unit,
    targets: EffectDetails['targets']
  ): Card[] {
    // 第1要素: 所有者、第2要素: 領域（デフォルトは 'field'）
    const [owner, zone = 'field'] = targets as [TargetOwner, TargetZone?];

    // 'self' の場合は自分自身のみ
    if (owner === 'self') {
      return [source];
    }

    // プレイヤーを取得
    const player = owner === 'owns' ? source.owner : source.owner.opponent;

    // 領域に応じて対象を返す
    switch (zone) {
      case 'field':
        return player.field;
      case 'hand':
        return player.hand;
      case 'trigger':
        return player.trigger;
      default:
        return [];
    }
  }
}
