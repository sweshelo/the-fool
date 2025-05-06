import type { Choices } from '@/submodule/suit/types/game/system';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard): Promise<void> => {
    const candidate = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id !== stack.processing.owner.id && !unit.active
    );
    const life = stack.processing.owner.life.current;

    if (candidate.length > 0) {
      await System.show(
        stack,
        'ロード・トゥ・ヴァルハラ',
        `ユニットを【複製】する${life <= 6 ? '\n手札に作成する' : ''}${life <= 4 ? '\n消滅させる' : ''}`
      );
      const choices: Choices = {
        title: '対象のユニットを選択してください',
        type: 'unit',
        items: candidate,
      };

      const [unitId] = await System.prompt(stack, stack.processing.owner.id, choices);
      const unit = candidate.find(card => card.id === unitId);
      if (!(unit instanceof Unit)) throw new Error('ユニットでないオブジェクトが選択されました');

      if (life <= 8) Effect.clone(stack, stack.processing, unit, stack.processing.owner);
      // if (life <= 6) Effect.make(stack, stack.processing, unit, stack.processing.owner) // TODO: make未実装
      if (life <= 4) Effect.delete(stack, stack.processing, unit);
    }
  },
};
