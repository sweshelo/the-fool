import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { PermanentEffect } from '@/game-data/effects/engine/permanent';

// カードがフィールドにあるかをカタログの name で判断するヘルパー関数
const hasFourGodCard = (stack: StackWithCard<Unit>, name: string): boolean => {
  return stack.processing.owner.field.some(unit => unit.catalog.name === name);
};

// フィールド上の【四聖獣】ユニット数を数える
const countFourGodUnits = (stack: StackWithCard<Unit>): number => {
  return stack.processing.owner.field.filter(unit => unit.catalog.species?.includes('四聖獣'))
    .length;
};

export const effects: CardEffects = {
  // このユニットがフィールドに出た時、あなたのフィールドの【四聖獣】ユニットの数だけ対戦相手のユニットをランダムで消滅させる。
  // あなたの【四聖獣】ユニットに【加護】と【貫通】を与える。
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    // フィールドにいる【四聖獣】ユニットの数を数える
    const fourGodCount = countFourGodUnits(stack);
    // 対戦相手のユニットをランダムで消滅させる（四聖獣の数だけ）
    const opponentUnits = stack.processing.owner.opponent.field;

    if (fourGodCount > 0 && opponentUnits.length > 0) {
      await System.show(
        stack,
        '四聖を統べる少女',
        '【四聖獣】ユニットの数だけ消滅\n【四聖獣】ユニットに【加護】と【貫通】を付与'
      );

      // 消滅させる数（対戦相手のユニット数と四聖獣の数の小さい方）
      const deleteCount = Math.min(fourGodCount, opponentUnits.length);

      if (deleteCount > 0) {
        // EffectHelper.randomを使ってランダムなユニットを選択
        const randomUnits = EffectHelper.random(opponentUnits, deleteCount);

        // 選択したユニットを消滅させる
        for (const unit of randomUnits) {
          Effect.delete(stack, stack.processing, unit);
        }
      }
    } else {
      await System.show(stack, '四聖を統べる少女', '【四聖獣】ユニットに【加護】と【貫通】を付与');
    }
  },

  // あなたの【四聖獣】ユニットに【加護】と【貫通】を与える（フィールド効果）
  fieldEffect: (stack: StackWithCard<Unit>): void => {
    PermanentEffect.mount(stack.processing, {
      effect: (target, source) => {
        if (target instanceof Unit)
          Effect.keyword(stack, stack.processing, target, '加護', { source });
      },
      effectCode: '四聖を統べる少女_加護',
      targets: ['owns'],
      condition: target => target instanceof Unit && target.catalog.species?.includes('四聖獣'),
    });
    PermanentEffect.mount(stack.processing, {
      effect: (target, source) => {
        if (target instanceof Unit)
          Effect.keyword(stack, stack.processing, target, '貫通', { source });
      },
      effectCode: '四聖を統べる少女_貫通',
      targets: ['owns'],
      condition: target => target instanceof Unit && target.catalog.species?.includes('四聖獣'),
    });
  },

  // あなたのターン開始時、あなたのフィールドに［青龍］［朱雀］［白虎］［玄武］がいる場合、対戦相手に4ライフダメージを与える。
  onTurnStart: async (stack: StackWithCard<Unit>): Promise<void> => {
    // 自分のターンの開始時のみ発動
    if (stack.processing.owner.id === stack.core.getTurnPlayer().id) {
      // 4種の四神がすべているか確認
      const hasSeiryu = hasFourGodCard(stack, '青龍');
      const hasSuzaku = hasFourGodCard(stack, '朱雀');
      const hasByakko = hasFourGodCard(stack, '白虎');
      const hasGenbu = hasFourGodCard(stack, '玄武');

      // 全てが揃っている場合のみ発動
      if (hasSeiryu && hasSuzaku && hasByakko && hasGenbu) {
        await System.show(stack, '愛の奇跡', '対戦相手に4ライフダメージ');

        // 対戦相手に4ライフダメージを与える
        for (let i = 0; i < 4; i++) {
          Effect.modifyLife(stack, stack.processing, stack.processing.owner.opponent, -1);
        }
      }
    }
  },
};
