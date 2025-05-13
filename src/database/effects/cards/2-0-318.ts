import { Unit } from '@/package/core/class/card';
import { Effect, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { Delta } from '@/package/core/class/delta';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard) => {
    const opponent = stack.processing.owner.opponent;
    const candidates = opponent.field.filter(unit => unit.lv >= 2);
    if (candidates.length === 0) return;

    await System.show(stack, '冷酷なる裁き', `レベル2以上のユニットを1体破壊`);
    const [targetId] = await System.prompt(stack, stack.processing.owner.id, {
      title: '破壊する相手ユニットを選択',
      type: 'unit',
      items: candidates,
    });
    const target = opponent.field.find(unit => unit.id === targetId);
    if (target) {
      Effect.break(stack, stack.processing, target, 'effect');
    }
  },

  // 破壊時効果：手札に戻る
  onBreakSelf: async (stack: StackWithCard) => {
    if (stack.processing instanceof Unit) {
      if (stack.processing.destination === 'hand') return;
      await System.show(stack, '冷酷なる裁き', '手札に戻す');
      Effect.bounce(stack, stack.processing, stack.processing, 'hand');
    }
  },

  // オーバークロック時効果：選択肢
  onOverclockSelf: async (stack: StackWithCard) => {
    const owner = stack.processing.owner;
    const [choice] = await System.prompt(stack, owner.id, {
      type: 'option',
      title: '選略・ジャッジガベル',
      items: [
        { id: '1', description: 'BP+5000' },
        { id: '2', description: 'インターセプトカードを1枚引く' },
      ],
    });

    if (choice === '1') {
      // 全フィールドユニットにBP+5000（ターン終了時まで）
      const allUnits = [...owner.field, ...owner.opponent.field];
      allUnits.forEach(unit => {
        // Deltaで一時的BP増加（event: 'turnEnd', count: 1 でターン終了時まで）
        unit.delta.push(new Delta({ type: 'bp', diff: 5000 }, { event: 'turnEnd', count: 1 }));
      });
      await System.show(stack, '選略・ジャッジガベル', 'BP+5000');
    } else if (choice === '2') {
      // デッキからインターセプトカードを1枚手札に加える
      EffectTemplate.reinforcements(stack, owner, { type: ['intercept'] });
      await System.show(stack, '選略・ジャッジガベル', 'インターセプトカードを1枚引く');
    }
  },
};
