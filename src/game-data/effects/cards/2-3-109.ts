import { Effect, EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import type { Unit } from '@/package/core/class/card';
import type { Core } from '@/package/core';

export const effects: CardEffects = {
  // 【加護】（召喚時付与）
  async onDriveSelf(stack: StackWithCard<Unit>) {
    const self = stack.processing;
    await System.show(stack, '加護', '効果に選ばれない');
    Effect.keyword(stack, self, self, '加護');
  },

  // 起動効果: 手札1枚消滅→トリガーカード1枚引く（1ターン1度）
  isBootable(core: Core, self: Unit): boolean {
    const hasHand = self.owner.hand.length > 0;
    return hasHand;
  },

  async onBootSelf(stack: StackWithCard<Unit>) {
    const self = stack.processing;
    const owner = self.owner;
    if (owner.hand.length > 0) {
      await System.show(stack, '竜の一矢', '手札を1枚消滅\nトリガーカード1枚引く');
      // 手札選択
      const [card] = await EffectHelper.selectCard(
        stack,
        owner,
        owner.hand,
        '消滅させるカードを選択'
      );
      Effect.move(stack, self, card, 'delete');
      EffectTemplate.reinforcements(stack, stack.processing.owner, { type: ['trigger'] });
    }
  },
};
