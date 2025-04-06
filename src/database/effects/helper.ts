import type { Player } from '@/package/core/class/Player';
import type { Core } from '@/package/core/core';
import type { IAtom } from '@/submodule/suit/types';

export class EffectHelper {
  static owner(core: Core, card: IAtom): Player {
    const result = core.players.find(player => player.find(card).result);
    if (result === undefined) throw new Error('存在しないカードが選択されました');

    return result;
  }
}
