import { Unit, type Card } from '@/package/core/class/card';
import type { CardEffects, StackWithCard } from '../classes/types';
import type { Core } from '@/package/core/core';
import { Delta } from '@/package/core/class/delta';
import { Effect } from '../classes/effect';
import { System } from '../classes/system';
import { Color } from '@/submodule/suit/constant/color';
import master from '@/database/catalog';
import { EffectHelper } from '../classes/helper';

export const effects: CardEffects = {
  handEffect: (core: Core, self: Card) => {
    const targetDelta = self.delta.find(delta => delta.source?.unit === self.id);
    if (targetDelta && targetDelta.effect.type === 'cost') {
      targetDelta.effect.value = Math.max(
        -self.owner.trash.filter(card => card.catalog.color === Color.BLUE).length,
        -16
      );
    } else {
      self.delta.push(
        new Delta(
          {
            type: 'cost',
            value: Math.max(
              -self.owner.trash.filter(card => card.catalog.color === Color.BLUE).length,
              -16
            ),
          },
          undefined,
          undefined,
          undefined,
          { unit: self.id }
        )
      );
    }
  },

  onDriveSelf: async (stack: StackWithCard) => {
    const targets = stack.processing.owner.opponent.field.filter(
      unit => unit.currentBP >= (stack.processing as Unit).currentBP
    );

    if (targets.length > 0) {
      await System.show(stack, '神槍蒼波・グングニール', '敵全体の自身のBP以上のユニットを破壊');
      targets.forEach(unit => Effect.break(stack, stack.processing, unit, 'effect'));
    }
  },

  isBootable: (core: Core, self: Unit) => {
    return self.owner.trash.length >= 3 && self.owner.hand.length < core.room.rule.player.max.hand;
  },

  onBootSelf: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, '起動・エインヘリャル', 'ランダムな【機械】を3枚作成');
    const candidate: string[] = Array.from(master.values())
      .filter(catalog => catalog.species?.includes('機械'))
      .map(catalog => catalog.id);
    EffectHelper.random(
      candidate,
      Math.min(stack.core.room.rule.player.max.hand - stack.processing.owner.hand.length, 3)
    ).forEach(id => {
      stack.processing.owner.hand.push(new Unit(stack.processing.owner, id));
    });

    EffectHelper.random(stack.processing.owner.trash, 3).forEach(card =>
      Effect.move(stack, stack.processing, card, 'delete')
    );
  },
};
