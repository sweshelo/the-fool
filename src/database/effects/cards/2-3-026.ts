import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import type { Core } from '@/package/core/core';

export const effects: CardEffects = {
  isBootable: (core: Core, self: Unit): boolean => {
    return EffectHelper.isUnitSelectable(core, 'opponents', self.owner);
  },

  onBootSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, '起動・月に叢雲、花に風', 'ユニットを破壊\n紫ゲージ+2');
    const [target] = await EffectHelper.pickUnit(
      stack,
      stack.processing.owner,
      'opponents',
      '破壊するユニットを選択して下さい',
      1
    );
    Effect.break(stack, stack.processing, target, 'effect');
    await Effect.modifyPurple(stack, stack.processing, stack.processing.owner, 2);
  },

  onBreakSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const purple = stack.processing.owner.purple;
    if (stack.processing.owner.opponent.field.length > 0 && purple !== undefined) {
      await System.show(stack, '月に叢雲、花に風', '敵全体に[紫ゲージ×1000]ダメージ');
      stack.processing.owner.opponent.field.forEach(unit =>
        Effect.damage(stack, stack.processing, unit, purple * 1000)
      );
    }
  },

  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    if (stack.processing.owner.purple && stack.processing.owner.purple >= 4) {
      const choice = await EffectHelper.choice(
        stack,
        stack.processing.owner,
        '選略・狂い狂えどお戯れを',
        [
          {
            id: '1',
            description: 'ランダムで2体作成し消滅',
            condition: () => stack.processing.owner.opponent.field.length >= 2,
          },
          { id: '2', description: '味方全体の基本BP+5000\n【不屈】を与える' },
        ]
      );

      switch (choice) {
        case '1': {
          await System.show(stack, '選略・狂い狂えどお戯れを', 'ランダムで2体作成し消滅');
          EffectHelper.random(stack.processing.owner.opponent.field, 2).forEach(unit => {
            Effect.make(stack, stack.processing.owner, unit);
            Effect.delete(stack, stack.processing, unit);
          });
          break;
        }

        case '2': {
          await System.show(
            stack,
            '選略・狂い狂えどお戯れを',
            '味方全体の基本BP+5000\n【不屈】を与える'
          );
          stack.processing.owner.field.forEach(unit => {
            Effect.modifyBP(stack, stack.processing, unit, 5000, { isBaseBP: true });
            Effect.keyword(stack, stack.processing, unit, '不屈');
          });
          break;
        }
      }
      await Effect.modifyPurple(stack, stack.processing, stack.processing.owner, -4);
    }
  },
};
