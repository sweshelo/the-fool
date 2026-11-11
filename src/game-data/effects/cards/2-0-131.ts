import { Effect } from '@/game-data/effects/engine/effect';
import { System } from '@/game-data/effects/engine/system';
import { EffectTemplate } from '@/game-data/effects/engine/templates';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';
import type { Unit } from '@/package/core/class/card';
import { Color } from '@/submodule/suit/constant';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    await System.show(stack, '固着', '手札に戻らない');
    Effect.keyword(stack, stack.processing, stack.processing, '固着');
  },
  onTurnStart: async (stack: StackWithCard) => {
    if (stack.source.id !== stack.processing.owner.id || (stack.processing.owner.purple ?? 0) < 5)
      return;
    await System.show(stack, '溢れ出る紫力', '紫属性のインターセプトカードを1枚引く');
    EffectTemplate.reinforcements(stack, stack.processing.owner, {
      color: Color.PURPLE,
      type: ['intercept'],
    });
  },
  onTurnEnd: async (stack: StackWithCard) => {
    await System.show(stack, '増幅する魔力', '紫ゲージ+1');
    await Effect.modifyPurple(stack, stack.processing, stack.processing.owner, 1);
  },
  onPlayerAttack: async (stack: StackWithCard<Unit>) => {
    if (stack.target?.id !== stack.processing.owner.id) return;
    await System.show(stack, '魔封解錠', '基本BP+1000');
    Effect.modifyBP(stack, stack.processing, stack.processing, 1000, { isBaseBP: true });
  },
};
