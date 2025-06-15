import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, EffectTemplate, System } from '..';
import type { StackWithCard } from '../classes/types';

export const effects = {
  onDrive: async (stack: StackWithCard) => {
    // 対戦相手の捨札にカードが3枚以上あることを確認
    const opponentTrash = stack.processing.owner.opponent.trash;
    if (opponentTrash.length < 3) return;

    await System.show(stack, '盗賊の手', '対戦相手の捨札から3枚消滅\nカードを1枚引く');

    // 対戦相手の捨札から3枚選んで消滅させる
    const selectedCards = await EffectHelper.selectCard(
      stack,
      stack.processing.owner,
      opponentTrash,
      '消滅させるカードを3枚選んでください',
      3
    );

    for (const card of selectedCards) {
      Effect.move(stack, stack.processing, card, 'delete');
    }

    // カードを1枚引く
    EffectTemplate.draw(stack.processing.owner, stack.core);
  },

  checkDrive: (stack: StackWithCard) => {
    // 対戦相手のユニットがフィールドに出た時（source が対戦相手で target がユニット）
    // かつ対戦相手の捨札に3枚以上カードがある場合にトリガー
    return (
      stack.target instanceof Unit &&
      stack.target.owner?.id === stack.processing.owner.opponent.id &&
      stack.processing.owner.opponent.trash.length >= 3
    );
  },
};
