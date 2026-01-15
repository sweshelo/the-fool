import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // このユニットがフィールドに出た時、以下の効果から1つを選び発動する
  onDriveSelf: async (stack: StackWithCard): Promise<void> => {
    const owner = stack.processing.owner;

    // 選択肢1：インターセプトカードを1枚引く
    const isChoice1Avail = owner.deck.some(card => card.catalog.type === 'intercept');

    // 選択肢2：捨札にユニットカードがある
    const isChoice2Avail = owner.trash.some(card => card instanceof Unit);

    // 両方の選択肢が利用可能な場合、プレイヤーに選択させる
    let choice: string | undefined = undefined;
    if (isChoice1Avail && isChoice2Avail) {
      [choice] = await System.prompt(stack, owner.id, {
        title: '選略・慈恵の精',
        type: 'option',
        items: [
          { id: '1', description: 'インターセプトカードを1枚引く' },
          { id: '2', description: '捨札からユニットカードを1枚手札に加える' },
        ],
      });
    } else {
      // どちらか一方しか利用できない場合は自動選択
      if (isChoice1Avail) choice = '1';
      if (isChoice2Avail) choice = '2';
    }

    switch (choice) {
      case '1': {
        // インターセプトカードを1枚引く
        await System.show(stack, '選略・慈恵の精', 'インターセプトカードを1枚引く');
        EffectTemplate.reinforcements(stack, owner, {
          type: ['intercept'],
        });
        break;
      }

      case '2': {
        // 捨札にあるユニットカードを1枚ランダムで手札に加える
        await System.show(stack, '選略・慈恵の精', '捨札からユニットカードを1枚手札に加える');
        const unitCardsInTrash = owner.trash.filter(card => card instanceof Unit);
        if (unitCardsInTrash.length > 0) {
          const [randomCard] = EffectHelper.random(unitCardsInTrash, 1);
          if (randomCard) {
            Effect.move(stack, stack.processing, randomCard, 'hand');
          }
        }
        break;
      }
    }
  },
};
