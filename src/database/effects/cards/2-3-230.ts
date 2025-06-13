import { Card, type Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const intercepts = stack.processing.owner.trash.filter(
      card => card.catalog.type === 'intercept'
    );

    if (
      intercepts.length > 0 &&
      stack.processing.owner.trigger.length < stack.core.room.rule.player.max.trigger
    ) {
      await System.show(
        stack,
        '詭謀と絶望のノクターン',
        'インターセプトをトリガーゾーンにセット\nレベル+2'
      );
      const [target] = await EffectHelper.selectCard(
        stack,
        stack.processing.owner,
        intercepts,
        '対象のカードを選んで下さい',
        1
      );
      Effect.move(stack, stack.processing, target, 'trigger');
      target.lv = Math.min(target.lv + 2, 3);
    }
  },

  onIntercept: async (stack: StackWithCard): Promise<void> => {
    const candidate = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id !== stack.processing.owner.id,
      stack.processing.owner
    );
    if (
      stack.target instanceof Card &&
      stack.target.catalog.type === 'intercept' &&
      stack.option?.type === 'lv' &&
      stack.option.value >= 3 &&
      stack.target.owner.id === stack.processing.owner.id &&
      candidate.length > 0
    ) {
      await System.show(stack, '詭謀と絶望のノクターン', 'ユニットを破壊する');
      const [target] = await EffectHelper.selectUnit(
        stack,
        stack.processing.owner,
        candidate,
        '破壊するユニットを選択して下さい',
        1
      );
      if (target) Effect.break(stack, stack.processing, target, 'effect');
    }
  },

  onTurnEnd: async (stack: StackWithCard): Promise<void> => {
    const trigger = Math.random() < 0.3;
    if (trigger) {
      await System.show(stack, '運否天賦', 'カードを3枚引く\n1ライフダメージ');
      [...Array(3)].forEach(() => EffectTemplate.draw(stack.core.getTurnPlayer(), stack.core));
      Effect.modifyLife(stack, stack.core.getTurnPlayer(), -1);
    }
  },
};
