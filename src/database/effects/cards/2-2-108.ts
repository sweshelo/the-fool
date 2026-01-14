import { Unit } from '@/package/core/class/card';
import { Effect } from '../classes/effect';
import { System } from '../classes/system';
import type { CardEffects, StackWithCard } from '../classes/types';
import { EffectHelper } from '../classes/helper';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    const self = stack.processing;
    const owner = self.owner;

    // 手札が6枚以下の場合
    if (owner.hand.length <= 6) {
      await System.show(
        stack,
        'お宝ゲットォ！',
        'デッキから3枚見る\n1枚を手札に加える\n残りは消滅'
      );

      // デッキから3枚ランダムで見る
      const cards = EffectHelper.random(owner.deck, 3);
      if (cards.length > 0) {
        // 1枚を選んで手札に加える
        const [selected] = await EffectHelper.selectCard(
          stack,
          owner,
          cards,
          '手札に加えるカードを選択して下さい',
          1
        );
        if (selected) {
          Effect.move(stack, self, selected, 'hand');
        }

        // 残りのカードを消滅させる
        cards
          .filter(card => card !== selected)
          .forEach(card => {
            Effect.move(stack, self, card, 'delete');
          });
      }
    }
  },
};
