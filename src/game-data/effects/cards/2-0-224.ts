import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { Card } from '@/package/core/class/card';

export const effects: CardEffects = {
  //■意志の継承
  //ユニットがフィールドに出た時、あなたの全てのユニットの【沈黙】を取り除く。

  //ユニットが出た時、【沈黙】ユニットがいるかどうか確認
  checkDrive: (stack: StackWithCard): boolean => {
    const owner = stack.processing.owner;
    const silencedUnits = owner.field.filter(unit => unit.hasKeyword && unit.hasKeyword('沈黙'));

    return silencedUnits.length > 0;
  },

  onDrive: async (stack: StackWithCard<Card>) => {
    const owner = stack.processing.owner;
    const silencedUnits = owner.field.filter(unit => unit.hasKeyword && unit.hasKeyword('沈黙'));

    await System.show(stack, '意志の継承', '自ユニットの【沈黙】を除去');

    //【沈黙】ユニットの数だけループして除去
    for (const unit of silencedUnits) {
      Effect.removeKeyword(stack, unit, '沈黙');
    }
  },
};
