import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // このユニットがフィールドに出た時、このユニットのレベルを+1する。
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, 'デルタドライブ', 'レベル+1');
    Effect.clock(stack, stack.processing, stack.processing, +1);
  },

  // このユニットがプレイヤーアタックに成功した時、このユニットのレベルに応じて効果が発動する。
  onPlayerAttackSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    // このユニットのレベルに基づいて効果を振り分ける
    switch (stack.processing.lv) {
      case 1:
      case 2:
        // レベル1～2の効果: 対戦相手のユニットを1体選ぶ。それに5000ダメージを与える。
        const filter = (unit: Unit) => unit.owner.id === stack.processing.owner.opponent.id;

        if (EffectHelper.isUnitSelectable(stack.core, filter, stack.processing.owner)) {
          await System.show(stack, 'フレイムボルテックス', '5000ダメージ');
          const [target] = await EffectHelper.pickUnit(
            stack,
            stack.processing.owner,
            filter,
            'ダメージを与えるユニットを選択して下さい'
          );

          Effect.damage(stack, stack.processing, target, 5000, 'effect');
        }
        break;

      case 3:
        // レベル3の効果: 対戦相手の全てのユニットに5000ダメージを与える。このユニットのレベルを-2する。
        await System.show(stack, 'フレイムボルテックス', '敵全体に5000ダメージ\nレベル-2');

        // 対戦相手の全ユニットを取得
        const oppUnitsLv3 = stack.processing.owner.opponent.field;

        // 全ての敵ユニットにダメージを与える
        for (const unit of oppUnitsLv3) {
          Effect.damage(stack, stack.processing, unit, 5000, 'effect');
        }

        // レベルを-2する
        Effect.clock(stack, stack.processing, stack.processing, -2);
        break;
    }
  },
};
