import type { Card } from '@/package/core/class/card';
import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, EffectTemplate } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { System } from '../engine/system';

export const effects: CardEffects = {
  // トリガー: あなたのユニットがフィールドに出た時
  checkDrive: (stack: StackWithCard<Card>): boolean => {
    return stack.target instanceof Unit && stack.target.owner.id === stack.processing.owner.id;
  },

  onDrive: async (stack: StackWithCard<Card>): Promise<void> => {
    await System.show(stack, '武具コレクター', '【武身】を手札に加える');
    EffectTemplate.reinforcements(stack, stack.processing.owner, { species: '武身' });
  },

  // トリガー: あなたのターン終了時
  checkTurnEnd: (stack: StackWithCard<Card>): boolean => {
    return stack.source.id === stack.processing.owner.id;
  },

  onTurnEnd: async (stack: StackWithCard<Card>): Promise<void> => {
    const bushiInTrash = stack.processing.owner.trash.filter(
      card => card instanceof Unit && (card.catalog.species?.includes('武身') ?? false)
    );

    if (bushiInTrash.length > 0) {
      const toReturn = EffectHelper.random(bushiInTrash, Math.min(2, bushiInTrash.length));

      if (toReturn.length > 0) {
        await System.show(stack, '武具コレクター', '【武身】をデッキに戻す\nカードを2枚引く');

        for (const card of toReturn) {
          Effect.move(stack, stack.processing, card, 'deck');
        }

        EffectTemplate.draw(stack.processing.owner, stack.core);
        EffectTemplate.draw(stack.processing.owner, stack.core);
      }
    }
  },
};
