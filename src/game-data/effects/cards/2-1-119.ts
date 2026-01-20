import { Unit } from '@/package/core/class/card';
import { Effect } from '../engine/effect';
import { System } from '../engine/system';
import type { CardEffects, StackWithCard } from '../schema/types';
import { EffectHelper } from '../engine/helper';
import { EffectTemplate } from '../engine/templates';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    const self = stack.processing;
    const owner = self.owner;

    await System.show(stack, '日輪の護風剣', '【戦士】を1枚引く\n【戦士】に【秩序の盾】を与える');
    EffectTemplate.reinforcements(stack, owner, { species: '戦士' });

    // フィールドの【戦士】ユニットを1体選ぶ
    const filter = (unit: Unit) =>
      (unit.catalog.species?.includes('戦士') && stack.processing.owner.id === unit.owner.id) ??
      false;
    (
      await EffectHelper.pickUnit(
        stack,
        owner,
        filter,
        '【秩序の盾】を与えるユニットを選択して下さい',
        1
      )
    ).forEach(unit => Effect.keyword(stack, self, unit, '秩序の盾'));
  },

  onDrive: async (stack: StackWithCard<Unit>) => {
    const self = stack.processing;
    const target = stack.target;

    // このユニット以外の【戦士】ユニットがフィールドに出た時
    if (
      target instanceof Unit &&
      target !== self &&
      self.owner.id === target.owner.id &&
      target.catalog.species?.includes('戦士')
    ) {
      await System.show(stack, '日輪発破の陣', '基本BP+1000');
      Effect.modifyBP(stack, self, target, 1000, { isBaseBP: true });
    }
  },
};
