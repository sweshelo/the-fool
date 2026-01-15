import { Effect } from '../engine/effect';
import { System } from '../engine/system';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  checkAttack: stack => stack.processing.owner.field.length > 0,
  onAttack: async (stack: StackWithCard) => {
    switch (stack.processing.lv) {
      case 1:
      case 2: {
        await System.show(stack, 'ジャッジメント', '敵全体の行動権を消費');
        stack.processing.owner.opponent.field.forEach(unit =>
          Effect.activate(stack, stack.processing, unit, false)
        );
        break;
      }

      case 3: {
        await System.show(stack, 'ジャッジメント', '敵全体の行動権を消費\n【呪縛】を付与');
        stack.processing.owner.opponent.field.forEach(unit => {
          Effect.activate(stack, stack.processing, unit, false);
          Effect.keyword(stack, stack.processing, unit, '呪縛');
        });
        break;
      }
    }
  },
};
