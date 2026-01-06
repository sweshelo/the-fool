import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // ■スパイダー×スライサー
  // このユニットがフィールドに出た時、このユニットのレベルによって効果が発動する。
  async onDriveSelf(stack: StackWithCard<Unit>) {
    const self = stack.processing;
    const owner = self.owner;
    const opponent = owner.opponent;

    switch (self.lv) {
      // Lv1: 相手ユニット1体選び1000ダメージ→成功時自身にスピードムーブ
      case 1:
        if (opponent.field_selectable) {
          await System.show(
            stack,
            'スパイダー×スライサー',
            '敵ユニット1体に1000ダメージ\n自身に【スピードムーブ】'
          );
          const [target] = await EffectHelper.selectUnit(
            stack,
            owner,
            opponent.field,
            'ダメージを与えるユニットを選択'
          );
          const destroyed = Effect.damage(stack, self, target, 1000, 'effect');
          if (destroyed) {
            Effect.speedMove(stack, self);
          }
        }
        break;
      case 2:
        // Lv2: 自身にスピードムーブ→相手ユニットランダム1体に2000ダメージ
        Effect.speedMove(stack, self);
        if (opponent.field_selectable) {
          await System.show(
            stack,
            'スパイダー×スライサー',
            '自身に【スピードムーブ】\n敵ユニット1体に2000ダメージ'
          );
          const [target] = EffectHelper.random(opponent.field, 1);
          if (target) {
            Effect.damage(stack, self, target, 2000, 'effect');
          }
        }
        break;
      case 3:
        // Lv3: 相手ユニットランダム1体に7000ダメージ
        if (opponent.field_selectable) {
          await System.show(stack, 'スパイダー×スライサー', '敵ユニット1体に7000ダメージ');
          const [target] = EffectHelper.random(opponent.field, 1);
          if (target) {
            Effect.damage(stack, self, target, 7000, 'effect');
          }
        }
        break;
    }
  },
};
