import type { ICard } from '@/submodule/suit/types/game/card';
import { Atom } from './Atom';
import type { Player } from '../Player';
import type { Delta } from '../delta';
import type { CatalogWithHandler } from '@/database/factory';

export abstract class Card extends Atom implements ICard {
  catalogId: string;
  lv: number = 1;
  delta: Delta[];
  generation: number = 1;

  constructor(owner: Player, catalogId: string) {
    super(owner);
    this.catalogId = catalogId;
    this.delta = [];
  }

  get catalog(): CatalogWithHandler {
    // 遅延ロードを使用して循環依存を回避
    // Lazy load to avoid circular dependency
    const getCatalog = () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { default: master } = require('@/database/catalog');
      return master;
    };

    const c: CatalogWithHandler = getCatalog().get(this.catalogId);
    if (!c) throw new Error('カタログに存在しないカードが指定されました');

    return c;
  }

  reset() {
    this.delta = this.delta.filter(delta => delta.permanent);
    this.lv = 1;
    this.generation++;
  }

  abstract clone(owner: Player): Card;
}
