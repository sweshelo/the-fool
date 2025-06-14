import { Unit } from '@/package/core/class/card';
import { Effect } from '../classes/effect';
import type { CardEffects, StackWithCard } from '../classes/types';
import { System } from '../classes/system';
import { EffectHelper } from '../classes/helper';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    const self = stack.processing as Unit;
    const opponent = self.owner.opponent;

    // 対戦相手のフィールドにユニットが存在するか確認
    if (opponent.field.length === 0) return;

    // 対戦相手のユニットを1体選ぶ
    const [target] = await EffectHelper.selectUnit(
      stack,
      self.owner,
      opponent.field,
      '【呪縛】を与えるユニットを選んでください'
    );

    if (!target) return;

    await System.show(stack, '封印の湖', '【呪縛】');
    Effect.keyword(stack, self, target, '呪縛');
  },
};
