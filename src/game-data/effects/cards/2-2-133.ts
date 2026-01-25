import { Evolve, Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // ■路線変更
  // あなたのコスト4以下のユニットがフィールドに出た時、あなたのフィールドにユニットが4体以下の場合、そのユニットをデッキに戻す。そうした場合、そのユニットと異なる種族の同じコストの進化ユニット以外のユニットをデッキからランダムで1体【特殊召喚】する。
  checkDrive: (stack: StackWithCard): boolean => {
    const owner = stack.processing.owner;

    // 自分のコスト4以下のユニットが出た時のみ発動
    if (stack.source.id !== owner.id) return false;
    if (!(stack.target instanceof Unit)) return false;
    if (stack.target.catalog.cost > 4) return false;

    // フィールドにユニットが4体以下か確認
    if (owner.field.length > 4) return false;

    // 特殊召喚可能なユニットがデッキに存在するかチェック
    const targetCost = stack.target.catalog.cost;
    const targetSpecies = stack.target.catalog.species ?? [];
    const candidates = owner.deck.filter(
      card =>
        card instanceof Unit &&
        !(card instanceof Evolve) &&
        card.catalog.cost === targetCost &&
        !card.catalog.species?.some(s => targetSpecies.includes(s))
    );

    return candidates.length > 0;
  },

  onDrive: async (stack: StackWithCard): Promise<void> => {
    const owner = stack.processing.owner;

    if (!(stack.target instanceof Unit)) return;

    const targetCost = stack.target.catalog.cost;
    const targetSpecies = stack.target.catalog.species ?? [];

    // デッキから対象となるユニットを検索
    const candidates = owner.deck.filter(
      card =>
        card instanceof Unit &&
        !(card instanceof Evolve) &&
        card.catalog.cost === targetCost &&
        !card.catalog.species?.some(s => targetSpecies.includes(s))
    );

    if (candidates.length === 0) return;

    await System.show(
      stack,
      '路線変更',
      'ユニットをデッキに戻す\n別の種族のユニットを【特殊召喚】'
    );

    // そのユニットをデッキに戻す
    Effect.bounce(stack, stack.processing, stack.target, 'deck');

    // ランダムで1体選んで特殊召喚
    const [randomUnit] = EffectHelper.random(candidates, 1);
    if (randomUnit instanceof Unit) {
      await Effect.summon(stack, stack.processing, randomUnit, false);
    }
  },
};
