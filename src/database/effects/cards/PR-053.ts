import type { Unit } from '@/package/core/class/card';
import type { CardEffects, StackWithCard } from '../classes/types';
import { System } from '../classes/system';
import { Effect } from '../classes/effect';
import { EffectHelper } from '../classes/helper';
import { EffectTemplate } from '../classes/templates';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    if (stack.processing.owner.hand.length > 0) {
      await System.show(
        stack,
        '暴虐なる戯笑',
        '手札を1枚捨てる\nカードを1枚引く\n【悪魔】のBP+3000'
      );
      const [target] = await EffectHelper.selectCard(
        stack,
        stack.processing.owner,
        stack.processing.owner.hand,
        '捨てるカードを選んで下さい'
      );
      Effect.handes(stack, stack.processing, target);
      EffectTemplate.draw(stack.processing.owner, stack.core);
      stack.processing.owner.field
        .filter(unit => unit.catalog.species?.includes('悪魔'))
        .forEach(unit =>
          Effect.modifyBP(stack, stack.processing, unit, 3000, { event: 'turnEnd', count: 1 })
        );
    }
  },

  onAttackSelf: async (stack: StackWithCard<Unit>) => {
    if (EffectHelper.isUnitSelectable(stack.core, 'opponents', stack.processing.owner)) {
      await System.show(stack, '力の対価', '10000ダメージ\n1ライフダメージ');
      const [target] = await EffectHelper.pickUnit(
        stack,
        stack.processing.owner,
        'opponents',
        'ダメージを与えるユニットを選択して下さい'
      );
      Effect.damage(stack, stack.processing, target, 10000);
      Effect.modifyLife(stack, stack.processing, stack.processing.owner, -1);
    }
  },

  onTurnStart: async (stack: StackWithCard<Unit>) => {
    if (stack.processing.owner.id !== stack.source.id) {
      await System.show(stack, '女王の戯れ', '自身の行動権を消費');
      Effect.activate(stack, stack.processing, stack.processing, false);
    }
  },
};
