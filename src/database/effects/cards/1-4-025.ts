import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // ■虫の知らせ
  // このユニットが破壊された時、【昆虫】ユニットのカードを2枚までランダムで手札に加える。
  onBreakSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    // プレイヤーのデッキから昆虫ユニットを取得
    const insectUnits = stack.processing.owner.deck.filter(
      card => card instanceof Unit && card.catalog.species?.includes('昆虫')
    );

    if (insectUnits.length > 0) {
      await System.show(stack, '虫の知らせ', '【昆虫】ユニットを2枚まで手札に加える');

      // 最大2枚の昆虫ユニットをランダムで選択
      const selectedCards = EffectHelper.random(insectUnits, Math.min(2, insectUnits.length));

      // 選択したカードを手札に加える
      for (const card of selectedCards) {
        Effect.move(stack, stack.processing, card, 'hand');
      }
    }
  },
};
