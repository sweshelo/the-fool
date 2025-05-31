import { Unit } from '@/package/core/class/card';
import { Effect, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // インターセプトなので、対戦相手のユニット召喚時に発動条件をチェック
  checkDrive: (stack: StackWithCard): boolean => {
    // 相手のユニットが召喚された場合のみ発動可能
    return (
      stack.target instanceof Unit &&
      stack.target.owner.id === stack.processing.owner.opponent.id &&
      stack.processing.owner.opponent.field.some(unit => unit.id === stack.target?.id)
    );
  },

  onDrive: async (stack: StackWithCard): Promise<void> => {
    // stack.targetがUnitであることを確認
    if (
      stack.target instanceof Unit &&
      stack.target.owner.id === stack.processing.owner.opponent.id
    ) {
      switch (stack.target.lv) {
        case 1:
        case 2:
          // レベル1-2の処理
          await System.show(
            stack,
            '封札の紫呪印',
            '【進化禁止】を与える\nインターセプトカードを1枚引く\n紫ゲージ+1'
          );

          // 【進化禁止】をターン終了時まで付与
          Effect.keyword(stack, stack.processing, stack.target, '進化禁止', {
            event: 'turnEnd',
            count: 1,
          });

          // インターセプトカードを1枚引く
          EffectTemplate.reinforcements(stack, stack.processing.owner, { type: ['intercept'] });

          // 紫ゲージ+1
          Effect.modifyPurple(stack, stack.processing, stack.processing.owner, +1);
          break;

        case 3:
          // レベル3の処理
          await System.show(stack, '封札の紫呪印', 'ユニットをデッキに戻す\n紫ゲージ+3');

          // デッキに戻す
          Effect.bounce(stack, stack.processing, stack.target, 'deck');

          // 紫ゲージ+3
          Effect.modifyPurple(stack, stack.processing, stack.processing.owner, +3);
          break;
      }
    }
  },
};
