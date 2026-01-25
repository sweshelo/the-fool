import type { Card, Evolve, Unit } from '@/package/core/class/card';
import type { Player } from '@/package/core/class/Player';
import type { Core } from '@/package/core';
import type { Stack } from '@/package/core/class/stack';
import {
  helperExceptSelf,
  helperRandom,
  helperShuffle,
  helperSelectCard,
  helperRepeat,
  helperIsBreakByEffect,
  helperHasGauge,
  helperIsVirusInjectable,
  helperIsUnitSelectable,
  helperPickUnit,
  helperChoice,
  helperIsUnit,
  helperIsEvolve,
  helperCombine,
  type UnitPickFilter,
  type Choice,
} from './helper/index';
import type { Effect } from './helper/combine';

export type { UnitPickFilter, Choice };

export class EffectHelper {
  /**
   * 『自身以外に』の効果を実行する
   *
   * フィールド上の全ユニット（自身を除く）に対して指定した効果を適用します。
   *
   * @param core - ゲームコアインスタンス
   * @param card - 効果の発動元（このユニットは除外される）
   * @param effect - 各ユニットに適用する効果関数
   *
   * @example
   * // 自身以外の全ユニットに1000ダメージ
   * EffectHelper.exceptSelf(stack.core, card, (unit) => {
   *   Effect.damage(stack, card, unit, 1000);
   * });
   */
  static exceptSelf(core: Core, card: Unit, effect: (unit: Unit) => void): void {
    return helperExceptSelf(core, card, effect);
  }

  /**
   * 与えられた配列からランダムに重複しない要素を選択する
   *
   * @param targets - 要素を選択する配列（undefined要素は除外される）
   * @param number - 選択する要素数（デフォルト: 1）
   * @returns ランダムに選択された要素の配列
   *
   * @example
   * // フィールド上の敵ユニットからランダムに1体選択
   * const [target] = EffectHelper.random(opponent.field);
   *
   * // 手札からランダムに2枚選択
   * const cards = EffectHelper.random(player.hand, 2);
   */
  static random<T>(targets: T[], number = 1): T[] {
    return helperRandom(targets, number);
  }

  /**
   * 対象をランダムにソート（シャッフル）する
   *
   * @param targets - シャッフルする配列
   * @returns シャッフルされた新しい配列
   *
   * @example
   * const shuffledDeck = EffectHelper.shuffle(player.deck);
   */
  static shuffle<T>(targets: T[]): T[] {
    return helperShuffle(targets);
  }

  /**
   * 与えられたカード配列からユーザに選択させる
   *
   * フィールド上のユニットを選択する場合は pickUnit を利用してください。
   *
   * @param stack - スタック
   * @param player - 対象を選択するプレイヤー
   * @param targets - 対象の候補
   * @param title - UIに表示するメッセージ
   * @param count - 選択するカード数（デフォルト: 1）
   * @returns 最低1つのCardを含む Card[] が得られる Promise
   *
   * @example
   * // 捨札から1枚選択
   * const [card] = await EffectHelper.selectCard(stack, player, player.trash, '回収するカードを選択');
   *
   * // 手札から2枚選択
   * const cards = await EffectHelper.selectCard(stack, player, player.hand, '捨てるカードを選択', 2);
   */
  static async selectCard<T extends Card = Card>(
    stack: Stack,
    player: Player,
    targets: T[],
    title: string,
    count: number = 1
  ): Promise<[T, ...T[]]> {
    return helperSelectCard(stack, player, targets, title, count);
  }

  /**
   * 与えられたメソッドを繰り返す
   *
   * @param times - 回数
   * @param callback - 繰り返す関数
   *
   * @example
   * // 3回ドロー
   * EffectHelper.repeat(3, () => player.draw());
   */
  static repeat(times: number, callback: () => unknown) {
    return helperRepeat(times, callback);
  }

  /**
   * 与えられた破壊スタックに対して、それが「効果による破壊」とみなされるかを判定する
   *
   * @param stack - 破壊スタック
   * @returns 効果による破壊の場合は true
   * @throws 破壊スタックでない場合や、破壊理由が格納されていない場合はエラー
   *
   * @example
   * if (EffectHelper.isBreakByEffect(stack)) {
   *   // 効果による破壊時の処理
   * }
   */
  static isBreakByEffect(stack: Stack): boolean {
    return helperIsBreakByEffect(stack);
  }

  /**
   * プレイヤーが指定されたゲージ量を持っているかを判定する
   *
   * @param player - 対象のプレイヤー
   * @param gaugeKey - ゲージの大きさ（'小' | '中' | '大' | '特大'）
   * @returns 指定量以上のゲージがある場合は true
   *
   * @example
   * if (EffectHelper.hasGauge(player, '中')) {
   *   // 中ゲージ以上の処理
   * }
   */
  static hasGauge(player: Player, gaugeKey: '小' | '中' | '大' | '特大'): boolean {
    return helperHasGauge(player, gaugeKey);
  }

  /**
   * 対象プレイヤーのフィールドに【ウィルス】ユニットを【特殊召喚】可能であるかを調べる
   *
   * @param player - 調査対象のプレイヤー
   * @returns ウィルスを召喚可能な場合は true
   *
   * @example
   * if (EffectHelper.isVirusInjectable(opponent)) {
   *   // ウィルス召喚処理
   * }
   */
  static isVirusInjectable(player: Player) {
    return helperIsVirusInjectable(player);
  }

  /**
   * 【加護】を持つユニットを考慮して、プレイヤーがユニットを選択できるかを調べる
   *
   * @param core - ゲームコアインスタンス
   * @param filter - フィルタ条件（'owns' | 'opponents' | 'all' またはカスタム関数）
   * @param selector - 選択するプレイヤー
   * @param count - 必要な選択数（デフォルト: 1）
   * @returns 選択可能であれば true
   *
   * @example
   * // 敵ユニットを1体選択可能か
   * if (EffectHelper.isUnitSelectable(stack.core, 'opponents', player)) {
   *   // 選択処理
   * }
   */
  static isUnitSelectable(
    core: Core,
    filter: UnitPickFilter,
    selector: Player,
    count: number = 1
  ): boolean {
    return helperIsUnitSelectable(core, filter, selector, count);
  }

  /**
   * フィールド上のユニットを【加護】【セレクトハック】を考慮してユーザに選択させる
   *
   * カードを選択する場合は selectCard を利用してください。
   *
   * @param stack - スタック
   * @param player - 対象を選択するプレイヤー
   * @param filter - 'owns'（自分のみ）、'opponents'（敵のみ）、'all'（全て）、またはカスタムフィルター関数
   * @param title - UIに表示するメッセージ
   * @param count - 選択するユニット数（デフォルト: 1）
   * @returns 最低1つのUnitを含む Unit[] が得られる Promise
   *
   * @example
   * // 敵ユニットを1体選択
   * const [target] = await EffectHelper.pickUnit(stack, player, 'opponents', '対象を選択');
   *
   * // 全ユニットから2体選択
   * const targets = await EffectHelper.pickUnit(stack, player, 'all', '対象を選択', 2);
   */
  static async pickUnit(
    stack: Stack,
    player: Player,
    filter: UnitPickFilter,
    title: string,
    count: number = 1
  ): Promise<[Unit, ...Unit[]]> {
    return helperPickUnit(stack, player, filter, title, count);
  }

  /**
   * 2つの選択肢からユーザに1つを選ばせる
   *
   * 各選択肢にconditionを指定することで、条件を満たす選択肢のみ表示できます。
   * 選択可能な選択肢が1つのみの場合は自動的にその選択肢が選ばれます。
   *
   * @param stack - スタック
   * @param player - 選択するプレイヤー
   * @param title - UIに表示するタイトル
   * @param choices - 2つの選択肢
   * @returns 選択された選択肢のID、または選択肢がない場合はundefined
   *
   * @example
   * const result = await EffectHelper.choice(stack, player, '効果を選択', [
   *   { id: 'draw', description: 'カードを1枚引く', condition: () => player.deck.length > 0 },
   *   { id: 'damage', description: '相手に1ダメージ' },
   * ]);
   */
  static async choice(
    stack: Stack,
    player: Player,
    title: string,
    choices: [Choice, Choice]
  ): Promise<Choice['id'] | undefined> {
    return helperChoice(stack, player, title, choices);
  }

  /**
   * 複数の効果を同時に発動させる
   *
   * effectsに発動させたい効果とその条件について与えて呼び出すことで、実際に発動する効果のみを System.show() 付きで呼び出します。
   * 効果は `order` プロパティで実行順序を制御できます（低い値が先に実行、デフォルト: 0）。
   *
   * @param stack - スタック
   * @param effects - 効果情報
   * @param effects[].title - 効果のタイトル
   * @param effects[].description - 効果の説明
   * @param effects[].condition - 効果の発動条件（省略時は常に発動）
   * @param effects[].effect - 実行する効果関数
   * @param effects[].order - 実行順序（低い値が先、省略時は0）
   * @returns なし
   *
   * @example
   * await EffectHelper.combine(stack, [
   *   { title: 'ハートスティール', description: 'CP-12', effect: () => stealCP(stack, self, owner), order: 2 },
   *   { title: '連撃', description: '基本BP-2000', effect: async () => { ... }, order: 1 },
   * ])
   */
  static async combine(stack: Stack, effects: Effect[]): Promise<void> {
    return helperCombine(stack, effects);
  }

  /**
   * 与えられた値がUnitインスタンスかを判定する
   *
   * @param card - 判定対象
   * @param strict - trueの場合、進化ユニットを除外する（デフォルト: false）
   * @returns Unitの場合は true
   *
   * @example
   * if (EffectHelper.isUnit(card)) {
   *   // Unitとして処理
   * }
   */
  static isUnit(card: unknown, strict: boolean = false): card is Unit {
    return helperIsUnit(card, strict);
  }

  /**
   * 与えられた値がEvolveインスタンスかを判定する
   *
   * @param card - 判定対象
   * @returns Evolveの場合は true
   *
   * @example
   * if (EffectHelper.isEvolve(card)) {
   *   // 進化ユニットとして処理
   * }
   */
  static isEvolve(card: unknown): card is Evolve {
    return helperIsEvolve(card);
  }
}
