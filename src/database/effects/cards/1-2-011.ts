import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { Color } from '@/submodule/suit/constant/color';

export const effects: CardEffects = {
  // 【スピードムーブ】
  // ■電光石火
  // このユニットがオーバークロックした時、あなたの赤属性ユニットに【スピードムーブ】を与える。

  // 召喚時の効果：スピードムーブを付与
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, 'スピードムーブ', '行動制限の影響を受けない');

    // スピードムーブを付与
    Effect.speedMove(stack, stack.processing);
  },

  // オーバークロック時の効果
  onOverclockSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;

    // 赤属性ユニットを取得（自分以外の赤属性ユニット）
    const redUnits = owner.field.filter(
      unit =>
        unit.id !== stack.processing.id && // 自分以外
        unit.catalog.color === Color.RED
    );

    if (redUnits.length > 0) {
      await System.show(stack, '電光石火', '赤属性ユニットに【スピードムーブ】を付与');

      // 各赤属性ユニットにスピードムーブを付与
      for (const unit of redUnits) {
        Effect.speedMove(stack, unit);
      }
    }
  },
};
