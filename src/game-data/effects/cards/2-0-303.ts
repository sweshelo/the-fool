import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // このユニットがフィールドに出た時
  onDriveSelf: async (stack: StackWithCard): Promise<void> => {
    if (!(stack.processing instanceof Unit)) return;
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    const choice = await EffectHelper.choice(stack, owner, '選略・覚悟の岐路', [
      {
        id: '1',
        description: '【固着】と【無我の境地】を得る',
      },
      {
        id: '2',
        description: 'ランダムで2体に［【侍】×1000］ダメージ',
        condition: opponent.field.length > 0,
      },
    ]);

    switch (choice) {
      case '1': {
        await System.show(stack, '選略・覚悟の岐路', '【固着】と【無我の境地】を得る');
        Effect.keyword(stack, stack.processing, stack.processing, '固着');
        Effect.keyword(stack, stack.processing, stack.processing, '無我の境地');
        break;
      }
      case '2': {
        const targets = EffectHelper.random(opponent.field, 2);
        const samuraiUnits = owner.field.filter(unit => unit.catalog.species?.includes('侍'));
        const damage = samuraiUnits.length * 1000;

        await System.show(stack, '選略・覚悟の岐路', 'ランダムで2体に［【侍】×1000］ダメージ');
        targets.forEach(unit => Effect.damage(stack, stack.processing, unit, damage));
        break;
      }
    }
  },
};
