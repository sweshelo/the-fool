import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // 自身が召喚された時に発動する効果を記述
  onAttackSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, '魅入られし従者', '【道化師】を1枚引く');
    EffectTemplate.reinforcements(stack, stack.processing.owner, { species: '道化師' });
  },

  // 自身以外が召喚された時に発動する効果を記述
  // 味方ユニットであるかの判定などを忘れない
  onAttack: async (stack: StackWithCard): Promise<void> => {
    if (stack.target instanceof Unit && stack.processing.owner.id === stack.target.owner.id) {
      await System.show(stack, '狂姫の闊歩', '【防御禁止】を与える');
      const candidate = EffectHelper.candidate(
        stack.core,
        unit => unit.owner.id !== stack.processing.owner.id,
        stack.processing.owner
      );
      const [target] = await EffectHelper.selectUnit(
        stack,
        stack.processing.owner,
        candidate,
        '【防御禁止】を与えるユニットを選択して下さい',
        1
      );
      Effect.keyword(stack, stack.processing, target, '防御禁止');
    }
  },
};
