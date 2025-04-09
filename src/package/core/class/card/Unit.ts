import type { IUnit } from '@/submodule/suit/types/game/card';
import { Card } from './Card';
import master from '@/database/catalog';

export class Unit extends Card implements IUnit {
  bp: {
    base: number;
    diff: number;
    damage: number;
  };
  active: boolean;
  destination?: string;
  overclocked?: boolean;

  constructor(catalogId: string) {
    super(catalogId);
    const catalog = master.get(catalogId);

    if (!catalog) throw new Error('存在しないカードが指定されました');

    this.bp = {
      base: catalog?.bp?.[this.lv - 1] ?? 0,
      diff: 0,
      damage: 0,
    };
    this.active = true;
    this.destination = undefined;
  }

  initBP() {
    const catalog = master.get(this.catalogId);
    this.bp = {
      base: catalog?.bp?.[this.lv - 1] ?? 0,
      diff: 0,
      damage: 0,
    };
  }
}
