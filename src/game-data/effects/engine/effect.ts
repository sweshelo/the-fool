import type { Stack } from '@/package/core/class/stack';
import type { Card, Unit } from '@/package/core/class/card';
import type { CardArrayKeys, Player } from '@/package/core/class/Player';
import type { DeltaSource } from '@/package/core/class/delta';
import type { KeywordEffect } from '@/submodule/suit/types';
import type { JokerGuageAmountKey } from '@/submodule/suit/constant/joker';
import {
  effectDamage,
  effectModifyBP,
  effectDynamicBP,
  effectBreak,
  effectDelete,
  effectBounce,
  effectHandes,
  effectMove,
  effectModifyCP,
  effectModifyPurple,
  effectModifyJokerGauge,
  effectClock,
  effectKeyword,
  effectSummon,
  effectClone,
  effectSpeedMove,
  effectActivate,
  effectDeath,
  effectModifyLife,
  effectRemoveKeyword,
  effectMake,
  type ModifyBPOption,
  type KeywordOptionParams,
} from './effect/index';

export type { ModifyBPOption, KeywordOptionParams };

export class Effect {
  /**
   * 対象にダメージを与える
   *
   * 【不滅】【秩序の盾】【王の治癒力】などの耐性を自動でチェックし、
   * BPが0以下になった場合は自動的に破壊処理が実行されます。
   *
   * @param stack - 親スタック
   * @param source - ダメージを与える効果を発動したカード
   * @param target - ダメージを受けるユニット
   * @param value - ダメージ量
   * @param type - 'effect' | 'battle'（デフォルト: 'effect'）
   * @returns 対象が破壊された場合は true
   *
   * @example
   * Effect.damage(stack, stack.processing, target, 3000);
   */
  static damage(
    stack: Stack,
    source: Card,
    target: Unit,
    value: number,
    type: 'effect' | 'battle' = 'effect',
    effectCode: string = `${source.id}-${stack.type}`
  ) {
    return effectDamage(stack, source, target, value, type, effectCode);
  }

  /**
   * 対象のBPを操作する
   *
   * 基本BPの操作、一時的なBP操作、フィールド効果によるBP操作など、
   * 様々なパターンに対応します。BPが0以下になった場合は自動的に破壊処理が実行されます。
   *
   * @param stack - 親スタック
   * @param source - BPを変動させる効果を発動したカード
   * @param target - BPが変動するユニット
   * @param value - 操作量（正: 増加、負: 減少）
   * @param option - 基本BPの操作や効果の発生源オブジェクトを指定
   * @returns この効果で相手を破壊した場合は true
   *
   * @example
   * // 基本BPを+1000
   * Effect.modifyBP(stack, source, target, 1000, { isBaseBP: true });
   *
   * // ターン終了時まで-2000
   * Effect.modifyBP(stack, source, target, -2000, { event: 'turnEnd', count: 1 });
   *
   * // フィールド効果による永続的なBP変動
   * Effect.modifyBP(stack, source, target, 1000, { source: deltaSource });
   */
  static modifyBP(stack: Stack, source: Card, target: Unit, value: number, option: ModifyBPOption) {
    return effectModifyBP(stack, source, target, value, option);
  }

  /**
   * 対象のBPを動的に操作する
   *
   * フィールド効果など、ゲーム状況に応じてBP変動量が変わる場合に使用します。
   * calculatorは状況が変わるたびに再評価されます。
   *
   * @param stack - 親スタック
   * @param source - BPを変動させる効果を発動したカード
   * @param target - BPが変動するユニット
   * @param calculator - BPを計算する関数
   * @param option - フィールド効果の発生源オブジェクトを指定
   *
   * @example
   * // 自分の手札の枚数×1000 BP上昇
   * Effect.dynamicBP(stack, source, target, (self) => self.owner.hand.length * 1000, { source: deltaSource });
   */
  static dynamicBP(
    stack: Stack,
    source: Card,
    target: Unit,
    calculator: (self: Card) => number,
    option: { source: DeltaSource }
  ) {
    return effectDynamicBP(stack, source, target, calculator, option);
  }

  /**
   * 対象を破壊する
   *
   * フィールド上のユニットに対しては【破壊効果耐性】を自動でチェックし、破壊スタックを発生させます。
   * 手札内のカードに対しては、手札破壊スタックを発生させます。
   *
   * @param stack - 親スタック
   * @param source - 効果の発動元
   * @param target - 破壊の対象
   * @param cause - その破壊の原因（カードテキストの実装にあたっては基本的にeffect以外使用してはいけない）
   *
   * @example
   * Effect.break(stack, stack.processing, target, 'effect');
   */
  static break(
    stack: Stack,
    source: Card,
    target: Card,
    cause: 'effect' | 'damage' | 'modifyBp' | 'battle' | 'death' | 'system' = 'effect'
  ) {
    return effectBreak(stack, source, target, cause);
  }

  /**
   * 対象を消滅させる
   *
   * フィールド上のユニットに対しては【消滅効果耐性】を自動でチェックし、消滅スタックを発生させます。
   *
   * @param stack - 親スタック
   * @param source - 効果の発動元
   * @param target - 消滅の対象
   *
   * @example
   * Effect.delete(stack, stack.processing, target);
   */
  static delete(stack: Stack, source: Card, target: Card) {
    return effectDelete(stack, source, target);
  }

  /**
   * 対象を移動させる（バウンス）
   *
   * フィールド上のユニットに対しては【固着】を自動でチェックし、手札へ戻すスタックを発生させます。
   *
   * @param stack - 親スタック
   * @param source - 効果の発動元
   * @param target - 移動の対象
   * @param location - 移動先（'hand' | 'deck' | 'trigger'、デフォルト: 'hand'）
   *
   * @example
   * // 手札に戻す
   * Effect.bounce(stack, stack.processing, target, 'hand');
   *
   * // デッキに戻す
   * Effect.bounce(stack, stack.processing, target, 'deck');
   */
  static bounce(
    stack: Stack,
    source: Card,
    target: Card,
    location: 'hand' | 'deck' | 'trigger' = 'hand'
  ) {
    return effectBounce(stack, source, target, location);
  }

  /**
   * 効果によって手札を捨てさせる
   * @deprecated Effect.break() を手札以外にも利用することが出来ます
   * @param stack - 親スタック
   * @param source - 効果の発動元
   * @param target - 破壊する手札
   *
   * @example
   * Effect.break(stack, stack.processing, targetCard);
   */
  static handes(stack: Stack, source: Card, target: Card) {
    return effectHandes(stack, source, target);
  }

  /**
   * 効果によってカードを移動させる
   *
   * 手札を捨てる動作は `handes` を利用してください。
   *
   * @param stack - 親スタック
   * @param source - 効果の発動元
   * @param target - 対象のカード
   * @param location - 移動先
   *
   * @example
   * // 捨札から手札に加える
   * Effect.move(stack, stack.processing, target, 'hand');
   *
   * // トリガーゾーンにセット
   * Effect.move(stack, stack.processing, target, 'trigger');
   */
  static move(stack: Stack, source: Card, target: Card, location: CardArrayKeys) {
    return effectMove(stack, source, target, location);
  }

  /**
   * CPを操作する
   *
   * @param stack - 親スタック
   * @param source - 効果の発動元
   * @param target - 対象のプレイヤー
   * @param value - 増減量（正: 増加、負: 減少）
   *
   * @example
   * Effect.modifyCP(stack, stack.processing, player, 2);
   */
  static modifyCP(stack: Stack, source: Card, target: Player, value: number) {
    return effectModifyCP(stack, source, target, value);
  }

  /**
   * 紫ゲージを操作する
   *
   * @param stack - 親スタック
   * @param source - 効果の発動元
   * @param target - 対象のプレイヤー
   * @param value - 増減量（正: 増加、負: 減少）
   *
   * @example
   * await Effect.modifyPurple(stack, stack.processing, player, 1);
   */
  static async modifyPurple(
    stack: Stack,
    source: Card,
    target: Player,
    value: number
  ): Promise<void> {
    return effectModifyPurple(stack, source, target, value);
  }

  /**
   * ジョーカーゲージを操作する
   *
   * @param _stack - 親スタック
   * @param _source - 効果の発動元
   * @param target - 対象のプレイヤー
   * @param value - 増減量（数値または JokerGuageAmountKey）
   *
   * @example
   * // 数値で指定
   * Effect.modifyJokerGauge(stack, stack.processing, player, 10);
   *
   * // キーで指定
   * Effect.modifyJokerGauge(stack, stack.processing, player, '中');
   */
  static modifyJokerGauge(
    _stack: Stack,
    _source: Card,
    target: Player,
    value: number | JokerGuageAmountKey
  ) {
    return effectModifyJokerGauge(target, value);
  }

  /**
   * クロックレベルを操作する
   *
   * @param stack - 親スタック
   * @param source - 効果の発動元
   * @param target - 効果の対象
   * @param value - 操作量（正: 増加、負: 減少）
   * @param withoutOverClock - オーバークロック時の効果を発動させない
   *
   * @example
   * // レベルを1上げる
   * Effect.clock(stack, stack.processing, target, 1);
   *
   * // レベルを2下げる
   * Effect.clock(stack, stack.processing, target, -2);
   */
  static clock(
    stack: Stack,
    source: Card,
    target: Unit,
    value: number,
    withoutOverClock: boolean = false
  ): void {
    return effectClock(stack, source, target, value, withoutOverClock);
  }

  /**
   * ユニットにキーワード能力を付与する
   *
   * @param stack - 親スタック
   * @param source - 効果の発動元
   * @param target - 対象のユニット
   * @param keyword - 対象のキーワード
   * @param option - 対象のキーワードの持続時間など
   *
   * @example
   * // 無期限に【秩序の盾】を得る
   * Effect.keyword(stack, source, target, '秩序の盾');
   *
   * // 次のターン終了を迎えるまで【貫通】を得る
   * Effect.keyword(stack, source, target, '貫通', { event: 'turnEnd', count: 1 });
   */
  static keyword(
    stack: Stack,
    source: Card,
    target: Unit,
    keyword: KeywordEffect,
    option?: KeywordOptionParams
  ) {
    return effectKeyword(stack, source, target, keyword, option);
  }

  /**
   * 特殊召喚を実行する
   *
   * @param stack - 親スタック
   * @param source - 効果の発動元
   * @param target - 対象のユニット
   * @param isCopy - COPYフラグ
   * @returns 特殊召喚に成功するとUnitを、失敗するとundefinedを返す
   *
   * @example
   * const summoned = await Effect.summon(stack, stack.processing, unit);
   */
  static async summon(
    stack: Stack,
    source: Card,
    target: Unit,
    isCopy?: boolean
  ): Promise<Unit | undefined> {
    return effectSummon(stack, source, target, isCopy);
  }

  /**
   * 複製する
   *
   * @param stack - 親スタック
   * @param source - 効果の発動元
   * @param target - 複製対象
   * @param owner - 複製先のフィールド(プレイヤー)
   *
   * @example
   * const cloned = await Effect.clone(stack, stack.processing, target, player);
   */
  static async clone(stack: Stack, source: Card, target: Unit, owner: Player) {
    return effectClone(stack, source, target, owner);
  }

  /**
   * 【スピードムーブ】を付与する
   *
   * ゲーム的にはキーワード能力付与だが、実際の処理はキーワード除去なので別メソッド化
   *
   * @param stack - 親スタック
   * @param target - 対象
   *
   * @example
   * Effect.speedMove(stack, target);
   */
  static speedMove(stack: Stack, target: Unit) {
    return effectSpeedMove(stack, target);
  }

  /**
   * 行動権を操作する
   *
   * 【無我の境地】を自動でチェックします。
   *
   * @param stack - 親スタック
   * @param source - 効果の発動元
   * @param target - 効果の対象
   * @param activate - 操作値 指定された値に変化する
   *
   * @example
   * // 行動済みにする
   * Effect.activate(stack, stack.processing, target, false);
   *
   * // 行動可能にする
   * Effect.activate(stack, stack.processing, target, true);
   */
  static activate(stack: Stack, source: Card, target: Unit, activate: boolean) {
    return effectActivate(stack, source, target, activate);
  }

  /**
   * デスカウンターを付与する
   *
   * @param _stack - 親スタック
   * @param _source - 効果の発動元
   * @param target - デスカウンターの対象
   * @param count - デスカウンターの数値
   *
   * @example
   * Effect.death(stack, stack.processing, target, 3);
   */
  static death(_stack: Stack, _source: Card, target: Unit, count: number) {
    return effectDeath(target, count);
  }

  /**
   * ライフを操作する
   *
   * @param stack - 親スタック
   * @param source - 効果の発動元
   * @param player - 対象のプレイヤー
   * @param value - 増減量（正: 回復、負: ダメージ）
   *
   * @example
   * // 1ダメージを与える
   * Effect.modifyLife(stack, stack.processing, player, -1);
   *
   * // 2回復する
   * Effect.modifyLife(stack, stack.processing, player, 2);
   */
  static modifyLife(stack: Stack, source: Card, player: Player, value: number) {
    return effectModifyLife(stack, source, player, value);
  }

  /**
   * ユニットからキーワード能力を除去する
   *
   * @param stack - 親スタック
   * @param target - 対象のユニット
   * @param keyword - 除去するキーワード
   * @param option - 除去条件（指定された場合、条件に一致するキーワードのみを除去）
   *
   * @example
   * // 全ての【秩序の盾】を除去
   * Effect.removeKeyword(stack, target, '秩序の盾');
   *
   * // 特定のソースから付与された【貫通】のみを除去
   * Effect.removeKeyword(stack, target, '貫通', { source: deltaSource });
   */
  static removeKeyword(
    stack: Stack,
    target: Unit,
    keyword: KeywordEffect,
    option?: KeywordOptionParams
  ) {
    return effectRemoveKeyword(stack, target, keyword, option);
  }

  /**
   * 作成する
   *
   * @param stack - スタック
   * @param player - 作成するカードの所有者
   * @param target - 作成するカードのオリジナル または カードID
   * @param locationKey - 作成する場所（'hand' | 'trigger'、デフォルト: 'hand'）
   *
   * @example
   * // カードIDから手札に作成
   * const card = Effect.make(stack, player, '1-0-001');
   *
   * // 既存カードをコピーしてトリガーゾーンに作成
   * const card = Effect.make(stack, player, existingCard, 'trigger');
   */
  static make(
    stack: Stack,
    player: Player,
    target: Card | string,
    locationKey: 'hand' | 'trigger' = 'hand'
  ) {
    return effectMake(stack, player, target, locationKey);
  }
}
