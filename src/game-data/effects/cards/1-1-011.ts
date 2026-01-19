import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { PermanentEffect } from '../engine/permanent';

export const effects: CardEffects = {
  // 【加護】
  // ■インフィニティーバースト
  // このユニットがアタックした時、あなたのユニットを1体選ぶ。それの行動権を回復する。
  // ■エンジェリックシールド
  // あなたのライフが6以下の時、あなたの【天使】ユニットに【加護】を与える。

  // 召喚時の効果：加護を付与
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(
      stack,
      'エンジェリックシールド＆加護',
      '【加護】\n味方の【天使】に【加護】を付与'
    );

    // 加護を付与
    Effect.keyword(stack, stack.processing, stack.processing, '加護');
  },

  // アタック時の効果
  onAttackSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;

    // 自分のユニットが選択できるか確認
    if (EffectHelper.isUnitSelectable(stack.core, 'owns', owner)) {
      await System.show(stack, 'インフィニティーバースト', 'ユニットの行動権を回復');
      // ユニットを1体選択
      const [target] = await EffectHelper.pickUnit(
        stack,
        owner,
        'owns',
        '行動権を回復するユニットを選択'
      );

      // 行動権を回復
      Effect.activate(stack, stack.processing, target, true);
    }
  },

  // フィールド効果：ライフが6以下の時、天使ユニットに加護を与える
  fieldEffect: (stack: StackWithCard<Unit>): void => {
    PermanentEffect.mount(stack, stack.processing, {
      effect: (target, source) => {
        if (target instanceof Unit)
          Effect.keyword(stack, stack.processing, target, '加護', { source });
      },
      effectCode: 'エンジェリックシールド',
      condition: target =>
        target.catalog.species?.includes('天使') && stack.processing.owner.life.current <= 6,
      targets: ['owns'],
    });
  },
};
