import { Card, Unit } from '@/package/core/class/card';
import { Effect } from '../engine/effect';
import { System } from '../engine/system';
import type { CardEffects, StackWithCard } from '../schema/types';
import { EffectHelper } from '../engine/helper';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    const self = stack.processing;
    const owner = self.owner;
    const choice = await EffectHelper.choice(stack, owner, '選略・聖銀の神弾', [
      { id: '1', description: '効果なし' },
      {
        id: '2',
        description: '手札を1枚消滅\nユニットを手札に戻す\n相手のユニットを消滅',
        condition:
          EffectHelper.isUnitSelectable(stack.core, 'opponents', stack.processing.owner) &&
          owner.hand.length > 0,
      },
    ]);

    if (choice === '2') {
      await System.show(
        stack,
        '選略・聖銀の神弾',
        '手札を1枚消滅\nユニットを手札に戻す\n相手のユニットを消滅'
      );

      // 手札を1枚ランダムで消滅
      const [handCard] = EffectHelper.random(owner.hand, 1);
      if (handCard) {
        Effect.move(stack, self, handCard, 'delete');
      }

      // フィールドのユニットを1体ランダムで手札に戻す
      const [fieldUnit] = EffectHelper.random(owner.field, 1);
      if (fieldUnit) {
        Effect.bounce(stack, self, fieldUnit, 'hand');
      }

      // 対戦相手のユニットを1体選んで消滅
      const [target] = await EffectHelper.pickUnit(
        stack,
        owner,
        'opponents',
        '消滅させるユニットを選択して下さい',
        1
      );
      if (target) {
        Effect.delete(stack, self, target);
      }
    }
  },

  onTrigger: async (stack: StackWithCard<Unit>) => {
    const self = stack.processing;
    const owner = self.owner;

    if (stack.target instanceof Card && stack.target.owner.id === owner.id) return;

    // 捨札にある消滅しているカードを探す
    const deletedCards = owner.delete;
    if (deletedCards.length > 0) {
      await System.show(stack, '銀弾装填', '消滅から1枚回収');

      // ランダムで1枚選んで手札に加える
      const [card] = EffectHelper.random(deletedCards, 1);
      if (card) {
        Effect.move(stack, self, card, 'hand');
      }
    }
  },
};
