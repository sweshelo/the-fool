import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { Color } from '@/submodule/suit/constant/color';
import { Delta } from '@/package/core/class/delta';

export const effects: CardEffects = {
  // 手札の緑属性ユニットのコストを-1する
  fieldEffect: (stack: StackWithCard<Unit>) => {
    const owner = stack.processing.owner;

    // Check if player is the turn player
    if (owner.id !== stack.core.getTurnPlayer().id) return;

    // Check if no units have been summoned this turn by checking histories
    const hasNotSummonedUnits = !stack.core.histories.some(
      history => history.action === 'drive' && history.card.owner.id === owner.id
    );

    // Apply or remove cost reduction to green units in hand
    owner.hand.forEach(card => {
      if (card.catalog.color === Color.GREEN && card instanceof Unit) {
        // Find delta from this card
        const delta = card.delta.find(d => d.source?.unit === stack.processing.id);

        if (delta && delta.effect.type === 'cost') {
          if (!hasNotSummonedUnits) {
            // Remove delta if condition is no longer met
            card.delta = card.delta.filter(d => !(d.source?.unit === stack.processing.id));
          }
        } else if (hasNotSummonedUnits) {
          // Add delta if condition is met
          card.delta.push(
            new Delta(
              { type: 'cost', value: -1 },
              {
                source: {
                  unit: stack.processing.id,
                },
              }
            )
          );
        }
      }
    });
  },

  // メロンソーラー♪ - ユニット召喚時効果
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    const owner = stack.processing.owner;

    if (stack.processing.lv >= 2) {
      // レベル2以上：カードを1枚引く
      await System.show(stack, 'メロンソーラー♪', 'カードを1枚引く');
      EffectTemplate.draw(owner, stack.core);
    } else {
      // レベル1：手札を1枚選んで捨てる→カードを1枚引く
      if (owner.hand.length > 0) {
        await System.show(stack, 'メロンソーラー♪', '手札を1枚選んで捨てる\nカードを1枚引く');

        // 手札を選択
        const [card] = await EffectHelper.selectCard(
          stack,
          owner,
          owner.hand,
          '捨てるカードを選択して下さい'
        );

        // カードを捨てる
        Effect.handes(stack, stack.processing, card);

        // カードを1枚引く
        EffectTemplate.draw(owner, stack.core);
      } else {
        await System.show(stack, '安心をあなたに', '手札の緑属性のコスト-1');
      }
    }
  },
};
