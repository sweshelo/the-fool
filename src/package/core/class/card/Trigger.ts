import type { ICard } from '@/submodule/suit/types';
import { Card } from './Card';
import type { Player } from '../Player';
import type { Delta } from '../delta';

export class Trigger extends Card implements ICard {
  clone(owner: Player): Trigger {
    const card = new Trigger(owner, this.catalogId);
    card.delta = this.delta?.map<Delta>(buff => ({
      ...buff,
      checkExpire: buff.checkExpire.bind(card),
      event: undefined,
      source: undefined,
    }));
    card.lv = this.lv;
    return card;
  }
}
