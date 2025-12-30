import { Evolve, Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import master from '@/submodule/suit/catalog/catalog';

export const effects: CardEffects = {
  // 自身が召喚された時に発動する効果を記述
  onDriveSelf: async (stack: StackWithCard): Promise<void> => {
    const candidate = EffectHelper.candidate(
      stack.core,
      unit => unit.owner.id !== stack.processing.owner.id,
      stack.processing.owner
    );
    if (candidate.length > 0) {
      await System.show(stack, 'ヘスティアのハピネスクッキング♪', '4000ダメージ');
      const [target1] = await EffectHelper.selectUnit(
        stack,
        stack.processing.owner,
        candidate,
        'ダメージを与えるユニットを選択して下さい',
        1
      );
      const result1 = Effect.damage(stack, stack.processing, target1, 4000, 'effect');

      const remainCandidate = candidate.filter(unit => unit.id !== target1.id);
      if (result1 && remainCandidate.length > 0) {
        await System.show(stack, 'ヘスティアのハピネスクッキング♪', '3000ダメージ');
        const [target2] = await EffectHelper.selectUnit(
          stack,
          stack.processing.owner,
          remainCandidate,
          'ダメージを与えるユニットを選択して下さい',
          1
        );
        const result2 = Effect.damage(stack, stack.processing, target2, 3000, 'effect');

        if (result2) {
          await System.show(stack, 'ヘスティアのハピネスクッキング♪', '2000ダメージ');
          stack.processing.owner.opponent.field.forEach(unit =>
            Effect.damage(stack, stack.processing, unit, 2000, 'effect')
          );
        }
      }
    }
  },

  onTurnEnd: async (stack: StackWithCard): Promise<void> => {
    if (stack.processing.owner.hand.length < stack.core.room.rule.player.max.hand) {
      await System.show(stack, '笑顔のハートフルキッチン♪', 'ランダムな【魔導士】を1枚作成');
      const [target] = EffectHelper.random(
        Array.from(master.values()).filter(catalog => catalog.species?.includes('魔導士'))
      );
      switch (target?.type) {
        case 'unit':
          stack.processing.owner.hand.push(new Unit(stack.processing.owner, target.id));
          break;
        case 'advanced_unit':
          stack.processing.owner.hand.push(new Evolve(stack.processing.owner, target.id));
          break;
      }
    }
  },
};
