import type { ICard } from '@/submodule/suit/types/game/card';
import { Atom } from './Atom';
import type { Player } from '../Player';
import type { Delta } from '../delta';
import type { CatalogWithHandler } from '@/game-data/factory';

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

  protected get version(): string {
    return this.owner.core.room.rule.system.version;
  }

  get catalog(): CatalogWithHandler {
    // 遅延ロードを使用して循環依存を回避
    // Lazy load to avoid circular dependency
    const { default: master } = require('@/game-data/catalog');
    const { resolveCatalog } = require('@/game-data/factory');

    const versions = master.get(this.catalogId);
    if (!versions) throw new Error('カタログに存在しないカードが指定されました');

    return resolveCatalog(versions, this.version);
  }

  reset(forceReset: boolean = false) {
    this.delta = this.delta.filter(delta => delta.permanent && !forceReset);
    this.lv = 1;
    this.generation++;
  }

  get currentCost(): number {
    const [, minMatch] = this.catalog.ability?.match(/コストは(\d+)以下にならない/) ?? [];
    const [, maxMatch] = this.catalog.ability?.match(/コストは(\d+)以上にならない/) ?? [];

    const raw =
      this.catalog.cost +
      this.delta
        .map(delta => {
          switch (delta.effect.type) {
            case 'cost':
              return delta.effect.value;
            case 'dynamic-cost':
              return delta.effect.diff;
            default:
              return 0;
          }
        })
        .reduce((acc, cur) => acc + cur, 0);

    let result = raw;

    // 「X以下にならない」= Xより大きくなる = 最小値は X + 1
    if (minMatch) {
      result = Math.max(result, parseInt(minMatch) + 1);
    }

    // 「X以上にならない」= Xより小さくなる = 最大値は X - 1
    if (maxMatch) {
      result = Math.min(result, parseInt(maxMatch) - 1);
    }

    // コストは0未満にならない
    return Math.max(result, 0);
  }

  abstract clone(owner: Player): Card;

  toJSON() {
    return {
      id: this.id,
      catalogId: this.catalogId,
      lv: this.lv,
      delta: this.delta,
      generation: this.generation,
      currentCost: this.currentCost,
    };
  }
}
