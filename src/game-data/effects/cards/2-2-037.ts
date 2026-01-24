import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // ■招かれざる客
  // ユニットがフィールドに出た時、対戦相手の捨札からカードを2枚選ぶ。それらのカードを対戦相手の手札に加える。あなたはカードを1枚引く。
  checkDrive: (stack: StackWithCard): boolean => {
    const opponent = stack.processing.owner.opponent;

    // ユニットが出た時に発動
    if (!(stack.target instanceof Unit)) return false;

    // 対戦相手の捨札に2枚以上あるか確認
    return opponent.trash.length >= 2;
  },

  onDrive: async (stack: StackWithCard): Promise<void> => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    await System.show(stack, '招かれざる客', '相手の捨札を手札に\nカードを1枚引く');

    // 対戦相手の捨札からカードを2枚選ぶ
    const count = Math.min(2, opponent.trash.length);
    const selectedCards = await EffectHelper.selectCard(
      stack,
      owner,
      opponent.trash,
      '対戦相手の手札に加えるカードを選択',
      count
    );

    // 選んだカードを対戦相手の手札に加える
    for (const card of selectedCards) {
      Effect.move(stack, stack.processing, card, 'hand');
    }

    // あなたはカードを1枚引く
    EffectTemplate.draw(owner, stack.core);
  },
};
