import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { Color } from '@/submodule/suit/constant/color';

export const effects: CardEffects = {
  // あなたのユニットがフィールドに出た時
  checkDrive: (stack: StackWithCard): boolean => {
    const owner = stack.processing.owner;
    return (
      stack.target instanceof Unit &&
      stack.target.owner.id === owner.id &&
      owner.field.some(unit => unit.id === stack.target?.id)
    );
  },

  onDrive: async (stack: StackWithCard): Promise<void> => {
    if (!(stack.target instanceof Unit)) return;

    // 属性に応じた以下の効果を与える
    switch (stack.target.catalog.color) {
      case Color.RED: {
        await System.show(stack, '虹色のキャンバス', '【不屈】を付与\n基本BP+1000');
        Effect.keyword(stack, stack.processing, stack.target, '不屈');
        break;
      }
      case Color.YELLOW: {
        await System.show(stack, '虹色のキャンバス', '【貫通】を付与\n基本BP+1000');
        Effect.keyword(stack, stack.processing, stack.target, '貫通');
        break;
      }
      case Color.BLUE: {
        await System.show(stack, '虹色のキャンバス', '【スピードムーブ】を付与\n基本BP+1000');
        Effect.speedMove(stack, stack.target);
        break;
      }
      case Color.GREEN: {
        await System.show(stack, '虹色のキャンバス', '【無我の境地】を付与\n基本BP+1000');
        Effect.keyword(stack, stack.processing, stack.target, '無我の境地');
        break;
      }
      case Color.PURPLE: {
        await System.show(
          stack,
          '虹色のキャンバス',
          '【次元干渉／コスト3】を付与\n紫ゲージ+1\n基本BP+1000'
        );
        Effect.keyword(stack, stack.processing, stack.target, '次元干渉', { cost: 3 });
        break;
      }
    }
    // 基本BPを+1000する
    Effect.modifyBP(stack, stack.processing, stack.target, 1000, { isBaseBP: true });

    // 紫属性の場合は追加であなたの紫ゲージを+1する
    if (stack.target.catalog.color === Color.PURPLE) {
      await Effect.modifyPurple(stack, stack.processing, stack.processing.owner, 1);
    }
  },
};
