import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // ■至上のコレクター
  // あなたのターン終了時、あなたの捨札にユニットが8種族以上いる場合、あなたは捨札を全てデッキに戻す。あなたはカードを2枚引く。
  checkTurnEnd: (stack: StackWithCard): boolean => {
    const owner = stack.processing.owner;

    // 自分のターン終了時のみ発動
    if (stack.core.getTurnPlayer().id !== owner.id) return false;

    // 捨札のユニットの種族を数える
    const speciesSet = new Set<string>();
    owner.trash.forEach(card => {
      if (card instanceof Unit && card.catalog.species) {
        card.catalog.species.forEach(s => speciesSet.add(s));
      }
    });

    // 8種族以上いるか確認
    return speciesSet.size >= 8;
  },

  onTurnEnd: async (stack: StackWithCard): Promise<void> => {
    const owner = stack.processing.owner;

    await System.show(stack, '至上のコレクター', '捨札をデッキに戻す\nカードを2枚引く');

    // 捨札を全てデッキに戻す
    const trashCards = [...owner.trash];
    trashCards.forEach(card => {
      Effect.move(stack, stack.processing, card, 'deck');
    });

    // デッキをシャッフル
    owner.deck.splice(0, owner.deck.length, ...EffectHelper.shuffle(owner.deck));

    // カードを2枚引く
    EffectTemplate.draw(owner, stack.core);
    EffectTemplate.draw(owner, stack.core);
  },
};
