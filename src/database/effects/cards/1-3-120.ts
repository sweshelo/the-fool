import { Unit } from '@/package/core/class/card';
import { Effect, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { Color } from '@/submodule/suit/constant/color';

export const effects: CardEffects = {
  // 自身が召喚された時に発動する効果を記述
  onDriveSelf: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, '秩序の盾', '対戦相手の効果によるダメージを受けない');
    Effect.keyword(stack, stack.processing, stack.processing as Unit, '秩序の盾');
  },

  onDrive: async (stack: StackWithCard): Promise<void> => {
    if (stack.target instanceof Unit && stack.processing.owner.id !== stack.target.owner.id) {
      await System.show(stack, '吟遊の調べ', 'ターン終了時まで【攻撃禁止】を与える');
      Effect.keyword(stack, stack.processing, stack.target, '攻撃禁止', {
        event: 'turnEnd',
        count: 1,
      });
    }
  },

  onBreakSelf: async (stack: StackWithCard): Promise<void> => {
    if (
      stack.processing.owner.field.filter(unit => unit.catalog.color === Color.GREEN).length >= 2
    ) {
      await System.show(stack, '希望の旋律', '【舞姫】を１枚引く');
      EffectTemplate.reinforcements(stack, stack.processing.owner, { species: '舞姫' });
    }
  },
};
