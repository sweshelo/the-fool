/**
 * サンドボックス用ダミーカード
 * IAtom型（idのみ）のデータからカードを復元できない場合に使用される
 * 効果を持たない純粋なプレースホルダーとして機能する
 */

import type { IAtom, IUnit, KeywordEffect } from '@/submodule/suit/types/game/card';
import type { CatalogWithHandler } from '@/game-data/factory';
import { Card } from '@/package/core/class/card/Card';
import { Unit } from '@/package/core/class/card/Unit';
import type { Player } from '@/package/core/class/Player';

/**
 * ダミーカード用のカタログ情報
 * 効果を持たない最小限の情報のみを含む
 * CatalogWithHandler の追加プロパティは全てオプショナルなので、基本プロパティのみで定義可能
 */
export const DUMMY_CATALOG: CatalogWithHandler = {
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
 * Card クラスを継承することで、instanceof Card のチェックが正しく動作する
 */
export class DummyCard extends Card {
  constructor(owner: Player, atom: IAtom, catalogId?: string) {
    super(owner, catalogId ?? 'DUMMY');
    // Atom の自動生成 UUID を上書きして元の ID を保持する
    this.id = atom.id;
  }

  override get catalog(): CatalogWithHandler {
    return DUMMY_CATALOG;
  }

  override clone(owner: Player): DummyCard {
    return new DummyCard(owner, { id: crypto.randomUUID() }, this.catalogId);
  }
}

/**
 * サンドボックス用ダミーユニットクラス
 * フィールド上の相手ユニットを表現するために使用
 * Unit クラスを継承することで、instanceof Unit のチェックが正しく動作する
 *
 * NOTE: DummyUnit は相手の非公開情報を表現するプレースホルダーであり、
 * Delta インスタンスのメソッド（checkExpire() 等）は呼び出されない前提で設計されている。
 * そのため、unit.delta の IDelta[] を Delta[] として扱わず、空配列で初期化する。
 */
export class DummyUnit extends Unit {
  constructor(owner: Player, unit: IUnit) {
    super(owner, unit.catalogId);
    // Atom の自動生成 UUID を上書きして元の ID を保持する
    this.id = unit.id;
    // Unit コンストラクタで設定された値を IUnit データで上書き
    this.lv = unit.lv;
    this.bp = unit.bp;
    this.active = unit.active;
    this.isCopy = unit.isCopy;
    this.hasBootAbility = unit.hasBootAbility;
    this.isBooted = unit.isBooted;
    // DummyUnit では Delta インスタンスのメソッドは呼び出されないため、空配列で初期化する
    // unit.delta の IDelta[] を Delta[] にキャストするのは unsafe（checkExpire() 等のメソッドがない）
    this.delta = [];
  }

  override get catalog(): CatalogWithHandler {
    return DUMMY_CATALOG;
  }

  override hasKeyword(_keyword: KeywordEffect): boolean {
    // ダミーユニットはキーワード効果を持たない
    return false;
  }

  override clone(owner: Player): DummyUnit {
    return new DummyUnit(owner, this);
  }
}
