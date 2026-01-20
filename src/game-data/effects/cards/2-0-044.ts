import type { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { Color } from '@/submodule/suit/constant/color';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard) => {
    const owner = stack.processing.owner;
    const purpleGauge = owner.purple ?? 0;
    const trashCards = owner.trash.filter(
      (card): card is Unit =>
        card.catalog.color === Color.PURPLE &&
        card.catalog.cost <= 3 &&
        card.catalog.type === 'unit'
    );

    // 紫ゲージが4以上の場合、捨札からコスト3以下の紫属性ユニットを2体特殊召喚
    if (
      purpleGauge >= 4 &&
      trashCards.length > 0 &&
      stack.core.room.rule.player.max.field - stack.processing.owner.field.length >= 2
    ) {
      await System.show(
        stack,
        '黎明を告げる紫翼',
        '紫属性ユニットに【スピードムーブ】を付与\n捨札から【特殊召喚】\n紫ゲージ-4'
      );
      const selectedCards = EffectHelper.random(trashCards, 2);

      // 特殊召喚と紫ゲージ減少を並列実行
      await Promise.all([
        // 特殊召喚を順番に実行
        (async () => {
          for (const card of selectedCards) {
            await Effect.summon(stack, stack.processing, card);
          }
        })(),
        // 紫ゲージを減少
        Effect.modifyPurple(stack, stack.processing, owner, -4),
      ]);
    } else {
      await System.show(stack, '黎明を告げる紫翼', '紫属性ユニットに【スピードムーブ】を付与');
    }
  },

  onAttackSelf: async (stack: StackWithCard) => {
    const owner = stack.processing.owner;
    const purpleGauge = owner.purple ?? 0;

    if (purpleGauge === 0) return;

    await System.show(
      stack,
      '黎明を告げる紫翼',
      '【貫通】を付与\nBP+[紫ゲージ×1000]\n紫ゲージを消費'
    );

    // 紫属性ユニットに【貫通】を付与
    owner.field.forEach(unit => {
      if (unit.catalog.color === Color.PURPLE) {
        Effect.keyword(stack, stack.processing, unit, '貫通', {
          event: 'turnEnd',
          count: 1,
        });
      }
    });

    // 全てのユニットのBPを+[紫ゲージ×1000]
    const bpBoost = purpleGauge * 1000;
    owner.field.forEach(unit => {
      Effect.modifyBP(stack, stack.processing, unit, bpBoost, {
        event: 'turnEnd',
        count: 1,
      });
    });

    // 紫ゲージを全て消費
    await Effect.modifyPurple(stack, stack.processing, owner, -purpleGauge);
  },

  fieldEffect: (stack: StackWithCard) => {
    stack.processing.owner.field
      .filter(unit => unit.catalog.color === Color.PURPLE && unit.hasKeyword('行動制限'))
      .forEach(unit => Effect.speedMove(stack, unit));
  },
};
