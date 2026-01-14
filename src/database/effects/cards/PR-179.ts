import type { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // 自身が召喚された時に発動する効果を記述
  onDriveSelf: async (stack: StackWithCard): Promise<void> => {
    const owner = stack.processing.owner;
    const isBouncedMoreThan10Cards = owner.trash.length >= 10;
    await System.show(
      stack,
      '飛天矛槍演舞',
      `お互いの捨札をデッキに戻す\n${isBouncedMoreThan10Cards ? 'カードを1枚引く\n' : ''}【天使】に【秩序の盾】を与える`
    );

    // 天使を1体選ぶ
    const filter = (unit: Unit) => {
      return (unit.catalog.species?.includes('天使') && unit.owner.id === owner.id) ?? false;
    };
    if (EffectHelper.isUnitSelectable(stack.core, filter, stack.processing.owner)) {
      const [target] = await EffectHelper.pickUnit(
        stack,
        stack.processing.owner,
        filter,
        '【秩序の盾】を与えるユニットを選択して下さい'
      );
      Effect.keyword(stack, stack.processing, target, '秩序の盾');
    }

    stack.core.players.forEach(player => {
      player.trash.forEach(card => Effect.move(stack, stack.processing, card, 'deck'));
    });

    if (isBouncedMoreThan10Cards) EffectTemplate.draw(owner, stack.core);
  },
};
