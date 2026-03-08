import { Effect } from '@/game-data/effects/engine/effect';
import { EffectHelper } from '@/game-data/effects/engine/helper';
import { System } from '@/game-data/effects/engine/system';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';
import type { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    await EffectHelper.combine(stack, [
      {
        title: '貫通',
        description: 'ブロックを貫通しプレイヤーにダメージを与える',
        effect: () => Effect.keyword(stack, stack.processing, stack.processing, '貫通'),
      },
      {
        title: '全てを喰らう激流',
        description: '全ユニットに【強制防御】を付与',
        effect: () =>
          [...stack.processing.owner.field, ...stack.processing.owner.opponent.field].forEach(
            unit => Effect.keyword(stack, stack.processing, unit, '強制防御')
          ),
      },
      {
        title: '全てを喰らう激流',
        description: '【スピードムーブ】を得る',
        effect: () => Effect.speedMove(stack, stack.processing),
        condition:
          stack.processing.owner.field.filter(unit => unit.catalog.species?.includes('ドラゴン'))
            .length >= 3,
      },
    ]);
  },
  onBreakSelf: async (stack: StackWithCard) => {
    await System.show(stack, '水竜の至宝', 'CP+2');
    Effect.modifyCP(stack, stack.processing, stack.processing.owner, 2);
  },
};
