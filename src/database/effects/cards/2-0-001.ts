import { Effect, EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // 自身が召喚された時に発動する効果を記述
  onDriveSelf: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, 'ヒートストーム', '【ドラゴン】を1枚引く\n【ドラゴン】のレベル+1');
    const candidate = EffectHelper.candidate(
      stack.core,
      unit =>
        unit.owner.id === stack.processing.owner.id &&
        (unit.catalog.species?.includes('ドラゴン') ?? false),
      stack.processing.owner
    );

    const [unitId] = await System.prompt(stack, stack.processing.owner.id, {
      type: 'unit',
      title: 'ダメージを与えるユニットを選択',
      items: candidate,
    });

    const target = candidate.find(unit => unit.id === unitId);
    if (target) Effect.clock(stack, stack.processing, target, 1);

    EffectTemplate.reinforcements(stack, stack.processing.owner, { species: 'ドラゴン' });
  },
};
