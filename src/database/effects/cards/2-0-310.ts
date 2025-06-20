import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    const spirit = stack.processing.owner.field.filter(unit =>
      unit.catalog.species?.includes('精霊')
    ).length;
    if (spirit < 2 || stack.processing.owner.opponent.field.length === 0) return;

    const [result] =
      stack.processing.owner.cp.current >= 3
        ? await System.prompt(stack, stack.processing.owner.id, {
            type: 'option',
            title: '選略・ジーニアスショー',
            items: [
              { id: '1', description: '[【精霊】×1]体の行動権を消費' },
              { id: '2', description: 'CP-3\nランダムで2体デッキに戻す' },
            ],
          })
        : ['1'];

    switch (result) {
      case '1': {
        await System.show(stack, '選略・ジーニアスショー', '[【精霊】×1]体の行動権を消費');
        EffectHelper.random(stack.processing.owner.opponent.field, spirit).forEach(unit =>
          Effect.activate(stack, stack.processing, unit, false)
        );
        break;
      }

      case '2': {
        await System.show(stack, '選略・ジーニアスショー', 'CP-3\nランダムで2体デッキに戻す');
        Effect.modifyCP(stack, stack.processing, stack.processing.owner, -3);
        EffectHelper.random(stack.processing.owner.opponent.field, 2).forEach(unit =>
          Effect.bounce(stack, stack.processing, unit, 'deck')
        );
        break;
      }
    }
  },
};
