import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

const replaceMagick = async (stack: StackWithCard) => {
  if (
    stack.source.id === stack.processing.owner.id &&
    stack.processing.owner.hand.length > 0 &&
    stack.target instanceof Unit &&
    stack.target.catalog.species?.includes('魔導士')
  ) {
    await System.show(stack, 'リプレイスマジック', '手札を1枚捨てる\nカードを1枚引く\n紫ゲージ+1');
    const [target] = await EffectHelper.selectCard(
      stack,
      stack.processing.owner,
      stack.processing.owner.hand,
      '捨てるカードを選んで下さい'
    );
    Effect.handes(stack, stack.processing, target);
    EffectTemplate.draw(stack.processing.owner, stack.core);
    await Effect.modifyPurple(stack, stack.processing, stack.processing.owner, 1);
  }
};

export const effects: CardEffects = {
  onDriveSelf: replaceMagick,
  onDrive: async (stack: StackWithCard) => {
    if (stack.processing.id !== stack.target?.id) await replaceMagick(stack);
  },
};
