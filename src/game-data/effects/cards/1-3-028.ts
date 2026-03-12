import { Unit } from '@/package/core/class/card';
import { Effect, EffectTemplate } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { System } from '../engine/system';
import { PermanentEffect } from '@/game-data/effects/engine/permanent';

export const effects: CardEffects = {
  // ■援軍／獣
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, '援軍／獣＆リトルキャットソウル', '【獣】ユニットを1枚引く\nBP+4000');
    EffectTemplate.reinforcements(stack, stack.processing.owner, { species: '獣' });
  },

  // ■リトルキャットソウル
  // あなたのフィールドに【獣】ユニットが3体以上いる時、このユニットのBPを+4000する
  fieldEffect: (stack: StackWithCard<Unit>): void => {
    PermanentEffect.mount(stack.processing, {
      effect: (target, source) => {
        if (target instanceof Unit)
          Effect.modifyBP(stack, stack.processing, target, 3000, { source });
      },
      targets: ['self'],
      condition: target =>
        target.owner.field.filter(unit => unit.catalog.species?.includes('獣')).length >= 3,
      effectCode: 'リトルキャットソウル',
    });
  },
};
