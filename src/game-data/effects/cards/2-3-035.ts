import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // ■龍玉
  // あなたの【ドラゴン】ユニットがフィールドに出た時、このカードのレベルによって以下の効果が発動する。
  // 【レベル1～2】それのレベルを+1する。
  // 【レベル3】それのレベルを+2する。
  checkDrive: (stack: StackWithCard): boolean => {
    const owner = stack.processing.owner;

    // 自分のドラゴンユニットが出た時のみ発動
    return (
      stack.source.id === owner.id &&
      stack.target instanceof Unit &&
      stack.target.catalog.species?.includes('ドラゴン') === true
    );
  },

  onDrive: async (stack: StackWithCard): Promise<void> => {
    if (!(stack.target instanceof Unit)) return;

    const cardLv = stack.processing.lv;
    const levelUp = cardLv >= 3 ? 2 : 1;

    await System.show(stack, '龍玉', `レベル+${levelUp}`);

    Effect.clock(stack, stack.processing, stack.target, levelUp);
  },
};
