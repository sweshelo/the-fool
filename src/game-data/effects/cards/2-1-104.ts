/*
【スピードムーブ】
■選告・アウーケイシャーダ
このユニットがフィールドに出た時、対戦相手は以下の効果から1つを選び発動する。
①：対戦相手の全てのユニットに5000ダメージを与える。
②：対戦相手に1ライフダメージを与える。
■アルマーダ・ストライク
このユニットがアタックした時、対戦相手のユニットを1体選ぶ。それに2000ダメージを与える。
*/

import { Effect } from '@/game-data/effects/engine/effect';
import { EffectHelper } from '@/game-data/effects/engine/helper';
import { System } from '@/game-data/effects/engine/system';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';
import type { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    const choice = await EffectHelper.choice(
      stack,
      stack.processing.owner.opponent,
      '選告・アウーケイシャーダ',
      [
        {
          id: '1',
          description: '5000ダメージ',
          condition: stack.processing.owner.opponent.field.length > 0,
        },
        { id: '2', description: '1ライフダメージ' },
      ]
    );

    switch (choice) {
      case '1': {
        await System.show(stack, '選告・アウーケイシャーダ', '敵全体に5000ダメージ');
        stack.processing.owner.opponent.field.forEach(unit =>
          Effect.damage(stack, stack.processing, unit, 5000)
        );
        break;
      }
      case '2': {
        await System.show(stack, '選告・アウーケイシャーダ', '1ライフダメージ');
        Effect.modifyLife(stack, stack.processing, stack.processing.owner.opponent, -1);
        break;
      }
    }

    await System.show(stack, 'スピードムーブ', '行動制限の影響を受けない');
    Effect.speedMove(stack, stack.processing);
  },
  onAttackSelf: async (stack: StackWithCard) => {
    if (EffectHelper.isUnitSelectable(stack.core, 'opponents', stack.processing.owner)) {
      await System.show(stack, 'アルマーダ・ストライク', '2000ダメージ');
      const [target] = await EffectHelper.pickUnit(
        stack,
        stack.processing.owner,
        'opponents',
        'ダメージを与えるユニットを選択'
      );
      Effect.damage(stack, stack.processing, target, 2000);
    }
  },
};
