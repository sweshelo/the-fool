import { Color } from '@/submodule/suit/constant';
import { Effect } from '../engine/effect';
import { EffectHelper } from '../engine/helper';
import { System } from '../engine/system';
import { EffectTemplate } from '../engine/templates';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  checkDrive: stack =>
    stack.source.id === stack.processing.owner.id && stack.processing.owner.hand.length > 0,
  onDrive: async (stack: StackWithCard) => {
    await System.show(
      stack,
      '久遠の秘術',
      '手札を1枚選んで消滅\n青属性のインターセプトカードを2枚引く'
    );
    const [target] = await EffectHelper.selectCard(
      stack,
      stack.processing.owner,
      stack.processing.owner.hand,
      '消滅させるカードを選択して下さい'
    );
    Effect.move(stack, stack.processing, target, 'delete');
    EffectHelper.repeat(2, () =>
      EffectTemplate.reinforcements(stack, stack.processing.owner, {
        type: ['intercept'],
        color: Color.BLUE,
      })
    );
  },
};
