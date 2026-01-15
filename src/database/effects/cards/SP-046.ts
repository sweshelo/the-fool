import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // このユニットがフィールドに出た時、あなたのデッキから1枚ランダムであなたのトリガーゾーンに赤属性のインターセプトカードをセットする
  onDriveSelf: async (stack: StackWithCard): Promise<void> => {
    const owner = stack.processing.owner;

    // デッキから赤属性のインターセプトカードを抽出
    const redIntercepts = owner.deck.filter(
      card => card.catalog.type === 'intercept' && card.catalog.color === 1
    );

    // トリガーゾーンに空きがあり、対象カードが存在する場合
    if (
      redIntercepts.length > 0 &&
      owner.trigger.length < stack.core.room.rule.player.max.trigger
    ) {
      await System.show(
        stack,
        '熱きパッション',
        'デッキから赤属性のインターセプトカードをトリガーゾーンにセット'
      );
      const [target] = EffectHelper.random(redIntercepts, 1);
      if (target) Effect.move(stack, stack.processing, target, 'trigger');
    }
  },
};
