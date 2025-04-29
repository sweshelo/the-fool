import type { IUnit } from '@/submodule/suit/types/game/card';
import { Card } from './Card';
import master from '@/database/catalog';
import type { Player } from '../Player';
import type { Delta, KeywordEffect } from '../delta';

export class Unit extends Card implements IUnit {
  bp: {
    base: number;
    diff: number;
    damage: number;
  };
  active: boolean;
  destination?: string;
  overclocked?: boolean;
  delta: Delta[];

  constructor(owner: Player, catalogId: string) {
    super(owner, catalogId);

    this.bp = {
      base: this.catalog.bp?.[this.lv - 1] ?? 0,
      diff: 0,
      damage: 0,
    };
    this.active = true;
    this.destination = undefined;
    this.delta = [];
  }

  initBP() {
    const catalog = master.get(this.catalogId);
    this.bp = {
      base: catalog?.bp?.[this.lv - 1] ?? 0,
      diff: 0,
      damage: 0,
    };
  }

  currentBP() {
    return this.bp.base + this.bp.diff - this.bp.damage;
  }

  hasKeyword(keyword: KeywordEffect) {
    // 沈黙を発動していない
    const hasNoSilent = !this.delta.some(
      buff => buff.effect.type === 'keyword' && buff.effect.name === '沈黙'
    );

    // 対象を発動中
    const hasTarget = this.delta.some(
      buff => buff.effect.type === 'keyword' && buff.effect.name === keyword
    );

    return hasNoSilent && hasTarget;
  }
}
