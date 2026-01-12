import { Card, Unit } from '@/package/core/class/card';
import { Effect } from '../classes/effect';
import { System } from '../classes/system';
import type { CardEffects, StackWithCard } from '../classes/types';
import { EffectHelper } from '../classes/helper';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    const self = stack.processing;
    const owner = self.owner;
    if (
      EffectHelper.isUnitSelectable(stack.core, 'opponents', stack.processing.owner) ||
      owner.hand.length === 0
    )
      return;

    // 選択肢を表示
    const choices = [
      { id: '1', description: '効果なし' },
      {
        id: '2',
        description: '手札を1枚消滅\nユニットを1体手札に戻す\n対戦相手のユニットを1体消滅',
      },
    ];

    const [response] = await System.prompt(stack, owner.id, {
      type: 'option',
      title: '選略・聖銀の神弾',
      items: choices,
    });

    if (response === '2') {
      await System.show(
        stack,
        '選略・聖銀の神弾',
        '手札を1枚消滅\nユニットを1体手札に戻す\n対戦相手のユニットを1体消滅'
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

    if (stack.source instanceof Card && stack.source.owner.id !== owner.id) return;

    // 捨札にある消滅しているカードを探す
    const deletedCards = owner.trash.filter(card => owner.delete.includes(card));
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
