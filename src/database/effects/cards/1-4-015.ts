import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // フォース＜ウィルス・費＞：フィールドに出た時の効果
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    if (EffectTemplate.virusInjectable(stack.processing.owner.opponent)) {
      await System.show(stack, 'フォース＜ウィルス・費＞', '＜ウィルス・費＞を【特殊召喚】');
      await EffectTemplate.virusInject(stack, stack.processing.owner.opponent, '＜ウィルス・費＞');
    }
  },

  // 金色の神術：ターン開始時の効果
  onTurnStart: async (stack: StackWithCard<Unit>): Promise<void> => {
    // 自分のターン開始時に発動
    if (stack.processing.owner.id === stack.core.getTurnPlayer().id) {
      // 対戦相手のユニットを取得
      const enemyUnits = stack.processing.owner.opponent.field;

      if (enemyUnits.length > 0) {
        await System.show(stack, '金色の神術', 'ランダムで【呪縛】を付与');

        // ランダムで1体選択
        const randomUnits = EffectHelper.random(enemyUnits, 1);

        // 選択されたユニットがあれば【呪縛】を付与
        randomUnits.forEach(unit => {
          Effect.keyword(stack, stack.processing, unit, '呪縛');
        });
      }
    }
  },
};
