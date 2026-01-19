import { Unit, type Card } from '@/package/core/class/card';
import type { StackWithCard } from '../schema/types';
import type { DeltaSource } from '@/package/core/class/delta';

const targetKeys = ['self', 'owns', 'opponents', 'both', 'hand', 'trigger'] as const;
type TargetKeys = (typeof targetKeys)[number];

interface EffectDetails {
  /**
   * フィールド効果の対象をAND条件で指定します。
   * 効果の対象がフィールド上のユニットではない場合、'owns' / 'opponents' / 'both' のいずれかに続けて、 'hand' または 'trigger' のように指定します。
   * @example
   * const targets = ['owns'] // 自フィールド
   * const targets = ['opponents', 'trigger'] // 敵トリガーゾーン
   */
  targets: TargetKeys[];
  /**
   * フィールド効果の内容を記述
   * @param target フィールド効果の影響を受ける対象。具体的な対象はtargets[]に渡したキーに応じて確定します。
   * @param deltaSource 自動的に生成されて渡されます。これを modifyBP() や keyword() に渡します。
   * @example
   * // 一律 BPを+2000する場合
   * const effect = (target, deltaSource) => {
   *   // 現在のところ、targetsにUnitしか指定され得ない領域を指定した場合も
   *   // instanceof Unit による型チェックが必要です
   *   if (target instanceof Unit) {
   *     Effect.modifyBP(stack, stack.processing, target, 2000, { source: deltaSource })
   *   }
   * }
   */
  effect: (target: Card, deltaSource: DeltaSource) => void;
  /**
   * 効果の種別を一意に識別するためのコードです。1つのユニットが複数のフィールド効果を発動するケースがあるため、必須パラメータです。
   */
  effectCode: string;
  /**
   * 対象のフィールド効果を発動できるかどうかを個別に判定する
   * @param target フィールド効果の影響を受ける対象。具体的な対象はtargets[]に渡したキーに応じて確定します。
   * @returns booleanにキャスト可能な値
   */
  condition?: (target: Card) => unknown;
}

interface Targets {
  units: Unit[];
  cards: Card[];
}

export class PermanentEffect {
  /**
   * フィールド効果を登録します。
   * @param stack Stack
   * @param source フィールド効果の発生源
   * @param details フィールド効果詳細
   */
  static mount(stack: StackWithCard, source: Card, details: EffectDetails) {
    const { units = [], cards = [] } = this.getTargets(stack, source, details.targets);

    // FIXME: units / cards と それに対する effect() の型付けをうまく連携させる方法を思いついたら実装する
    const targets = [...units, ...cards];

    targets.forEach(card => {
      const delta = card.delta.some(
        delta => delta.source?.effectCode === details.effectCode && delta.source.unit === source.id
      );
      if (!details.condition || details.condition(card)) {
        // 効果付与
        if (!delta) details.effect(card, { unit: source.id, effectCode: details.effectCode });
      } else {
        // 効果剥奪
        if (delta)
          card.delta.filter(
            delta =>
              delta.source?.effectCode !== details.effectCode && delta.source?.unit !== source.id
          );
      }
    });
  }

  static getTargets(
    stack: StackWithCard,
    source: Card,
    targetKeys: TargetKeys[]
  ): Partial<Targets> {
    const players = [];

    // self を指定した場合
    if (targetKeys.includes('self')) {
      if (source.owner.field.some(unit => unit.id === source.id) && source instanceof Unit) {
        return { units: [source] };
      } else {
        return { cards: [source] };
      }
    }

    // 対象のプレイヤーを絞り込む
    if (targetKeys.includes('both')) {
      players.push(stack.core.getTurnPlayer(), stack.core.getTurnPlayer().opponent);
    } else if (targetKeys.includes('owns')) {
      players.push(source.owner);
    } else if (targetKeys.includes('opponents')) {
      players.push(source.owner.opponent);
    }

    // 手札の場合
    if (targetKeys.includes('hand')) {
      return { cards: players.flatMap(player => player.hand) };
    }

    // トリガーゾーンの場合
    if (targetKeys.includes('trigger')) {
      return { cards: players.flatMap(player => player.trigger) };
    }

    // 手札・トリガーゾーンのどちらも指定しなかった場合
    return { units: players.flatMap(player => player.field) };
  }
}
