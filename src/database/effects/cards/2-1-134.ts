import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { Evolve, Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  // ■エクストリーム・サモン
  // あなたの進化ユニット以外のユニットがフィールドに出た時、そのユニットをあなたの捨札、デッキから4体まで【特殊召喚】する。
  // NOTE: インターセプトカードのチェッカーを実装
  checkDrive(stack: StackWithCard): boolean {
    const owner = stack.processing.owner;

    // 自分の進化ユニット以外のユニットが召喚された時に発動
    return (
      stack.target instanceof Unit &&
      stack.target.owner.id === owner.id &&
      !(stack.target instanceof Evolve)
    );
  },

  async onDrive(stack: StackWithCard) {
    const owner = stack.processing.owner;

    // 召喚されたユニット
    if (!(stack.target instanceof Unit) || stack.target instanceof Evolve) return;
    const summonedUnit = stack.target;

    // このユニットと同じカードIDを持つカードを捨て札とデッキから探す
    const sameIdInTrash = owner.trash.filter(
      card => card instanceof Unit && card.catalog.id === summonedUnit.catalog.id
    );

    const sameIdInDeck = owner.deck.filter(
      card => card instanceof Unit && card.catalog.id === summonedUnit.catalog.id
    );

    // 候補となるカードを合わせる
    const candidates = [...sameIdInTrash, ...sameIdInDeck];

    if (candidates.length > 0) {
      // 最大4体まで特殊召喚できる
      const maxSummons = Math.min(candidates.length, 4);
      const availableSpace = stack.core.room.rule.player.max.field - owner.field.length;
      const actualSummons = Math.min(maxSummons, availableSpace);

      if (actualSummons > 0) {
        await System.show(stack, 'エクストリーム・サモン', `同名ユニットを4体まで【特殊召喚】`);

        // 特殊召喚するユニットを選択
        const unitsToSummon = EffectHelper.random(candidates, actualSummons);

        // 一体ずつ特殊召喚する
        for (const unit of unitsToSummon) {
          if (unit instanceof Unit) {
            await Effect.summon(stack, stack.processing, unit);
          }
        }
      }
    }
  },
};
