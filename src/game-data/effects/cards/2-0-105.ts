import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // 対戦相手のターン開始時
  onTurnStart: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    // 対戦相手のターン開始時かチェック
    if (opponent.id !== stack.core.getTurnPlayer().id) return;

    // 対戦相手のフィールドにユニットがいるか確認
    if (EffectHelper.isUnitSelectable(stack.core, 'opponents', owner)) {
      await System.show(stack, '番犬のほうこうっ！', '【狂戦士】を付与する');

      // 対戦相手のユニットを1体選択
      const [target] = await EffectHelper.pickUnit(
        stack,
        owner,
        'opponents',
        '【狂戦士】を付与するユニットを選択'
      );
      if (target) {
        Effect.keyword(stack, stack.processing, target, '狂戦士', {
          event: 'turnEnd',
          count: 1,
        });
      }
    }
  },

  onPlayerAttack: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;
    if (!(stack.source instanceof Unit)) return;

    // あなたのユニットがプレイヤーアタックに成功した時
    if (stack.source.owner.id === owner.id) {
      await EffectHelper.combine(stack, [
        {
          title: '地獄の果てまで',
          description: '自身を破壊',
          effect: () => Effect.break(stack, stack.processing, stack.processing),
        },
        {
          title: '地獄の果てまで',
          description: 'トリガーゾーンを1枚破壊',
          effect: () => {
            const [target] = EffectHelper.random(opponent.trigger, 1);
            if (target) {
              Effect.break(stack, stack.processing, target);
            }
          },
          condition: opponent.trigger.length > 0,
        },
      ]);
      // あなたがプレイヤーアタックを受けるたび
    } else {
      if (opponent.trigger.length > 0) {
        await System.show(stack, '地獄の果てまで', 'トリガーゾーンを1枚破壊');
        const [target] = EffectHelper.random(opponent.trigger, 1);
        if (target) {
          Effect.break(stack, stack.processing, target);
        }
      }
    }
  },
};
