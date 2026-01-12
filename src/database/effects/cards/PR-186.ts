import type { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // ■選略・魔校法度
  // このユニットがフィールドに出た時、以下の効果から1つを選び発動する。
  // ①：【悪魔】ユニットのカードを1枚ランダムで手札に加える。
  // ②：あなたのCPを-1する。そうした場合、このユニットに【スピードムーブ】を与える。
  //     【悪魔】ユニットのカードを1枚ランダムで手札に加える。
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;
    const choice = await EffectHelper.choice(stack, stack.processing.owner, '選略・魔校法度', [
      { id: '1', description: '【悪魔】ユニットを1枚引く' },
      {
        id: '2',
        description: 'CP-1\n【スピードムーブ】を得る\n【悪魔】ユニットを1枚引く',
        condition: () => owner.cp.current >= 1,
      },
    ]);

    switch (choice) {
      case '1': {
        await System.show(stack, '選略・魔校法度', '【悪魔】ユニットを1枚引く');
        EffectTemplate.reinforcements(stack, owner, { species: '悪魔' });
        break;
      }

      case '2': {
        await System.show(
          stack,
          '選略・魔校法度',
          'CP-1\n【スピードムーブ】を得る\n【悪魔】ユニットを1枚引く'
        );
        Effect.modifyCP(stack, stack.processing, stack.processing.owner, -1);
        Effect.speedMove(stack, stack.processing);
        EffectTemplate.reinforcements(stack, owner, { species: '悪魔' });
        break;
      }
    }
  },
};
