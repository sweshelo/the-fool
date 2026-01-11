import type { ICard } from '@/submodule/suit/types';
import { Card } from './Card';
import { Delta } from '../delta';
import type { Player } from '../Player';

export class Intercept extends Card implements ICard {
  #originalRemain: number;
  remain: number;
  revealed: boolean = false;

  constructor(owner: Player, catalogId: string) {
    super(owner, catalogId);

    const [match, count] =
      this.catalog.ability?.match(/このインターセプト(?:カード)?は(\d+)回使用すると捨札にいく/) ??
      [];
    this.#originalRemain = match && count ? parseInt(count, 10) : 1;
    this.remain = this.#originalRemain;
  }

  clone(owner: Player): Intercept {
    const card = new Intercept(owner, this.catalogId);
    card.delta = this.delta?.map<Delta>(delta => {
      return new Delta(delta.effect, {
        ...delta,
      });
    });
    card.lv = this.lv;
    return card;
  }

  reset(): void {
    super.reset();
    this.revealed = false;
    this.remain = this.#originalRemain;
  }
}
