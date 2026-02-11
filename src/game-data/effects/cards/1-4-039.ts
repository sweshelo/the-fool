import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // あなたのユニットがフィールドに出た時、【道化師】ユニットのカードを1枚ランダムで手札に加える
  checkDrive: (stack: StackWithCard) => {
    return stack.target instanceof Unit && stack.processing.owner.id === stack.target.owner.id;
  },

  onDrive: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, 'ピエロ達の宴', '【道化師】を1枚引く');
    EffectTemplate.reinforcements(stack, stack.processing.owner, { species: '道化師' });
  },

  // あなたの【道化師】ユニットがプレイヤーアタックに成功した時、
  // 対戦相手のユニットを1体選ぶ。それを対戦相手の手札に戻す
  checkPlayerAttack: (stack: StackWithCard) => {
    return (
      stack.source instanceof Unit &&
      stack.source.catalog.species?.includes('道化師') === true &&
      stack.processing.owner.id === stack.source.owner.id &&
      EffectHelper.isUnitSelectable(stack.core, 'opponents', stack.processing.owner)
    );
  },

  onPlayerAttack: async (stack: StackWithCard): Promise<void> => {
    const owner = stack.processing.owner;

    await System.show(stack, 'ピエロ達の宴', '手札に戻す');

    // 対戦相手のユニットを1体選ぶ
    const [target] = await EffectHelper.pickUnit(
      stack,
      owner,
      'opponents',
      '手札に戻すユニットを選択'
    );

    Effect.bounce(stack, stack.processing, target, 'hand');
  },
};
