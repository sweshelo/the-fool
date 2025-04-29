import type { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // 自身が召喚された時に発動する効果を記述
  onDriveSelf: async (stack: StackWithCard): Promise<void> => {
    const owner = EffectHelper.owner(stack.core, stack.processing);
    const isBouncedMoreThan10Cards = owner.trash.length >= 10;
    await System.show(
      stack,
      '飛天矛槍演舞',
      `お互いの捨札をデッキに戻す\n${isBouncedMoreThan10Cards ? 'カードを1枚引く\n' : ''}【天使】に【秩序の盾】を与える`
    );

    // 天使を1体選ぶ
    const candidate = EffectHelper.candidate(stack.core, (unit: Unit) => {
      return (
        unit.catalog.species!.includes('天使') &&
        EffectHelper.owner(stack.core, unit).id === owner.id
      );
    });
    if (candidate.length > 0) {
      const [unitId] = await System.prompt(
        stack,
        EffectHelper.owner(stack.core, stack.processing).id,
        {
          type: 'unit',
          title: '【秩序の盾】を与えるユニットを選択',
          items: candidate,
        }
      );

      const unit = candidate.find(unit => unit.id === unitId);
      if (unit) Effect.keyword(stack, stack.processing, unit, '秩序の盾');
    }

    stack.core.players.forEach(player => {
      player.deck = [...player.deck, ...player.trash];
      player.trash = [];
    });

    if (isBouncedMoreThan10Cards) EffectTemplate.draw(owner, stack.core);
  },
};
