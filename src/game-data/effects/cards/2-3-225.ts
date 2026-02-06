import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import type { Core } from '@/package/core';

const getExceptSelfOwnInsectFilter = (self: Unit) => (unit: Unit) => {
  return (
    unit.id !== self.id &&
    unit.owner.id === self.owner.id &&
    (unit.catalog.species?.includes('昆虫') ?? false)
  );
};

export const effects: CardEffects = {
  // ■起動・命紡ぐ運命の糸
  // このユニット以外のあなたの【昆虫】ユニットを１体選ぶ。それを手札に戻す。
  isBootable: (core: Core, self: Unit): boolean => {
    return EffectHelper.isUnitSelectable(core, getExceptSelfOwnInsectFilter(self), self.owner);
  },

  onBootSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, '起動・命紡ぐ運命の糸', '【昆虫】ユニットを手札に戻す');

    const [selected] = await EffectHelper.pickUnit(
      stack,
      stack.processing.owner,
      getExceptSelfOwnInsectFilter(stack.processing),
      '手札に戻すユニットを選択してください'
    );

    if (selected) {
      Effect.bounce(stack, stack.processing, selected);
    }
  },

  // ■狂い咲く束縛の糸
  // このユニットが戦闘した時、ターン終了時まで戦闘中の相手ユニットに【攻撃禁止】と【防御禁止】を与える。
  onBattleSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const target = stack.processing.id === stack.target?.id ? stack.source : stack.target;
    if (!(target instanceof Unit)) return;

    // 相手がフィールドに存在するか確認
    const exists = target.owner.field.some(unit => unit.id === target.id);
    if (!exists) return;

    await System.show(stack, '狂い咲く束縛の糸', '【攻撃禁止】と【防御禁止】を与える');

    Effect.keyword(stack, stack.processing, target, '攻撃禁止', { event: 'turnEnd', count: 1 });
    Effect.keyword(stack, stack.processing, target, '防御禁止', { event: 'turnEnd', count: 1 });
  },
};
