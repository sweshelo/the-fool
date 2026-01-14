import { Unit } from '@/package/core/class/card';
import type { CardEffects, StackWithCard } from '../schema/types';
import { EffectHelper } from '../engine/helper';
import { System } from '../engine/system';
import { Effect } from '../engine/effect';
import { Joker } from '@/package/core/class/card/Joker';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    const choice = await EffectHelper.choice(
      stack,
      stack.processing.owner,
      '選略・ガレオンプリンセス',
      [
        { id: '1', description: '紫ゲージ+1' },
        {
          id: '2',
          description: 'ジョーカーゲージ-10%\nジョーカーゲージ+40%\n紫ゲージ-3',
          condition: () => (stack.processing.owner.purple ?? 0) >= 3,
        },
      ]
    );

    switch (choice) {
      case '1': {
        await System.show(stack, '選略・ガレオンプリンセス', '紫ゲージ+1');
        await Effect.modifyPurple(stack, stack.processing, stack.processing.owner, 1);
        break;
      }

      case '2': {
        await System.show(
          stack,
          '選略・ガレオンプリンセス',
          'ジョーカーゲージ-10%\nジョーカーゲージ+40%\n紫ゲージ-3'
        );
        Effect.modifyJokerGauge(stack, stack.processing, stack.processing.owner, 40);
        Effect.modifyJokerGauge(stack, stack.processing, stack.processing.owner.opponent, -10);
        await Effect.modifyPurple(stack, stack.processing, stack.processing.owner, -3);
        break;
      }
    }
  },

  onPlayerAttack: async (stack: StackWithCard) => {
    if (stack.source instanceof Unit && stack.processing.owner.id === stack.source.owner.id) {
      await System.show(stack, 'ガレオンプリンセス', 'ジョーカーゲージ+5%');
      Effect.modifyJokerGauge(stack, stack.processing, stack.processing.owner, 5);
    }
  },

  onJoker: async (stack: StackWithCard<Unit>) => {
    if (stack.target instanceof Joker && stack.target.owner.id === stack.processing.owner.id) {
      await System.show(
        stack,
        'ガレオンプリンセス',
        '味方全体の基本BP+2000\n【スピードムーブ】を得る'
      );
      Effect.speedMove(stack, stack.processing);
      stack.processing.owner.field.forEach(unit =>
        Effect.modifyBP(stack, stack.processing, unit, 2000, { isBaseBP: true })
      );
    }
  },
};
