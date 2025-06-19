import type { Unit } from '@/package/core/class/card';
import type { Card } from '@/package/core/class/card/Card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  checkTurnStart: (stack: StackWithCard<Card>): boolean => {
    // 相手のターン開始時かつ【魔導士】ユニットが存在する場合のみ発動
    const isOpponentTurn = stack.core.getTurnPlayer().id === stack.processing.owner.opponent.id;
    const magicianUnits = EffectHelper.candidate(
      stack.core,
      unit =>
        unit.owner.id === stack.processing.owner.id &&
        (unit.catalog.species?.includes('魔導士') ?? false),
      stack.processing.owner
    );

    return isOpponentTurn && magicianUnits.length > 0;
  },

  onTurnStart: async (stack: StackWithCard<Unit>): Promise<void> => {
    const selfLevel = stack.processing.lv;

    // 【魔導士】ユニットを取得
    const magicianUnits = EffectHelper.candidate(
      stack.core,
      unit =>
        unit.owner.id === stack.processing.owner.id &&
        (unit.catalog.species?.includes('魔導士') ?? false),
      stack.processing.owner
    );

    switch (selfLevel) {
      case 1:
      case 2:
        await System.show(stack, '魔導結界', '【魔導士】ユニットのBP+1000\n【加護】を与える');

        magicianUnits.forEach(unit => {
          Effect.modifyBP(stack, stack.processing, unit, +1000, { event: 'turnEnd', count: 1 });
          Effect.keyword(stack, stack.processing, unit, '加護', { event: 'turnEnd', count: 1 });
        });
        break;

      case 3: {
        await System.show(
          stack,
          '魔導結界',
          '【魔導士】ユニットのBP+2000\n【加護】を与える\nインターセプトカードを手札に加える'
        );

        magicianUnits.forEach(unit => {
          Effect.modifyBP(stack, stack.processing, unit, +2000, { event: 'turnEnd', count: 1 });
          Effect.keyword(stack, stack.processing, unit, '加護', { event: 'turnEnd', count: 1 });
        });

        // 捨札からインターセプトカードをランダムで手札に加える
        const interceptCards = stack.processing.owner.trash.filter(
          card => card.catalog.category === 'intercept'
        );
        if (interceptCards.length > 0) {
          const selectedCards = EffectHelper.random(interceptCards, 1);
          const selectedCard = selectedCards[0];
          if (selectedCard) {
            Effect.move(stack, stack.processing, selectedCard, 'hand');
          }
        }
        break;
      }
    }
  },
};
