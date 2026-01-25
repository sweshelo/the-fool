import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // ■さよならの答え
  // 対戦相手のターン時、あなたのユニットが消滅した時、対戦相手のユニットを1体選ぶ。それを消滅させる。あなたはカードを1枚引く。
  checkDelete: (stack: StackWithCard): boolean => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    // 対戦相手のターン時のみ発動
    if (stack.core.getTurnPlayer().id !== opponent.id) return false;

    // 自分のユニットが消滅した時のみ発動
    if (!(stack.target instanceof Unit)) return false;
    if (stack.target.owner.id !== owner.id) return false;

    // 対戦相手にユニットがいるか確認
    return EffectHelper.isUnitSelectable(stack.core, 'opponents', owner);
  },

  onDelete: async (stack: StackWithCard): Promise<void> => {
    const owner = stack.processing.owner;

    await System.show(stack, 'さよならの答え', 'ユニットを消滅\nカードを1枚引く');

    // 対戦相手のユニットを1体選ぶ
    const [target] = await EffectHelper.pickUnit(
      stack,
      owner,
      'opponents',
      '消滅させるユニットを選択'
    );

    // それを消滅させる
    Effect.delete(stack, stack.processing, target);

    // カードを1枚引く
    EffectTemplate.draw(owner, stack.core);
  },
};
