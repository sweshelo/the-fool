import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import type { Core } from '@/package/core/core';

export const effects: CardEffects = {
  // 【神託】（召喚時付与）
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, '神託', '【神託】を得る');
    Effect.keyword(stack, stack.processing, stack.processing, '神託');
  },

  // ■起動・ONIマーケティング
  isBootable(core: Core, self: Unit): boolean {
    const opponentUnits = self.owner.opponent.field;
    return opponentUnits_selectable;
  },

  async onBootSelf(stack: StackWithCard<Unit>): Promise<void> {
    const opponentUnits = stack.processing.owner.opponent.field;
    if (opponentUnits_selectable) {
      await System.show(stack, 'ONIマーケティング', 'ランダムで1体に【呪縛】');
      const [target] = EffectHelper.random(opponentUnits, 1);
      if (target) {
        Effect.keyword(stack, stack.processing, target, '呪縛');
      }
    }
  },

  // ■奇跡・ONIタイムセール
  async onTurnStart(stack: StackWithCard<Unit>): Promise<void> {
    // 自分のターン開始時のみ発動
    if (stack.processing.owner.id !== stack.core.getTurnPlayer().id) {
      return;
    }

    // 【神託】を持っているか確認
    if (!stack.processing.hasKeyword('神託')) {
      return;
    }

    const filter = (unit: Unit) => unit.owner.id === stack.processing.owner.opponent.id;
    if (EffectHelper.isSelectable(stack.core, filter, stack.processing.owner)) {
      await System.show(stack, 'ONIタイムセール', '行動権を消費');

      const [target] = await EffectHelper.pickUnit(
        stack,
        stack.processing.owner,
        filter,
        '行動権を消費するユニットを選択'
      );

      Effect.activate(stack, stack.processing, target, false);
      // 【神託】を取り除く
      Effect.removeKeyword(stack, stack.processing, '神託');
    }
  },
};
