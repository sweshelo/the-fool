import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // 選略効果
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    const fieldUnits = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id === stack.processing.owner.id,
      stack.processing.owner
    );
    const magicianUnits = fieldUnits.filter(unit => unit.catalog.species?.includes('魔導士'));
    const opponentUnits = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id !== stack.processing.owner.id,
      stack.processing.owner
    );

    const isOption1Selectable = stack.processing.owner.opponent.field.length === 0;
    const isOption2Selectable = stack.processing.owner.field.length > 4;

    // どちらか選べる場合のみ
    if (isOption1Selectable || isOption2Selectable) {
      // どちらかしか選べない場合は確定
      const [choice] = !isOption1Selectable
        ? ['2']
        : !isOption2Selectable
          ? ['1']
          : await System.prompt(stack, stack.processing.owner.id, {
              title: '選略・まじかるツヴァイ',
              type: 'option',
              items: [
                { id: '1', description: 'デッキから【魔導士】ユニットを【特殊召喚】' },
                { id: '2', description: '敵全体の基本BP-［【魔導士】×1000］' },
              ],
            });

      switch (choice) {
        case '1':
          const deck = stack.processing.owner.deck.filter(
            card =>
              card.catalog.cost <= 3 &&
              card.catalog.species?.includes('魔導士') &&
              card.catalog.type === 'unit'
          ) as Unit[];
          if (deck.length > 0) {
            const [randomCard] = EffectHelper.random(deck, 1);
            await System.show(
              stack,
              '選略・まじかるツヴァイ',
              'デッキから【魔導士】ユニットを【特殊召喚】'
            );
            if (randomCard) await Effect.summon(stack, stack.processing, randomCard);
          }
          break;
        case '2':
          const damage = magicianUnits.length * 1000;
          await System.show(stack, '選略・まじかるツヴァイ', `敵全体の基本BP-［【魔導士】×1000］`);
          opponentUnits.forEach(unit => {
            Effect.modifyBP(stack, stack.processing, unit, -damage, { isBaseBP: true });
          });
          break;
      }
    }
  },
};
