import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // ■運命の装填
  // あなたのユニットがフィールドに出た時、あなたのトリガーゾーンにあるカードから1枚選んで手札に戻す。
  // 対戦相手のユニットがフィールドに出た時、あなたのトリガーゾーンにあるカードから1枚選んで手札に戻す。そうした場合、あなたはカードを1枚引く。
  checkDrive: (stack: StackWithCard): boolean => {
    const owner = stack.processing.owner;

    // ユニットが出た時のみ発動
    if (!(stack.target instanceof Unit)) return false;

    // トリガーゾーンにこのカード以外のカードがあるか確認
    return owner.trigger.filter(card => card.id !== stack.processing.id).length > 0;
  },

  onDrive: async (stack: StackWithCard): Promise<void> => {
    const owner = stack.processing.owner;

    if (!(stack.target instanceof Unit)) return;

    // このカード以外のトリガーゾーンのカードを取得
    const triggerCards = owner.trigger.filter(card => card.id !== stack.processing.id);
    if (triggerCards.length === 0) return;

    // 自分のユニットか対戦相手のユニットかで効果が異なる
    const isOwnUnit = stack.target.owner.id === owner.id;

    if (isOwnUnit) {
      await System.show(stack, '運命の装填', 'トリガーゾーンから手札に戻す');

      // トリガーゾーンから1枚選んで手札に戻す
      const [selectedCard] = await EffectHelper.selectCard(
        stack,
        owner,
        triggerCards,
        '手札に戻すカードを選択'
      );

      Effect.bounce(stack, stack.processing, selectedCard, 'hand');
    } else {
      await System.show(stack, '運命の装填', 'トリガーゾーンから手札に戻す\nカードを1枚引く');

      // トリガーゾーンから1枚選んで手札に戻す
      const [selectedCard] = await EffectHelper.selectCard(
        stack,
        owner,
        triggerCards,
        '手札に戻すカードを選択'
      );

      Effect.bounce(stack, stack.processing, selectedCard, 'hand');

      // カードを1枚引く
      EffectTemplate.draw(owner, stack.core);
    }
  },
};
