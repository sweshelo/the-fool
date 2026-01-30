import type { Unit } from '@/package/core/class/card';
import { Effect } from '../engine/effect';
import { System } from '../engine/system';
import type { CardEffects, StackWithCard } from '../schema/types';
import { EffectHelper } from '../engine/helper';
import { EffectTemplate } from '../engine/templates';

export const effects: CardEffects = {
  onTurnStartInTrash: async (stack: StackWithCard<Unit>) => {
    if (
      stack.processing.owner.id !== stack.source.id &&
      stack.processing.owner.purple &&
      stack.processing.owner.purple >= 5 &&
      stack.processing.owner.field.length < stack.core.room.rule.player.max.field
    ) {
      // oxlint-disable-next-line no-floating-promises
      Effect.summon(stack, stack.processing, stack.processing);
      await System.show(stack, 'ナイト・スクリーム', '【特殊召喚】');
    }
  },

  onPlayerAttackSelf: async (stack: StackWithCard<Unit>) => {
    const choice = await EffectHelper.choice(stack, stack.processing.owner, '選略・暗器調達', [
      {
        id: '1',
        description: '手札を1枚消滅\nトリガーカードを2枚回収',
        condition: stack.processing.owner.hand.length > 0,
      },
      { id: '2', description: 'トリガーカードを1枚引く' },
    ]);

    switch (choice) {
      case '1': {
        await System.show(stack, '選略・暗器調達', '手札を1枚消滅\nトリガーカードを2枚回収');
        const [sacrifice] = await EffectHelper.selectCard(
          stack,
          stack.processing.owner,
          stack.processing.owner.hand,
          '消滅させるカードを選択して下さい'
        );
        Effect.move(stack, stack.processing, sacrifice, 'delete');
        EffectHelper.random(
          stack.processing.owner.trash.filter(card => card.catalog.type === 'trigger'),
          2
        ).forEach(card => Effect.move(stack, stack.processing, card, 'hand'));
        break;
      }
      case '2': {
        await System.show(stack, '選略・暗器調達', 'トリガーカードを1枚引く');
        EffectTemplate.reinforcements(stack, stack.processing.owner, { type: ['trigger'] });
        break;
      }
    }
  },
};
