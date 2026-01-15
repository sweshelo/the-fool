import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // ■昆虫たちの司令塔
  // このユニットがフィールドに出た時、【昆虫】ユニットのカードを1枚ランダムで手札に加える。
  // あなたのフィールドに【昆虫】ユニットが4体以上いる場合、さらに【昆虫】ユニットのカードを1枚手札に加える。
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    // プレイヤーのデッキから昆虫ユニットを取得
    const insectUnits = stack.processing.owner.deck.filter(
      card => card instanceof Unit && card.catalog.species?.includes('昆虫')
    );

    // フィールド上の昆虫ユニット数を数える
    const insectCount = stack.processing.owner.field.filter(unit =>
      unit.catalog.species?.includes('昆虫')
    ).length;

    // 引く昆虫カードの枚数を決定（通常は1枚、昆虫が4体以上いる場合は2枚）
    const cardsToDraw = insectCount >= 4 ? 2 : 1;

    if (insectUnits.length > 0) {
      await System.show(stack, '昆虫たちの司令塔', `【昆虫】を${cardsToDraw}枚引く`);

      // 引く枚数分昆虫カードをランダムで手札に加える
      const drawnCards = EffectHelper.random(insectUnits, cardsToDraw);

      // 手札に加える
      for (const card of drawnCards) {
        Effect.move(stack, stack.processing, card, 'hand');
      }
    }
  },
};
