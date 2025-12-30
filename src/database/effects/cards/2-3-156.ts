import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  checkDrive: (stack: StackWithCard) => {
    // 多分4体以下じゃないと発動できないけど、テキストにはそう書いていないので上限到達をチェックする
    return (
      stack.processing.owner.field.length < stack.core.room.rule.player.max.field &&
      stack.processing.owner.id === stack.source.id
    );
  },

  // 実際の効果本体
  // 関数名に self は付かない
  onDrive: async (stack: StackWithCard): Promise<void> => {
    const deck = stack.processing.owner.deck.filter(card => card.catalog.type === 'unit');
    switch (stack.processing.lv) {
      case 1: {
        await System.show(stack, '花いろ日記', 'デッキからコスト2以下を【特殊召喚】');
        const [target] = EffectHelper.random(deck.filter(unit => unit.catalog.cost <= 2));
        if (target instanceof Unit) await Effect.summon(stack, stack.processing, target);
        break;
      }
      case 2: {
        await System.show(stack, '花いろ日記', 'デッキからコスト3以下を【特殊召喚】');
        const [target] = EffectHelper.random(deck.filter(unit => unit.catalog.cost <= 3));
        if (target instanceof Unit) await Effect.summon(stack, stack.processing, target);
        break;
      }
      case 3: {
        await System.show(stack, '花いろ日記', 'デッキからコスト5以下を【特殊召喚】');
        const [target] = EffectHelper.random(deck.filter(unit => unit.catalog.cost <= 5));
        if (target instanceof Unit) await Effect.summon(stack, stack.processing, target);
        break;
      }
    }
  },
};
