import type { IAtom } from '@/submodule/suit/types/game/card';
import type { Player } from '../Player';

export class Atom implements IAtom {
  id: string = crypto.randomUUID();
  #owner: Player;

  constructor(player: Player) {
    this.#owner = player;
  }

  get owner(): Player {
    return this.#owner;
  }
}
