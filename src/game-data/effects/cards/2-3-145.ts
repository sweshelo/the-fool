import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // ■幻影サーカス団
  // あなたのユニットがプレイヤーアタックに成功した時、あなたのフィールドの【道化師】ユニットを1体選ぶ。それをあなたのフィールドに【複製】する。
  checkPlayerAttack: (stack: StackWithCard): boolean => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    // 自分のユニットが相手プレイヤーにアタック成功した時のみ
    if (stack.target?.id !== opponent.id) return false;

    // フィールドに【道化師】ユニットがいるか確認
    const hasClown = owner.field.some(unit => unit.catalog.species?.includes('道化師'));
    return hasClown;
  },

  onPlayerAttack: async (stack: StackWithCard): Promise<void> => {
    const owner = stack.processing.owner;

    const clownFilter = (unit: Unit) =>
      unit.owner.id === owner.id && unit.catalog.species?.includes('道化師') === true;

    await System.show(stack, '幻影サーカス団', '【道化師】を【複製】');

    // 道化師ユニットを1体選ぶ
    const [target] = await EffectHelper.pickUnit(
      stack,
      owner,
      clownFilter,
      '【複製】する【道化師】ユニットを選択'
    );

    // 複製する
    await Effect.clone(stack, stack.processing, target, owner);
  },
};
