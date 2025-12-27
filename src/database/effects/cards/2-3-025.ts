import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { Intercept } from '@/package/core/class/card/Intercept';

export const effects: CardEffects = {
  // 自身が召喚された時に発動する効果を記述
  onDriveSelf: async (stack: StackWithCard): Promise<void> => {
    const owner = stack.processing.owner;

    const [choice] =
      !stack.processing.owner.purple ||
      stack.processing.owner.purple < 2 ||
      stack.processing.owner.opponent.field.length <= 0
        ? ['1']
        : await System.prompt(stack, owner.id, {
            type: 'option',
            title: '選略・魔夜の太陽',
            items: [
              { id: '1', description: '紫ゲージ+1' },
              { id: '2', description: '[紫ゲージ×1000]ダメージ\n紫ゲージ-2' },
            ],
          });

    switch (choice) {
      case '1': {
        await System.show(stack, '選略・魔夜の太陽', '紫ゲージ+1');
        await Effect.modifyPurple(stack, stack.processing, stack.processing.owner, 1);
        break;
      }

      case '2': {
        await System.show(stack, '選略・魔夜の太陽', '[紫ゲージ×1000]ダメージ\n紫ゲージ-2');
        stack.processing.owner.opponent.field.forEach(unit =>
          Effect.damage(
            stack,
            stack.processing,
            unit,
            stack.processing.owner.purple! * 1000,
            'effect'
          )
        );
        await Effect.modifyPurple(stack, stack.processing, stack.processing.owner, -2);
        break;
      }
    }

    await System.show(stack, '慈母の寵愛', '【魔導士】のBP+[コスト×1000]');
  },

  onTurnEnd: async (stack: StackWithCard) => {
    if (
      stack.processing.owner.hand.length < stack.core.room.rule.player.max.hand &&
      stack.processing.owner.id === stack.source.id
    ) {
      await System.show(stack, '魔夜の太陽', '[魔導の書]を手札に作成');
      stack.processing.owner.hand.push(new Intercept(stack.processing.owner, 'PR-027'));
    }
  },

  fieldEffect: stack => {
    stack.processing.owner.field
      .filter(
        unit =>
          unit.catalog.species?.includes('魔導士') &&
          !unit.delta.find(delta => delta.source?.unit === stack.processing.id)
      )
      .forEach(unit => {
        Effect.modifyBP(stack, stack.processing, unit, unit.catalog.cost * 1000, {
          source: { unit: stack.processing.id },
        });
      });
  },
};
