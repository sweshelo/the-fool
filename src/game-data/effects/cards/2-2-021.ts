import { Unit } from '@/package/core/class/card';
import { Effect, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // 【秩序の盾】
  // ■選略・希望の心
  // このユニットが戦闘した時、以下の効果から1つを選び発動する。
  // ①：ターン終了時までこのユニットのBPを+2000する。
  // ②：あなたはカードを1枚引く。

  // 召喚時に秩序の盾を付与
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, '秩序の盾', '対戦相手の効果によるダメージを受けない');
    Effect.keyword(stack, stack.processing, stack.processing, '秩序の盾');
  },

  // 戦闘時の効果（アタック時とブロック時）
  onBattleSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const owner = stack.processing.owner;

    // 選択肢を提示
    const [choice] = await System.prompt(stack, owner.id, {
      type: 'option',
      title: '選略・希望の心',
      items: [
        { id: '1', description: 'ターン終了時までBP+2000' },
        { id: '2', description: 'カードを1枚引く' },
      ],
    });

    // 選択した効果を発動
    switch (choice) {
      case '1':
        // ①：ターン終了時までBP+2000
        await System.show(stack, '選略・希望の心', 'BP+2000');
        Effect.modifyBP(stack, stack.processing, stack.processing, 2000, {
          event: 'turnEnd',
          count: 1,
        });
        break;
      case '2':
        // ②：カードを1枚引く
        await System.show(stack, '選略・希望の心', 'カードを1枚引く');
        EffectTemplate.draw(owner, stack.core);
    }
  },
};
