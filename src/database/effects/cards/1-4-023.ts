import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // ■フォース＜ウィルス・成＞
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    if (EffectHelper.isVirusInjectable(stack.processing.owner.opponent)) {
      await System.show(stack, 'フォース＜ウィルス・成＞', '＜ウィルス・成＞を【特殊召喚】');
      await EffectTemplate.virusInject(stack, stack.processing.owner.opponent, '＜ウィルス・成＞');
    }
  },

  // ■弱者選別
  // 対戦相手のターン開始時
  onTurnStart: async (stack: StackWithCard<Unit>): Promise<void> => {
    // 相手のターン開始時のみ発動
    if (stack.processing.owner.id === stack.core.getTurnPlayer().id) {
      return;
    }

    const filter = (unit: Unit) =>
      unit.owner.id === stack.processing.owner.opponent.id && unit.lv >= 3;

    if (EffectHelper.isUnitSelectable(stack.core, filter, stack.processing.owner)) {
      await System.show(stack, '弱者選別', 'Lv3以上のユニットを破壊');
      const [target] = await EffectHelper.pickUnit(
        stack,
        stack.processing.owner,
        filter,
        '破壊するユニットを選択'
      );
      Effect.break(stack, stack.processing, target);
    }
  },
};
