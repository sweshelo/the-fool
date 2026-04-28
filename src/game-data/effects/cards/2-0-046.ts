import { Effect } from '@/game-data/effects/engine/effect';
import { System } from '@/game-data/effects/engine/system';
import { EffectTemplate } from '@/game-data/effects/engine/templates';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';
import { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  checkDrive: (stack: StackWithCard) => {
    const target = stack.target;
    if (stack.source.id !== stack.processing.owner.id || !(target instanceof Unit)) return false;

    return target.catalog.species?.includes('英雄')
      ? stack.processing.owner.field.some(unit => unit.id === target.id)
      : true;
  },
  onDrive: async (stack: StackWithCard) => {
    if (!(stack.target instanceof Unit)) return;
    if (stack.target.catalog.species?.includes('英雄')) {
      await System.show(stack, '受け継がれし英雄譚', '基本BP+2000\n【不屈】を付与');
      Effect.modifyBP(stack, stack.processing, stack.target, 2000, { isBaseBP: true });
      Effect.keyword(stack, stack.processing, stack.target, '不屈');
    } else {
      await System.show(stack, '受け継がれし英雄譚', '【英雄】を1枚引く');
      EffectTemplate.reinforcements(stack, stack.processing.owner, { species: '英雄' });
    }
  },
};
