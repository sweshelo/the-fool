import { Card } from './Card';
import type { Player } from '../Player';

export class Joker extends Card {
  constructor(owner: Player, catalogId: string) {
    super(owner, catalogId);
  }

  clone(owner: Player): Joker {
    const joker = new Joker(owner, this.catalogId);
    joker.lv = this.lv;
    joker.delta = [...this.delta];
    joker.generation = this.generation;
    return joker;
  }
}
