import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // このユニットがフィールドに出た時、対戦相手のユニットを1体選ぶ。
  // それに2000ダメージを与える。あなたの紫ゲージを+1する。
  // この効果でユニットを破壊した場合、あなたの紫ゲージを追加で+1する。
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;

    // 対戦相手のフィールドにユニットがいるか確認
    if (!EffectHelper.isUnitSelectable(stack.core, 'opponents', owner)) {
      // ユニットがいなくても紫ゲージ+1
      await System.show(stack, '熱々のキスはいかが？', '紫ゲージ+1');
      await Effect.modifyPurple(stack, stack.processing, owner, 1);
      return;
    }

    await System.show(stack, '熱々のキスはいかが？', '2000ダメージ\n紫ゲージ+1');

    // 対戦相手のユニットを1体選ぶ
    const [target] = await EffectHelper.pickUnit(
      stack,
      owner,
      'opponents',
      'ダメージを与えるユニットを選択'
    );

    // 2000ダメージを与える
    Effect.damage(stack, stack.processing, target, 2000, 'effect');

    // 紫ゲージ+1
    await Effect.modifyPurple(stack, stack.processing, owner, 1);
  },

  onBreak: async (stack: StackWithCard<Unit>): Promise<void> => {
    // 自分の効果で破壊されたかチェック
    if (
      stack.source.id !== stack.processing.id ||
      stack.option?.type !== 'break' ||
      stack.option.cause !== 'damage'
    )
      return;

    // この効果でユニットを破壊した場合、追加で紫ゲージ+1
    const owner = stack.processing.owner;
    await System.show(stack, '熱々のキスはいかが？', '紫ゲージ+1');
    await Effect.modifyPurple(stack, stack.processing, owner, 1);
  },
};
