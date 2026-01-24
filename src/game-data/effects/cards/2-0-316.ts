import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { Color } from '@/submodule/suit/constant/color';

export const effects: CardEffects = {
  // ■選略・竜胆の舞
  // このユニットがフィールドに出た時、以下の効果から1つを選び発動する。
  // ①：対戦相手のユニットからランダムで2体のレベルを+1する。
  // ②：あなたのフィールドに青属性ユニットが2体以上いる場合、対戦相手のレベル2以上のユニットをランダムで1体破壊する。
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    // 選択肢①が選べるか確認（相手フィールドにユニットがいるか）
    const canOption1 = opponent.field.length > 0;

    // 選択肢②が選べるか確認（自分のフィールドに青属性ユニットが2体以上いて、相手にLv2以上がいるか）
    const blueUnits = owner.field.filter(unit => unit.catalog.color === Color.BLUE);
    const hasEnoughBlue = blueUnits.length >= 2;
    const lv2OrHigher = opponent.field.filter(unit => unit.lv >= 2);
    const canOption2 = hasEnoughBlue && lv2OrHigher.length > 0;

    // どちらも選べない場合は発動しない
    if (!canOption1 && !canOption2) return;

    // 選択肢の提示
    const [choice] =
      canOption1 && canOption2
        ? await System.prompt(stack, owner.id, {
            title: '選略・竜胆の舞',
            type: 'option',
            items: [
              { id: '1', description: '対戦相手のユニットからランダムで2体のレベルを+1' },
              { id: '2', description: '対戦相手のLv2以上のユニットをランダムで1体破壊' },
            ],
          })
        : canOption1
          ? ['1']
          : ['2'];

    if (choice === '1') {
      await System.show(stack, '選略・竜胆の舞', '敵ユニット2体のレベル+1');

      // ランダムで2体まで選んでレベル+1
      const count = Math.min(2, opponent.field.length);
      EffectHelper.random(opponent.field, count).forEach(unit => {
        Effect.clock(stack, stack.processing, unit, 1);
      });
    } else {
      await System.show(stack, '選略・竜胆の舞', 'Lv2以上を1体破壊');

      // ランダムで1体破壊
      EffectHelper.random(lv2OrHigher, 1).forEach(unit => {
        Effect.break(stack, stack.processing, unit);
      });
    }
  },
};
