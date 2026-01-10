import { Color } from '@/submodule/suit/constant';
import { Effect } from '../classes/effect';
import { EffectHelper } from '../classes/helper';
import { System } from '../classes/system';
import { EffectTemplate } from '../classes/templates';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  checkDrive: stack =>
    stack.source.id === stack.processing.owner.id && stack.processing.owner.hand.length > 0,
  onDrive: async (stack: StackWithCard) => {
    await System.show(
      stack,
      '久遠の秘術',
      '手札を1枚選んで消滅\n蒼属性のインターセプトカードを2枚引く'
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
