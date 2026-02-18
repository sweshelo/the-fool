import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  onBattleSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;
    const triggers = [...owner.trigger, ...opponent.trigger];

    // 戦闘中の敵ユニットを特定
    const [opponentUnit] = [stack.source, stack.target].filter(
      (object): object is Unit => object instanceof Unit && object.owner.id === opponent.id
    );

    await EffectHelper.combine(stack, [
      // 全てのトリガーゾーンにあるカードを破壊する。
      {
        title: '黄泉の五条大橋',
        description: 'トリガーゾーンを全て破壊',
        effect: () => {
          triggers.forEach(card => Effect.break(stack, stack.processing, card));
        },
        condition: triggers.length > 0,
      },
      // 戦闘中の相手ユニットよりこのユニットのBPが低い場合
      // ターン終了時までこのユニットに【不滅】を与える。
      // このユニットの基本BPを-2000する。
      {
        title: '弁慶の立ち往生',
        description: '【不滅】を得る\n基本BP-2000',
        effect: () => {
          Effect.keyword(stack, stack.processing, stack.processing, '不滅', {
            event: 'turnEnd',
            count: 1,
          });
          Effect.modifyBP(stack, stack.processing, stack.processing, -2000, {
            isBaseBP: true,
          });
        },
        condition:
          opponentUnit instanceof Unit && opponentUnit.currentBP > stack.processing.currentBP,
      },
    ]);
  },
};
