import { Evolve, Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // ■護星合神
  // （デッキにサーチ対象のコスト4以上の機械がいない場合は発動できない）
  // あなたのコスト３以下の【機械】ユニットがフィールドに出た時、
  // あなたのデッキから進化ユニットカード以外のコスト４以上の【機械】ユニットを１枚ランダムで手札に加える。
  // あなたのＣＰを＋２する。

  checkDrive: (stack: StackWithCard): boolean => {
    const owner = stack.processing.owner;
    if (!(stack.target instanceof Unit)) return false;
    if (stack.target.owner.id !== owner.id) return false;
    if (stack.target.catalog.cost > 3) return false;
    if (!stack.target.catalog.species?.includes('機械')) return false;
    return owner.deck.some(
      card =>
        card instanceof Unit &&
        !(card instanceof Evolve) &&
        card.catalog.cost >= 4 &&
        card.catalog.species?.includes('機械')
    );
  },

  onDrive: async (stack: StackWithCard): Promise<void> => {
    const owner = stack.processing.owner;
    const candidates = owner.deck.filter(
      card =>
        card instanceof Unit &&
        !(card instanceof Evolve) &&
        card.catalog.cost >= 4 &&
        card.catalog.species?.includes('機械')
    );

    await System.show(stack, '護星合神', 'コスト4以上の【機械】ユニットを1枚引く\nCP+2');
    EffectHelper.random(candidates, 1).forEach(card =>
      Effect.move(stack, stack.processing, card, 'hand')
    );
    Effect.modifyCP(stack, stack.processing, owner, 2);
  },
};
