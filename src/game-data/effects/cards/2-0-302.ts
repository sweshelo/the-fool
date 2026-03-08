import { Unit } from '@/package/core/class/card';
import { System } from '../engine/system';
import type { CardEffects, StackWithCard } from '../schema/types';
import { EffectHelper } from '@/game-data/effects/engine/helper';
import { Effect } from '@/game-data/effects/engine/effect';

export const effects: CardEffects = {
  onPlayerAttackSelf: async (stack: StackWithCard) => {
    const targets = stack.processing.owner.opponent.field.filter(unit =>
      unit.hasKeyword('防御禁止')
    );
    if (targets.length > 0) {
      await System.show(stack, 'ご褒美よ！', '【防御禁止】に5000ダメージ');
      targets.forEach(unit => Effect.damage(stack, stack.processing, unit, 5000));
    }
  },
  onPlayerAttack: async (stack: StackWithCard) => {
    if (
      stack.source instanceof Unit &&
      stack.source.owner.id !== stack.processing.owner.id &&
      stack.source.owner.field.some(unit => unit.id === stack.source.id) &&
      EffectHelper.isUnitSelectable(stack.core, 'opponents', stack.processing.owner)
    ) {
      await System.show(stack, 'まってなさい！', '【防御禁止】を付与');
      const [target] = await EffectHelper.pickUnit(
        stack,
        stack.processing.owner,
        'opponents',
        '【防御禁止】を与えるユニットを選択'
      );
      Effect.keyword(stack, stack.processing, target, '防御禁止');
    }
  },
};
