import { Unit, type Card } from '@/package/core/class/card';
import type { StackWithCard } from '../schema/types';
import type { DeltaSource } from '@/package/core/class/delta';

const targetKeys = ['self', 'owns', 'opponents', 'both', 'hand', 'trigger'] as const;
type TargetKeys = (typeof targetKeys)[number];

interface EffectDetails {
  targets: TargetKeys[];
  effect: (card: Card, deltaSource: DeltaSource) => void;
  effectCode: string;
  condition?: (card: Card) => unknown;
}

interface Targets {
  units: Unit[];
  cards: Card[];
}

export class PermanentEffect {
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
