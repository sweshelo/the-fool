import { Effect, EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import type { Unit } from '@/package/core/class/card';
import { PermanentEffect } from '../engine/permanent';

export const effects: CardEffects = {
  // 【スピードムーブ】【消滅効果耐性】（召喚時付与）
  async onDriveSelf(stack: StackWithCard<Unit>) {
    const self = stack.processing;
    const owner = self.owner;

    await System.show(
      stack,
      '未来のために',
      '【消滅効果耐性】\n【スピードムーブ】\n手札を全て捨てる'
    );
    // 手札を全て捨てる
    [...owner.hand].forEach(card => Effect.break(stack, stack.processing, card));

    // キーワード付与
    Effect.keyword(stack, self, self, '消滅効果耐性');
    Effect.speedMove(stack, self);
  },

  // 手札のこのカードのコスト減少
  handEffect(_core: unknown, self: Unit) {
    PermanentEffect.mount(self, {
      effect: (target, source) =>
        Effect.dynamicCost(target, {
          source,
          calculator: () => -self.owner.hand.length,
        }),
      effectCode: '未来のために',
      targets: ['self'],
    });
  },

  // プレイヤーアタック成功時、選略
  async onPlayerAttackSelf(stack: StackWithCard<Unit>) {
    const owner = stack.processing.owner;

    const choice = await EffectHelper.choice(stack, owner, '選略・憂国の侵攻', [
      { id: '1', description: 'お互いに1ライフダメージ' },
      { id: '2', description: 'お互いに手札を全て捨てる\nカードを3枚引く' },
    ]);

    switch (choice) {
      case '1': {
        await System.show(stack, '憂国の侵攻', 'お互いに1ライフダメージ');
        Effect.modifyLife(stack, stack.processing, stack.processing.owner, -1);
        Effect.modifyLife(stack, stack.processing, stack.processing.owner.opponent, -1);
        break;
      }
      case '2': {
        await System.show(stack, '憂国の侵攻', '手札を全て捨てる\nカードを3枚引く');
        stack.core.players
          .flatMap(player => player.hand)
          .forEach(card => Effect.break(stack, stack.processing, card));
        stack.core.players.forEach(player =>
          [...Array(3)].forEach(() => EffectTemplate.draw(player, stack.core))
        );
        break;
      }
    }
  },
};
