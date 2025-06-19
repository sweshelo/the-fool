import type { IUnit, KeywordEffect } from '@/submodule/suit/types/game/card';
import { Card } from './Card';
import master from '@/database/catalog';
import type { Player } from '../Player';
import type { Delta } from '../delta';

export class Unit extends Card implements IUnit {
  bp: number;
  active: boolean;
  destination?: string;
  overclocked?: boolean;
  isCopy: boolean;
  hasBootAbility: undefined | boolean;
  isBooted: boolean = false;

  constructor(owner: Player, catalogId: string) {
    super(owner, catalogId);

    this.bp = this.catalog.bp?.[this.lv - 1] ?? 0;
    this.active = true;
    this.destination = undefined;
    this.delta = [];
    this.isCopy = false;
    this.hasBootAbility = typeof this.catalog.onBootSelf === 'function' ? true : undefined;
  }

  initBP() {
    const catalog = master.get(this.catalogId);
    this.bp = catalog?.bp?.[this.lv - 1] ?? 0;
  }

  get currentBP() {
    return (
      this.bp +
      this.delta
        .map(delta => {
          if (delta.effect.type === 'bp') return delta.effect.diff;
          if (delta.effect.type === 'damage') return -delta.effect.value;
          return 0;
        })
        .reduce((acc, current) => acc + current, 0)
    );
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

    switch (keyword) {
      case '沈黙':
        return !hasNoSilent;
      case '行動制限':
      case '起動':
        return hasTarget;
      default:
        return hasNoSilent && hasTarget;
    }
  }

  // 自身をコピーしたユニットを生成する
  // BPやDeltaは恒久的なものとしてコピーする
  /**
   * @param owner コピーの所有者
   * @param copy 【複製】かどうか
   */
  clone(owner: Player, copy: boolean = false): Unit {
    const unit = new Unit(owner, this.catalogId);
    unit.bp = this.currentBP;
    unit.isCopy = copy;
    unit.delta = this.delta
      ?.map<Delta>(buff => ({
        ...buff,
        checkExpire: buff.checkExpire.bind(unit),
        event: undefined,
        source: undefined,
      }))
      .filter(
        delta =>
          !(delta.effect.type === 'keyword' && delta.effect.name === '行動制限') &&
          !(delta.effect.type === 'bp') &&
          !(delta.effect.type === 'damage')
      );
    unit.active = this.active;
    unit.lv = this.lv;
    unit.isBooted = this.isBooted;
    return unit;
  }

  reset() {
    super.reset();
    this.bp = 0;
    this.active = false;
    this.overclocked = undefined;
    this.destination = undefined;
    this.hasBootAbility = typeof this.catalog.onBootSelf === 'function' ? true : undefined;
    this.isBooted = false;
  }
}

export class Evolve extends Unit implements IUnit {}
