import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { PermanentEffect } from '@/game-data/effects/engine/permanent';

async function unitAttackEffect(stack: StackWithCard<Unit>): Promise<void> {
  // どのユニットがアタックしてもこの効果は発動する
  await System.show(stack, 'ラッキー☆スター', '基本BP+1000');

  // 基本BPを+1000する
  Effect.modifyBP(stack, stack.processing, stack.processing, 1000, {
    isBaseBP: true,
  });
}

export const effects: CardEffects = {
  // 【不屈】
  // ■ラッキー☆スター
  // ユニットがアタックするたび、このユニットの基本BPを+1000する。
  // ■フェイタル☆アロー
  // あなたの【天使】ユニットに【貫通】を与える。

  // 召喚時の効果
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, 'フェイタル☆アロー', '【不屈】\n【天使】に【貫通】を付与');

    // 不屈を付与
    Effect.keyword(stack, stack.processing, stack.processing, '不屈');
  },

  // アタック時の効果
  onAttackSelf: unitAttackEffect,
  onAttack: async (stack: StackWithCard<Unit>) => {
    if (stack.target instanceof Unit && stack.target.id === stack.processing.id) return;
    await unitAttackEffect(stack);
  },

  // フィールド効果：天使ユニットに貫通を与える
  fieldEffect: (stack: StackWithCard<Unit>): void => {
    PermanentEffect.mount(stack.processing, {
      effect: (target, source) => {
        if (target instanceof Unit)
          Effect.keyword(stack, stack.processing, target, '貫通', { source });
      },
      effectCode: 'フェイタル☆アロー',
      condition: target => target instanceof Unit && target.catalog.species?.includes('天使'),
      targets: ['owns'],
    });
  },
};
