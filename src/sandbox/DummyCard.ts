/**
 * サンドボックス用ダミーカード
 * IAtom型（idのみ）のデータからカードを復元できない場合に使用される
 * 効果を持たない純粋なプレースホルダーとして機能する
 */

import type { IAtom, ICard, IUnit, IDelta } from '@/submodule/suit/types/game/card';
import type { Catalog } from '@/submodule/suit/types/game/card';
import type { Delta } from '@/package/core/class/delta';
import type { Player } from '@/package/core/class/Player';

/**
 * ダミーカード用のカタログ情報
 * 効果を持たない最小限の情報のみを含む
 */
export const DUMMY_CATALOG: Catalog = {
  id: 'DUMMY',
  name: 'Unknown Card',
  rarity: 'c',
  cost: 0,
  color: 6, // none
  ability: '',
  originality: 0,
  img: '',
  type: 'unit',
  info: {
    version: 0,
    number: 0,
  },
};

/**
 * サンドボックス用ダミーカードクラス
 * 相手の非公開情報（hand, deck, trigger）を表現するために使用
 */
export class DummyCard implements ICard {
  id: string;
  catalogId: string;
  lv: number;
  delta: Delta[];
  generation: number = 1;
  #owner: Player;

  constructor(owner: Player, atom: IAtom, catalogId?: string) {
    this.#owner = owner;
    this.id = atom.id;
    this.catalogId = catalogId ?? 'DUMMY';
    this.lv = 1;
    this.delta = [];
  }

  get owner(): Player {
    return this.#owner;
  }

  get catalog(): Catalog {
    return DUMMY_CATALOG;
  }

  reset() {
    this.delta = [];
    this.lv = 1;
    this.generation++;
  }

  clone(owner: Player): DummyCard {
    return new DummyCard(owner, { id: crypto.randomUUID() }, this.catalogId);
  }
}

/**
 * サンドボックス用ダミーユニットクラス
 * フィールド上の相手ユニットを表現するために使用
 * IUnit のすべてのプロパティを持つ
 */
export class DummyUnit extends DummyCard implements IUnit {
  bp: number;
  currentBP: number;
  active: boolean;
  isCopy: boolean;
  hasBootAbility: boolean | undefined;
  isBooted: boolean;

  constructor(owner: Player, unit: IUnit) {
    super(owner, unit, unit.catalogId);
    this.lv = unit.lv;
    this.bp = unit.bp;
    this.currentBP = unit.currentBP;
    this.active = unit.active;
    this.isCopy = unit.isCopy;
    this.hasBootAbility = unit.hasBootAbility;
    this.isBooted = unit.isBooted;
    // deltaをコピー（ただしDelta型ではなくIDelta型として）
    this.delta = (unit.delta ?? []) as unknown as Delta[];
  }

  hasKeyword(): boolean {
    return false;
  }

  clone(owner: Player): DummyUnit {
    return new DummyUnit(owner, this as IUnit);
  }
}
