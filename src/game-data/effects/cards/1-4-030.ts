import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // このユニットがフィールドに出た時、このユニットに【固着】を付与する
  // このユニットがフィールドに出た時、対戦相手はカードを2枚引く。対戦相手は手札を2枚ランダムで捨てる。
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const self = stack.processing;
    const owner = self.owner;
    const opponent = owner.opponent;

    await System.show(stack, 'Zの刻印', '【固着】\n相手はカードを2枚引く\n相手は手札を2枚捨てる');

    // 固着を付与
    Effect.keyword(stack, self, self, '固着');

    // 対戦相手がカードを2枚引く
    EffectTemplate.draw(opponent, stack.core);
    EffectTemplate.draw(opponent, stack.core);

    // 対戦相手の手札を2枚ランダムで捨てる
    EffectHelper.random(opponent.hand, 2).forEach(target => Effect.handes(stack, self, target));
  },

  // このユニットがアタックした時、あなたは手札を1枚選んで捨てる。そうした場合、あなたはカードを2枚引く。
  onAttackSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;

    if (owner.hand.length === 0) return;

    await System.show(stack, '義賊の技巧', '手札を1枚選んで捨てる\nカードを2枚引く');

    // 手札を1枚選んで捨てる
    const [selected] = await EffectHelper.selectCard(
      stack,
      owner,
      owner.hand,
      '捨てるカードを選択'
    );

    Effect.handes(stack, stack.processing, selected);

    // カードを2枚引く
    EffectTemplate.draw(owner, stack.core);
    EffectTemplate.draw(owner, stack.core);
  },

  // このユニットが効果で破壊された時
  // あなたのライフが1以下の場合、ライフを+1する。対戦相手に1ライフダメージを与える。
  onBreakSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const self = stack.processing;
    const owner = self.owner;
    const opponent = owner.opponent;

    // 効果で破壊された場合のみ発動
    if (stack.option?.type === 'break' && stack.option.cause === 'effect') {
      const effects: string[] = [];
      if (owner.life.current <= 1) effects.push('ライフ+1');
      effects.push('相手に1ダメージ');

      await System.show(stack, '義賊の技巧', effects.join('\n'));

      // ライフが1以下の場合、ライフを+1
      if (owner.life.current <= 1) {
        Effect.modifyLife(stack, self, owner, 1);
      }

      // 対戦相手に1ライフダメージ
      Effect.modifyLife(stack, self, opponent, -1);
    }
  },
};
