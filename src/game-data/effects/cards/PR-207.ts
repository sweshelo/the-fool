import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // ■五輪の神髄
  // あなたのユニットが戦闘した時、それがアタック中だった場合
  checkBattle: (stack: StackWithCard): boolean => {
    return (
      stack.source instanceof Unit &&
      stack.source.owner.id === stack.processing.owner.id &&
      stack.target instanceof Unit
    );
  },

  onBattle: async (stack: StackWithCard): Promise<void> => {
    const attacker = stack.source;
    if (attacker instanceof Unit) {
      await System.show(stack, '五輪の神髄', '【貫通】を付与');
      Effect.keyword(stack, stack.processing, attacker, '貫通', {
        event: 'turnEnd',
        count: 1,
      });
    }
  },

  // あなたのユニットがプレイヤーアタックに成功した時
  checkPlayerAttack: (stack: StackWithCard): boolean => {
    return stack.source instanceof Unit && stack.source.owner.id === stack.processing.owner.id;
  },

  onPlayerAttack: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, '五輪の神髄', '1ライフダメージ');
    Effect.modifyLife(stack, stack.processing, stack.processing.owner.opponent, -1);
  },
};
