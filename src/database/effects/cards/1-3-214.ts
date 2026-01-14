import { Effect } from '../classes/effect';
import { System } from '../classes/system';
import type { CardEffects, StackWithCard } from '../classes/types';

const effect = async (stack: StackWithCard) => {
  // コスト1以下をフィルタ
  const targets = stack.core.players
    .flatMap(player => player.field)
    .filter(unit => unit.catalog.cost <= 1);
  if (targets.length > 0) {
    await System.show(stack, '影滅陣', '全てのコスト1以下を消滅');
    targets.forEach(unit => Effect.delete(stack, stack.processing, unit));
  }
};

export const effects: CardEffects = {
  onDriveSelf: effect,
  onTurnStart: async (stack: StackWithCard) => {
    // 自分のターン開始時のみ
    if (stack.source.id === stack.processing.owner.id) await effect(stack);
  },
};
