import { Unit } from '@/package/core/class/card';
import { Effect } from '../classes/effect';
import { System } from '../classes/system';
import type { CardEffects, StackWithCard } from '../classes/types';
import { EffectHelper } from '../classes/helper';
import { EffectTemplate } from '../classes/templates';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    const self = stack.processing as Unit;
    const owner = self.owner;

    await System.show(stack, '日輪の護風剣', '【戦士】を1枚引く\n【戦士】に【秩序の盾】を与える');
    EffectTemplate.reinforcements(stack, owner, { species: '戦士' });

    // フィールドの【戦士】ユニットを1体選ぶ
    const filter = unit =>
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
    const self = stack.processing as Unit;
    const target = stack.target as Unit;

    // このユニット以外の【戦士】ユニットがフィールドに出た時
    if (target !== self && target.catalog.species?.includes('戦士')) {
      await System.show(stack, '日輪発破の陣', '基本BP+1000');
      Effect.modifyBP(stack, self, target, 1000, { isBaseBP: true });
    }
  },
};
