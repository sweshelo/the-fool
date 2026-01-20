import { Effect } from '../engine/effect';
import { System } from '../engine/system';
import { EffectTemplate } from '../engine/templates';
import type { CardEffects, StackWithCard } from '../schema/types';
import { Unit } from '@/package/core/class/card';

export const mainEffect = async (stack: StackWithCard) => {
  await System.show(stack, '魔素分解分泌液', '紫ゲージ+1');
  await Effect.modifyPurple(stack, stack.processing, stack.processing.owner, 1);
};

export const effects: CardEffects = {
  onDriveSelf: mainEffect,
  onDrive: async (stack: StackWithCard) => {
    if (
      stack.target instanceof Unit &&
      stack.target.catalog.species?.includes('昆虫') &&
      stack.target.id !== stack.processing.id &&
      stack.target.owner.id === stack.processing.owner.id
    )
      await mainEffect(stack);
  },
  onBreakSelf: async (stack: StackWithCard) => {
    await System.show(stack, '寄生増殖', '【昆虫】を1枚引く');
    EffectTemplate.reinforcements(stack, stack.processing.owner, { species: '昆虫' });
  },
};
