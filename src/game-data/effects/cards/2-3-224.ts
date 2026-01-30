import { Evolve, type Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { Color } from '@/submodule/suit/constant/color';

export const effects: CardEffects = {
  // 自身が召喚された時に発動する効果を記述
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const choice = await EffectHelper.choice(
      stack,
      stack.processing.owner,
      '選略・ヒロイック・レイ',
      [
        { id: '1', description: '自身を緑属性の【英雄】に進化' },
        {
          id: '2',
          description: '基本BP-[【英雄】×2000]',
          condition: EffectHelper.isUnitSelectable(stack.core, 'opponents', stack.processing.owner),
        },
      ]
    );

    switch (choice) {
      case '1': {
        await System.show(stack, '選略・ヒロイック・レイ', '自身を緑属性の【英雄】に進化');
        const evolveUnit = stack.processing.owner.deck.find((card): card is Evolve => {
          return (
            card instanceof Evolve &&
            card.catalog.color === Color.GREEN &&
            card.catalog.cost <= 4 &&
            (card.catalog.species?.includes('英雄') ?? false)
          );
        });
        if (evolveUnit) {
          stack.processing.owner.deck = stack.processing.owner.deck.filter(
            card => card !== evolveUnit
          );
          await stack.core.drive(stack.processing.owner, evolveUnit, stack.processing);
        }
        break;
      }

      case '2': {
        await System.show(stack, '選略・ヒロイック・レイ', '基本BP-[【英雄】×2000]');
        const [target] = await EffectHelper.pickUnit(
          stack,
          stack.processing.owner,
          'opponents',
          '基本BPを下げるユニットを選択して下さい'
        );
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
