import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { PermanentEffect } from '@/game-data/effects/engine/permanent';

export const effects: CardEffects = {
  // 【貫通】
  // （このユニットの攻撃は対戦相手のユニットを貫通して対戦相手にライフダメージを与える。この能力はこのユニットがフィールドに出た時に付与される）
  // サポーター／昆虫
  // あなたの【昆虫】ユニットのBPを+1000する。

  // 召喚時に貫通を付与
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, 'サポーター／昆虫＆貫通', '【昆虫】のBP+1000');
    Effect.keyword(stack, stack.processing, stack.processing, '貫通');
  },

  // フィールド効果：昆虫ユニットのBPを+1000する
  fieldEffect: (stack: StackWithCard<Unit>): void => {
    // 自身も含む、自分のフィールド上の昆虫ユニットを対象にする
    PermanentEffect.mount(stack.processing, {
      effect: (target, source) => {
        if (target instanceof Unit)
          Effect.modifyBP(stack, stack.processing, target, 1000, { source });
      },
      effectCode: 'サポーター／昆虫',
      targets: ['owns'],
      condition: target => target instanceof Unit && target.catalog.species?.includes('昆虫'),
    });
  },
};
