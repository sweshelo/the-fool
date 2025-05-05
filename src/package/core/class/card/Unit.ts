import type { IUnit, KeywordEffect } from '@/submodule/suit/types/game/card';
import { Card } from './Card';
import master from '@/database/catalog';
import type { Player } from '../Player';
import type { Delta } from '../delta';

export class Unit extends Card implements IUnit {
  bp: {
    base: number;
    diff: number;
    damage: number;
  };
  active: boolean;
  destination?: string;
  overclocked?: boolean;
  isCopy: boolean;

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
    this.isCopy = false;
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
    const hasNoSilent = !this.delta?.some(
      buff => buff.effect.type === 'keyword' && buff.effect.name === '沈黙'
    );

    // 対象を発動中
    const hasTarget = this.delta?.some(
      buff => buff.effect.type === 'keyword' && buff.effect.name === keyword
    );

    return hasNoSilent && hasTarget;
  }

  // 自身をコピーしたユニットを生成する
  // BPやDeltaは恒久的なものとしてコピーする
  clone(owner: Player): Unit {
    const unit = new Unit(owner, this.catalogId);
    unit.bp = {
      base: this.currentBP(),
      diff: 0,
      damage: 0,
    };
    unit.isCopy = true;
    unit.delta = this.delta?.map<Delta>(buff => ({
      ...buff,
      checkExpire: buff.checkExpire.bind(unit),
      event: undefined,
    }));
    unit.active = this.active;

    return unit;
  }

  reset() {
    super.reset();
    this.bp = {
      base: 0,
      diff: 0,
      damage: 0,
    };
    this.active = false;
    this.overclocked = undefined;
    this.destination = undefined;
  }
}

export class Evolve extends Unit implements IUnit {}
