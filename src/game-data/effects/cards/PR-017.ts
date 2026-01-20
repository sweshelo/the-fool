import { Unit } from '@/package/core/class/card';
import { Effect, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // カードが発動可能であるかを調べ、発動条件を満たしていれば true を、そうでなければ false を返す。
  checkDrive: (stack: StackWithCard) => {
    return stack.target instanceof Unit && stack.processing.owner.id === stack.target.owner.id;
  },

  // 実際の効果本体
  // 関数名に self は付かない
  onDrive: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, '滅亡の未来都市', '【機械】ユニットを1枚引く');
    EffectTemplate.reinforcements(stack, stack.processing.owner, { species: '機械' });
  },

  checkTurnStart: (stack: StackWithCard) => {
    return (
      stack.core.getTurnPlayer().id === stack.processing.owner.id &&
      stack.processing.owner.field.filter(unit => unit.catalog.species?.includes('機械')).length >=
        3
    );
  },

  onTurnStart: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, '滅亡の未来都市', '【機械】以外の基本BP-4000');
    stack.core.players
      .flatMap(player => player.field)
      .filter(unit => !unit.catalog.species?.includes('機械'))
      .forEach(unit => Effect.modifyBP(stack, stack.processing, unit, -4000, { isBaseBP: true }));
  },
};
