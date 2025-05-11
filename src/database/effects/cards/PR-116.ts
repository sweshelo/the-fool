import { Delta } from '@/package/core/class/delta';
import { Effect, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import type { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  // 【スピードムーブ】【消滅効果耐性】（召喚時付与）
  async onDriveSelf(stack: StackWithCard<Unit>) {
    const self = stack.processing;
    const owner = self.owner;

    await System.show(
      stack,
      '未来のために&消滅効果耐性',
      '手札を全て捨てる\n対戦相手の効果によって消滅しない'
    );
    // 手札を全て捨てる
    for (const card of [...owner.hand]) {
      Effect.handes(stack, self, card);
    }

    // キーワード付与
    Effect.keyword(stack, self, self, '消滅効果耐性');
  },

  // 手札のこのカードのコスト減少
  handEffect(_core: unknown, self: Unit) {
    const delta = self.delta.find(
      delta => delta.effect.type === 'cost' && delta.source?.unit === self.id
    );
    if (delta && delta.effect.type === 'cost') {
      delta.effect.value = Math.min(-self.owner.hand.length, -6);
    } else {
      self.delta.push(
        new Delta(
          { type: 'cost', value: -self.owner.hand.length },
          undefined,
          undefined,
          undefined,
          { unit: self.id }
        )
      );
    }
  },

  // プレイヤーアタック成功時、選略
  async onPlayerAttack(stack: StackWithCard<Unit>) {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    // 選択肢
    const options = [
      { id: '1', description: 'お互いに1ライフダメージ' },
      { id: '2', description: 'お互いに手札を全て捨て、カードを3枚引く' },
    ];

    let choice: string | undefined;
    const promptResult = await System.prompt(stack, owner.id, {
      title: '選略・憂国の侵攻',
      type: 'option',
      items: options,
    });
    if (promptResult && promptResult.length > 0) {
      choice = promptResult[0];
    } else {
      return;
    }

    if (choice === '1') {
      await System.show(stack, '憂国の侵攻', 'お互いに1ライフダメージ');
      owner.damage();
      opponent.damage();
    } else if (choice === '2') {
      await System.show(stack, '憂国の侵攻', 'お互い手札全捨て\n3枚引く');
      stack.core.players
        .flatMap(player => player.hand)
        .forEach(card => Effect.handes(stack, stack.processing, card));
      stack.core.players.forEach(player => EffectTemplate.draw(player, stack.core));
    }
  },
};
