import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import { PermanentEffect } from '../engine/permanent';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // 召喚した際に【固着】【秩序の盾】【セレクトハック】を付与
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const self = stack.processing;
    if (self.owner.life.current <= 3) {
      await System.show(
        stack,
        '固着＆秩序の盾＆セレクトハック＆貫通',
        '手札に戻らない\n相手の効果によるダメージを受けない\nこのユニットを選ばなければならない\nブロックを貫通してプレイヤーにダメージを与える'
      );
    } else {
      await System.show(
        stack,
        '固着＆秩序の盾＆セレクトハック',
        '手札に戻らない\n相手の効果によるダメージを受けない\nこのユニットを選ばなければならない'
      );
    }
    Effect.keyword(stack, self, self, '固着');
    Effect.keyword(stack, self, self, '秩序の盾');
    Effect.keyword(stack, self, self, 'セレクトハック');
  },

  // ■諸星緑碧斬り
  // あなたのライフが３以下の時、このユニットに【貫通】を与える。
  fieldEffect: (stack: StackWithCard<Unit>): void => {
    PermanentEffect.mount(stack.processing, {
      effect: (target, source) => {
        if (target instanceof Unit)
          Effect.keyword(stack, stack.processing, target, '貫通', { source });
      },
      effectCode: '諸星緑碧斬り',
      targets: ['self'],
      condition: () => stack.processing.owner.life.current <= 3,
    });
  },

  // ■折れない心
  // このユニットがオーバークロックした時、このユニットに【不屈】を与える。
  onOverclockSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const self = stack.processing;
    await System.show(stack, '折れない心', '【不屈】を得る');
    Effect.keyword(stack, self, self, '不屈');
  },
};
