import type { Unit } from '@/package/core/class/card';
import { Player } from '@/package/core/class/Player';
import type { Core } from '@/package/core/core';
import type { IAtom } from '@/submodule/suit/types';

export class EffectHelper {
  static owner(core: Core, card: IAtom): Player {
    const result = core.players.find(player => player.find(card).result);
    if (result === undefined) throw new Error('存在しないカードが選択されました');

    return result;
  }

  static opponent(core: Core, card: IAtom): Player {
    const owner = this.owner(core, card);
    const opponent = core.players.find(p => p.id !== owner.id);

    if (opponent) {
      return opponent;
    } else {
      throw new Error('対戦相手が存在しません');
    }
  }

  /**
   * 『自身以外に』の効果を実行する
   * @param effect 実行する効果
   */
  static exceptSelf(core: Core, card: Unit, effect: (unit: Unit) => void): void {
    // 自身以外
    const units = core.players
      .map(p => p.field)
      .flat()
      .filter(u => u.id !== card.id);
    units.forEach(effect);
  }
}
