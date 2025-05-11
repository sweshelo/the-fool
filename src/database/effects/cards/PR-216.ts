import master from '@/database/catalog';
import { EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { Evolve, Unit } from '@/package/core/class/card';
import { Trigger } from '@/package/core/class/card/Trigger';
import { Intercept } from '@/package/core/class/card/Intercept';

export const effects: CardEffects = {
  // カードが発動可能であるかを調べ、発動条件を満たしていれば true を、そうでなければ false を返す。
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  checkDrive: (stack: StackWithCard) => {
    return true;
  },

  // 実際の効果本体
  // 関数名に self は付かない
  onDrive: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, 'ぶくなぎ綾花', `ランダムなカードを${stack.processing.lv}枚作成`);
    [
      ...Array(
        Math.min(
          stack.processing.lv,
          stack.core.room.rule.player.max.hand - stack.processing.owner.hand.length
        )
      ),
    ].forEach(() => {
      const [catalog] = EffectHelper.random(Array.from(master.values()));
      if (catalog) {
        switch (catalog.type) {
          case 'unit':
            stack.processing.owner.hand.push(new Unit(stack.processing.owner, catalog.id));
            break;
          case 'advanced_unit':
            stack.processing.owner.hand.push(new Evolve(stack.processing.owner, catalog.id));
            break;
          case 'intercept':
            stack.processing.owner.hand.push(new Intercept(stack.processing.owner, catalog.id));
            break;
          case 'trigger':
            stack.processing.owner.hand.push(new Trigger(stack.processing.owner, catalog.id));
            break;
        }
      }
    });
  },
};
