import { Evolve, type Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import type { Choices } from '@/submodule/suit/types/game/system';
import { Color } from '@/submodule/suit/constant/color';

export const effects: CardEffects = {
  // 自身が召喚された時に発動する効果を記述
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const candidate = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id !== stack.processing.owner.id,
      stack.processing.owner
    );

    const [choice] =
      candidate.length === 0
        ? ['1']
        : await System.prompt(stack, stack.processing.owner.id, {
            type: 'option',
            title: '選略・ヒロイック・レイ',
            items: [
              { id: '1', description: '自身を緑属性の【英雄】に進化' },
              { id: '2', description: '基本BP-[【英雄】×2000]' },
            ],
          });

    switch (choice) {
      case '1': {
        await System.show(stack, '選略・ヒロイック・レイ', '自身を緑属性の【英雄】に進化');
        const evolveUnit = stack.processing.owner.deck.find(
          card =>
            card instanceof Evolve &&
            card.catalog.color === Color.GREEN &&
            card.catalog.cost <= 4 &&
            card.catalog.species?.includes('英雄')
        ) as Evolve;
        if (evolveUnit) {
          await stack.core.drive(stack.processing.owner, evolveUnit, stack.processing);
        }
        break;
      }

      case '2': {
        await System.show(stack, '選略・ヒロイック・レイ', '基本BP-[【英雄】×2000]');
        const choices: Choices = {
          title: '基本BPを減少するユニットを選択してください',
          type: 'unit',
          items: candidate,
        };

        const [unitId] = await System.prompt(stack, stack.processing.owner.id, choices);
        const target = candidate.find(unit => unit.id === unitId);
        if (!target) throw new Error('正しいカードが選択されませんでした');
        Effect.modifyBP(
          stack,
          stack.processing,
          target,
          stack.processing.owner.field.filter(unit => unit.catalog.species?.includes('英雄'))
            .length * -2000,
          { isBaseBP: true }
        );
        break;
      }
    }
  },
};
