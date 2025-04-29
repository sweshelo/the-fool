import type { ICard } from '@/submodule/suit/types/game/card';
import { Atom } from './Atom';
import master from '@/database/catalog';
import type { Player } from '../Player';

export abstract class Card extends Atom implements ICard {
  catalogId: string;
  lv: number = 1;

  constructor(owner: Player, catalogId: string) {
    super(owner);
    this.catalogId = catalogId;
  }

  get catalog() {
    const c = master.get(this.catalogId);
    if (!c) throw new Error('カタログに存在しないカードが指定されました');

    return c;
  }
}
