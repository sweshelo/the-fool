import type { ICard } from '@/submodule/suit/types/game/card';
import { Atom } from './Atom';
import master from '@/database/catalog';
import type { Player } from '../Player';
import type { Delta } from '../delta';

export abstract class Card extends Atom implements ICard {
  catalogId: string;
  lv: number = 1;
  delta: Delta[];

  constructor(owner: Player, catalogId: string) {
    super(owner);
    this.catalogId = catalogId;
    this.delta = [];
  }

  get catalog() {
    const c = master.get(this.catalogId);
    if (!c) throw new Error('カタログに存在しないカードが指定されました');

    return c;
  }

  reset() {
    this.delta = [];
    this.lv = 1;
  }

  abstract clone(owner: Player): Card;
}
