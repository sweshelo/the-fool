import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // フォース＜ウィルス・攻＞：フィールドに出た時の効果
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    if (EffectTemplate.virusInjectable(stack.processing.owner.opponent)) {
      await System.show(stack, 'フォース＜ウィルス・攻＞', '＜ウィルス・攻＞を【特殊召喚】');
      await EffectTemplate.virusInject(stack, stack.processing.owner.opponent, '＜ウィルス・攻＞');
    }
  },

  // 大いなる母の恵み：ターン開始時の効果
  onTurnStart: async (stack: StackWithCard<Unit>): Promise<void> => {
    // 自分のターン開始時に発動
    if (stack.processing.owner.id === stack.core.getTurnPlayer().id) {
      // 自分のユニットを取得
      const ownUnits = EffectHelper.candidate(
        stack.core,
        unit => unit.owner.id === stack.processing.owner.id,
        stack.processing.owner
      );

      if (ownUnits.length > 0) {
        await System.show(stack, '大いなる母の恵み', '【貫通】を付与');

        // ユニットを1体選択
        const [target] = await EffectHelper.selectUnit(
          stack,
          stack.processing.owner,
          ownUnits,
          '【貫通】を与えるユニットを選択'
        );

        // 【貫通】を付与
        Effect.keyword(stack, stack.processing, target, '貫通');
      }
    }
  },
};
