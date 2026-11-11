import { Effect } from '@/game-data/effects/engine/effect';
import { EffectHelper } from '@/game-data/effects/engine/helper';
import { System } from '@/game-data/effects/engine/system';
import { EffectTemplate } from '@/game-data/effects/engine/templates';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard) => {
    await System.show(stack, '潜影の策', '「ブロックされない」効果を与える');
    const [target] = await EffectHelper.pickUnit(
      stack,
      stack.processing.owner,
      unit => unit.owner.id === stack.processing.owner.id && unit.catalog.species?.includes('忍者'),
      '「ブロックされない」効果を与えるユニットを選択して下さい'
    );
    Effect.keyword(stack, stack.processing, target, '次元干渉', {
      condition: () => true,
      event: 'turnEnd',
      count: 1,
    });
  },
  onPlayerAttackSelf: async (stack: StackWithCard) => {
    const [choice] =
      (await EffectHelper.choice(stack, stack.processing.owner, '選略・幻惑の策', [
        {
          id: '1',
          description: '行動権を消費',
          condition: EffectHelper.isUnitSelectable(stack.core, 'opponents', stack.processing.owner),
        },
        { id: '2', description: 'トリガーカードを1枚引く' },
      ])) ?? [];

    switch (choice) {
      case '1': {
        await System.show(stack, '選略・幻惑の策', '行動権を消費');
        const [target] = await EffectHelper.pickUnit(
          stack,
          stack.processing.owner,
          'opponents',
          '行動権を消費するユニットを選択して下さい'
        );
        Effect.activate(stack, stack.processing, target, false);
        break;
      }
      case '2': {
        await System.show(stack, '選略・幻惑の策', 'トリガーカードを1枚引く');
        EffectTemplate.reinforcements(stack, stack.processing.owner, { type: ['trigger'] });
        break;
      }
    }
  },
};
