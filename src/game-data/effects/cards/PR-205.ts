import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // カードが発動可能であるかを調べ、発動条件を満たしていれば true を、そうでなければ false を返す。
  checkDrive: (stack: StackWithCard) => {
    const isChoice1Avail =
      stack.processing.owner.cp.current >= 1 &&
      EffectHelper.isUnitSelectable(stack.core, 'opponents', stack.processing.owner);
    const isChoice2Avail = EffectHelper.isUnitSelectable(
      stack.core,
      'owns',
      stack.processing.owner
    );

    return (
      stack.target instanceof Unit &&
      stack.processing.owner.id === stack.target.owner.id &&
      (isChoice1Avail || isChoice2Avail)
    );
  },

  // 実際の効果本体
  // 関数名に self は付かない
  onDrive: async (stack: StackWithCard): Promise<void> => {
    const isChoice1Avail =
      stack.processing.owner.cp.current >= 1 &&
      EffectHelper.isUnitSelectable(stack.core, 'opponents', stack.processing.owner);
    const isChoice2Avail = EffectHelper.isUnitSelectable(
      stack.core,
      'owns',
      stack.processing.owner
    );

    const choice = await EffectHelper.choice(stack, stack.processing.owner, '選略・モノクローム', [
      { id: '1', description: 'CP-1\n手札に戻す', condition: isChoice1Avail },
      { id: '2', description: '【沈黙効果耐性】を与える', condition: isChoice2Avail },
    ]);

    switch (choice) {
      case '1': {
        await System.show(stack, '選略・モノクローム', 'CP-1\n手札に戻す');
        const [target] = await EffectHelper.pickUnit(
          stack,
          stack.processing.owner,
          'opponents',
          '手札に戻すユニットを選択して下さい'
        );
        Effect.modifyCP(stack, stack.processing, stack.processing.owner, -1);
        Effect.bounce(stack, stack.processing, target, 'hand');
        break;
      }

      case '2': {
        await System.show(stack, '選略・モノクローム', '【沈黙効果耐性】を与える');
        const [target] = await EffectHelper.pickUnit(
          stack,
          stack.processing.owner,
          'owns',
          '【沈黙効果耐性】を与えるユニットを選択して下さい'
        );
        Effect.keyword(stack, stack.processing, target, '沈黙効果耐性');
        break;
      }
    }
  },
};
