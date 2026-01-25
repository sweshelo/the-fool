import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // ■ギガントマキア
  // あなたのターン終了時、あなたの【巨人】ユニットからランダムで1体をあなたのフィールドに【複製】し、基本BPを+1000する。
  checkTurnEnd: (stack: StackWithCard): boolean => {
    const owner = stack.processing.owner;

    // 自分のターン終了時のみ発動
    if (stack.core.getTurnPlayer().id !== owner.id) return false;

    // 自分のフィールドに【巨人】ユニットがいるか確認
    const hasGiant = owner.field.some(unit => unit.catalog.species?.includes('巨人'));
    return hasGiant;
  },

  onTurnEnd: async (stack: StackWithCard): Promise<void> => {
    const owner = stack.processing.owner;

    // 【巨人】ユニットをフィルタリング
    const giants = owner.field.filter(
      (unit): unit is Unit => unit.catalog.species?.includes('巨人') === true
    );

    if (giants.length === 0) return;

    await System.show(stack, 'ギガントマキア', '【巨人】を【複製】\n基本BP+1000');

    // ランダムで1体選ぶ
    const [target] = EffectHelper.random(giants, 1);
    if (target) {
      // 複製する
      const clone = await Effect.clone(stack, stack.processing, target, owner);

      // 複製したユニットの基本BPを+1000
      if (clone) {
        Effect.modifyBP(stack, stack.processing, clone, 1000, { isBaseBP: true });
      }
    }
  },
};
