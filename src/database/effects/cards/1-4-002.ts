import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

const mainEffect = async (stack: StackWithCard, attacker: Unit) => {
  const [choice] = await System.prompt(stack, stack.processing.owner.id, {
    title: '選略・鼓武激励',
    type: 'option',
    items: [
      { id: '1', description: 'アタックしたユニットのBPを+2000する' },
      { id: '2', description: 'アタックしたユニットのレベルを+1する' },
    ],
  });

  if (choice === '1') {
    await System.show(stack, '選略・鼓武激励', 'BP+2000');
    Effect.modifyBP(stack, stack.processing, attacker, 2000, {
      event: 'turnEnd',
      count: 1,
    });
  } else {
    await System.show(stack, '選略・鼓武激励', 'レベル+1');
    Effect.clock(stack, stack.processing, attacker, 1);
  }
};

export const effects: CardEffects = {
  // バーングラウンド：フィールドに出た時、自身以外の全てのユニットに1000ダメージ
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, 'バーングラウンド', '全ユニットに1000ダメージ');

    EffectHelper.exceptSelf(stack.core, stack.processing, unit => {
      Effect.damage(stack, stack.processing, unit, 1000);
    });
  },

  onAttackSelf: async (stack: StackWithCard<Unit>) => {
    await mainEffect(stack, stack.processing);
  },

  // 選略・鼓武激励：あなたの【戦士】ユニットがアタックした時の効果
  onAttack: async (stack: StackWithCard<Unit>): Promise<void> => {
    // アタックしているユニットが自分の【戦士】ユニットか確認
    const attacker = stack.target as Unit;
    if (
      attacker.owner.id === stack.processing.owner.id &&
      attacker.id !== stack.processing.id &&
      attacker.catalog.species?.includes('戦士')
    ) {
      await mainEffect(stack, attacker);
    }
  },
};
