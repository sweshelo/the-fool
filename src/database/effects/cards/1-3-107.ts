import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // 【加護】
  // ■恩寵の牙
  // 対戦相手のユニットがフィールドに出た時、対戦相手の捨札にあるカードをランダムで3枚消滅させる。

  // 召喚時の効果：加護を付与
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, '加護', '効果に選ばれない');
    Effect.keyword(stack, stack.processing, stack.processing, '加護');
  },

  // 相手ユニットが出た時の効果
  onDrive: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    // 相手のユニットが出た時のみ処理
    if (stack.target instanceof Unit && stack.target.owner.id === opponent.id) {
      // 相手の捨て札が3枚以上あるか確認
      if (opponent.trash.length > 0) {
        await System.show(stack, '恩寵の牙', '捨札を3枚消滅');
        EffectHelper.random(opponent.trash, Math.min(3, opponent.trash.length)).forEach(card =>
          Effect.move(stack, stack.processing, card, 'delete')
        );
      }
    }
  },
};
