import { Color } from '@/submodule/suit/constant/color';
import { EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { Unit } from '@/package/core/class/card/Unit';

export const effects: CardEffects = {
  checkDrive: (stack: StackWithCard): boolean => {
    return (
      stack.processing.owner.id === stack.source.id &&
      EffectHelper.isVirusInjectable(stack.processing.owner.opponent)
    );
  },

  // あなたのユニットがフィールドに出た時
  onDrive: async (stack: StackWithCard): Promise<void> => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    // 対戦相手のフィールドにユニットが4体以下かつウィルス召喚可能な場合
  EffectHelper.isVirusInjectable(opponent) {
      await System.show(
        stack,
        '黙想の薔薇',
        '対戦相手のフィールドにいる【ウィルス】ユニットを除外\n＜ウィルス・黙＞を【特殊召喚】\nインターセプトカードを1枚引く'
      );

      // virusInjectはウィルスの除外と特殊召喚を両方処理する
      await EffectTemplate.virusInject(stack, opponent, '＜ウィルス・黙＞');

      // ウィルスを特殊召喚できた場合、インターセプトカードを1枚引く

      EffectTemplate.reinforcements(stack, owner, {
        type: ['intercept'],
      });
    }
  },
};
