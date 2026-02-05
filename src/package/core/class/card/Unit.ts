import type { IUnit, KeywordEffect } from '@/submodule/suit/types/game/card';
import { Card } from './Card';
import master from '@/game-data/catalog';
import type { Player } from '../Player';
import { Delta } from '../delta';

export class Unit extends Card implements IUnit {
  /**
   * 基本BP
   * NOTE: 現在のBPを得る場合は currentBP を利用する
   */
  bp: number;
  /**
   * 行動権
   */
  active: boolean;
  /**
   * フィールドから離れることが確定している場合、処理が完了後に転送される予定の領域
   */
  destination?: string;
  /**
   * Lv3にクロックアップ後、オーバークロック処理を完了しているか
   */
  overclocked?: boolean;
  /**
   * 複製されたユニットであるか
   */
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
          if (delta.effect.type === 'bp' || delta.effect.type === 'dynamic-bp')
            return delta.effect.diff;
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
      .filter(
        delta =>
          !(delta.effect.type === 'keyword' && delta.effect.name === '行動制限') &&
          !(delta.effect.type === 'bp') &&
          !(delta.effect.type === 'damage') &&
          !(delta.effect.type === 'banned')
      )
      .map(delta => {
        if (delta.effect.type === 'dynamic-cost') {
          // dynamic-costは計算して固定化する
          const cost = delta.calculator?.(this) ?? 0;
          return new Delta({
            type: 'cost',
            value: cost,
          });
        } else {
          // デスカウンター / 寿命カウンター はそのまま維持、dynamic-costはcostに変換、それ以外は永続化
          const isCounter = delta.effect.type === 'death' || delta.effect.type === 'life';
          return new Delta(delta.effect, {
            ...delta,
            event: isCounter ? delta.event : undefined,
            source: isCounter ? delta.source : undefined,
          });
        }
      });
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

  toJSON() {
    return {
      ...super.toJSON(),
      bp: this.bp,
      active: this.active,
      destination: this.destination,
      overclocked: this.overclocked,
      isCopy: this.isCopy,
      hasBootAbility: this.hasBootAbility,
      isBooted: this.isBooted,
      currentBP: this.currentBP,
    };
  }
}

export class Evolve extends Unit implements IUnit {}
