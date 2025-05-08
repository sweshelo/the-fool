import type { ICard } from '@/submodule/suit/types';
import { Card } from './Card';
import type { Delta } from '../delta';
import type { Player } from '../Player';

export class Intercept extends Card implements ICard {
  clone(owner: Player): Intercept {
    const card = new Intercept(owner, this.catalogId);
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
