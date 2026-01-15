import { Card, Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  checkDrive: (stack: StackWithCard) => {
    if (!(stack.target instanceof Card)) return false;
    const onField =
      stack.processing.owner.opponent.field.find(unit => unit.id === stack.target?.id) ?? false;
    return onField ? true : false;
  },

  // 実際の効果本体
  // 関数名に self は付かない
  onDrive: async (stack: StackWithCard): Promise<void> => {
    const target = stack.target;
    if (!(target instanceof Unit)) return;

    switch (stack.processing.lv) {
      case 1: {
        await System.show(stack, 'アムネシア', 'ターン終了時まで【沈黙】を付与');
        Effect.keyword(stack, stack.processing, target, '沈黙', { event: 'turnEnd', count: 1 });
        break;
      }
      case 2: {
        await System.show(stack, 'アムネシア', '【沈黙】を付与');
        Effect.keyword(stack, stack.processing, target, '沈黙');
        break;
      }
      case 3: {
        await System.show(
          stack,
          'アムネシア',
          '【沈黙】を与え破壊する\n捨札からユニットカードを1枚回収'
        );
        Effect.keyword(stack, stack.processing, target, '沈黙');
        Effect.break(stack, stack.processing, target, 'effect');
        const [salvage] = EffectHelper.random(
          stack.processing.owner.trash.filter(card => card instanceof Unit)
        );

        if (salvage) Effect.move(stack, stack.processing, salvage, 'hand');
        break;
      }
    }
  },
};
