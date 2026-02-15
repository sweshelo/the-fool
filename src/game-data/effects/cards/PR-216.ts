import master from '@/game-data/catalog';
import { resolveCatalog } from '@/game-data/factory';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // カードが発動可能であるかを調べ、発動条件を満たしていれば true を、そうでなければ false を返す。

  checkDrive: (_stack: StackWithCard) => {
    return true;
  },

  // 実際の効果本体
  // 関数名に self は付かない
  onDrive: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, 'ぶくなぎ綾花', `ランダムなカードを${stack.processing.lv}枚作成`);
    const version = stack.core.room.rule.system.version;
    const pool = Array.from(master.values())
      .map(entry => resolveCatalog(entry, version))
      .filter(catalog => catalog.type !== 'joker' && catalog.type !== 'virus')
      .map(catalog => catalog.id);
    EffectHelper.repeat(stack.processing.lv, () =>
      EffectHelper.random(pool).forEach(id => Effect.make(stack, stack.processing.owner, id))
    );
  },
};
