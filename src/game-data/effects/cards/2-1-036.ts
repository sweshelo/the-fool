import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // あなたのユニットがプレイヤーアタックに成功した時
  checkPlayerAttack: (stack: StackWithCard) => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;
    if (!(stack.source instanceof Unit)) return false;
    if (stack.source.owner.id !== owner.id) return false;

    return EffectHelper.isUnitSelectable(stack.core, 'owns', owner) && opponent.field.length > 0;
  },

  onPlayerAttack: async (stack: StackWithCard) => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    await System.show(stack, '秘密兵器', 'ユニットを破壊\n敵全体に[破壊したユニットのBP]ダメージ');
    // 自分のユニットを1体選択
    const [selectedUnit] = await EffectHelper.pickUnit(
      stack,
      owner,
      'owns',
      '破壊する自分のユニットを選択'
    );

    const damage = selectedUnit.currentBP;
    // 選択したユニットを破壊
    Effect.break(stack, stack.processing, selectedUnit);

    // 破壊したユニットのBP分ダメージ
    opponent.field.forEach(unit => {
      Effect.damage(stack, stack.processing, unit, damage);
    });
  },
};
