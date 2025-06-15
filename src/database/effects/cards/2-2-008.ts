import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    await System.show(stack, '聖獣の神域', '【破壊効果耐性】');
    Effect.keyword(stack, stack.processing, stack.processing, '破壊効果耐性');
  },

  onAttackSelf: async (stack: StackWithCard<Unit>) => {
    // 【神獣】ユニットが3体以上いるか確認
    const divineBeasts = stack.processing.owner.field.filter(unit =>
      unit.catalog.species?.includes('神獣')
    );
    if (divineBeasts.length < 3) {
      return;
    }

    await System.show(stack, '聖獣の神域', '敵全体の行動権を消費');
    // 相手の全てのユニットの行動権を消費
    stack.processing.owner.opponent.field.forEach(unit => {
      Effect.activate(stack, stack.processing, unit, false);
    });
  },

  onBlock: async (stack: StackWithCard<Unit>) => {
    // 自分のユニットがブロックした時のみ発動
    if (
      !stack.target ||
      !(stack.target instanceof Unit) ||
      stack.target.owner.id !== stack.processing.owner.id
    ) {
      return;
    }

    await System.show(stack, '聖獣の守護', '【神獣】のBP+1000');
    // 【神獣】ユニットのBPを+1000
    stack.processing.owner.field
      .filter(unit => unit.catalog.species?.includes('神獣'))
      .forEach(unit => {
        Effect.modifyBP(stack, stack.processing, unit, 1000, {
          event: 'turnEnd',
          count: 1,
        });
      });
  },
};
