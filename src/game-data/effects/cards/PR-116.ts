import { Delta } from '@/package/core/class/delta';
import { Effect, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import type { Unit } from '@/package/core/class/card';

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
    [...owner.hand].forEach(card => Effect.handes(stack, stack.processing, card));

    // キーワード付与
    Effect.keyword(stack, self, self, '消滅効果耐性');
    Effect.speedMove(stack, self);
  },

  // 手札のこのカードのコスト減少
  handEffect(_core: unknown, self: Unit) {
    const delta = self.delta.find(delta => delta.source?.unit === self.id);
    const reduce = Math.max(-self.owner.hand.length, -6);

    if (delta && delta.effect.type === 'cost') {
      delta.effect.value = reduce;
    } else {
      self.delta.push(
        new Delta(
          { type: 'cost', value: reduce },
          {
            source: {
              unit: self.id,
            },
          }
        )
      );
    }
  },

  // プレイヤーアタック成功時、選略
  async onPlayerAttackSelf(stack: StackWithCard<Unit>) {
    const owner = stack.processing.owner;

    // 選択肢
    const options = [
      { id: '1', description: 'お互いに1ライフダメージ' },
      { id: '2', description: 'お互いに手札を全て捨てる\nカードを3枚引く' },
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
      Effect.modifyLife(stack, stack.processing, stack.processing.owner, -1);
      Effect.modifyLife(stack, stack.processing, stack.processing.owner.opponent, -1);
    } else if (choice === '2') {
      await System.show(stack, '憂国の侵攻', '手札を全て捨てる\nカードを3枚引く');
      stack.core.players
        .flatMap(player => player.hand)
        .forEach(card => Effect.handes(stack, stack.processing, card));
      stack.core.players.forEach(player =>
        [...Array(3)].forEach(() => EffectTemplate.draw(player, stack.core))
      );
    }
  },
};
