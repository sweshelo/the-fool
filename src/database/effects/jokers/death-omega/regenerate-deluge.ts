import { System } from '../../classes/system';
import { EffectHelper } from '../../classes/helper';
import type { CardEffects, StackWithCard } from '../../classes/types';
import { Unit } from '@/package/core/class/card';
import { Effect } from '../../classes/effect';

export const effects: CardEffects = {
  checkJoker: (player, core) => {
    // 捨札に進化ユニット以外のコスト3以下のユニットが存在するか確認
    return (
      player.trash.some(card => card.catalog.type === 'unit' && card.catalog.cost <= 3) &&
      player.field.length < core.room.rule.player.max.field
    );
  },

  onJokerSelf: async (stack: StackWithCard) => {
    const owner = stack.processing.owner;

    // 捨札にある進化ユニット以外のコスト3以下のユニットをフィルタリング
    const candidates = owner.trash.filter(
      card => card instanceof Unit && card.catalog.type === 'unit' && card.catalog.cost <= 3
    );

    await System.show(stack, 'リジェネレート・デリュージ', '5体まで【特殊召喚】');

    // ランダムで5体まで【特殊召喚】する
    const summonCount = Math.min(
      5,
      candidates.length,
      stack.core.room.rule.player.max.field - stack.processing.owner.field.length
    );
    const unitsToSummon = EffectHelper.random(candidates, summonCount);

    for (const unit of unitsToSummon) {
      if (unit instanceof Unit) await Effect.summon(stack, stack.processing, unit);
    }
  },
};
