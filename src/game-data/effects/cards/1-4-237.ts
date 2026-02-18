import { Card } from '@/package/core/class/card';
import { Effect, EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // ■全ては計画通り
  // 対戦相手の効果によってあなたが手札を捨てた時、対戦相手のユニットを1体選ぶ。それを破壊する。
  checkHandes: (stack: StackWithCard): boolean => {
    const owner = stack.processing.owner;

    // 対戦相手の効果によって自分の手札が捨てられた時のみ発動
    if (!(stack.source instanceof Card)) return false;
    if (stack.source.owner.id === owner.id) return false;
    if (!(stack.target instanceof Card)) return false;
    if (stack.target.owner.id !== owner.id) return false;

    // 対戦相手にユニットがいるか確認
    return EffectHelper.isUnitSelectable(stack.core, 'opponents', owner);
  },

  onHandes: async (stack: StackWithCard): Promise<void> => {
    const owner = stack.processing.owner;

    await System.show(stack, '全ては計画通り', 'ユニットを破壊');

    // 対戦相手のユニットを1体選ぶ
    const [target] = await EffectHelper.pickUnit(
      stack,
      owner,
      'opponents',
      '破壊するユニットを選択'
    );

    // それを破壊する
    Effect.break(stack, stack.processing, target);
  },

  // あなたのターン開始時、あなたはカードを1枚引く。
  checkTurnStart: (stack: StackWithCard): boolean => {
    const owner = stack.processing.owner;

    // 自分のターン開始時のみ発動
    return stack.core.getTurnPlayer().id === owner.id;
  },

  onTurnStart: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, '全ては計画通り', 'カードを1枚引く');

    // カードを1枚引く
    EffectTemplate.draw(stack.processing.owner, stack.core);
  },
};
