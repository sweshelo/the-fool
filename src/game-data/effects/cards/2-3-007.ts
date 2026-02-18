import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // ■お宝探し
  // このユニットがフィールドに出た時、
  // あなたのデッキから進化ユニット以外のコスト３以下のユニットをランダムで１枚消滅させる。
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;

    const candidates = owner.deck.filter(
      card => card.catalog.type === 'unit' && card.catalog.cost <= 3
    );

    if (candidates.length <= 0) return;

    await System.show(stack, 'お宝探し', 'デッキから消滅させる');

    const [target] = EffectHelper.random(candidates);
    if (target instanceof Unit) {
      // ← ここで念のため型確認
      Effect.move(stack, stack.processing, target, 'delete');
    }
  },

  // ■ゴールドミミック
  // このユニットが破壊された時、あなたの捨札にある消滅しているカードから
  // 進化ユニットカード以外のコスト３以下のユニットをランダムで１体【特殊召喚】する。
  // ユニット数がルール上の最大数到達していた場合、効果は発動しない。
  onBreakSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;
    const hasFieldSpace = owner.field.length < stack.core.room.rule.player.max.field;

    const candidates = owner.delete.filter(
      (card): card is Unit =>
        card instanceof Unit && card.catalog.type === 'unit' && card.catalog.cost <= 3
    );

    if (!hasFieldSpace || candidates.length <= 0) return;

    await System.show(stack, 'ゴールドミミック', 'コスト3以下のユニットを【特殊召喚】');

    const [target] = EffectHelper.random(candidates);
    if (target) await Effect.summon(stack, stack.processing, target);
  },
};
