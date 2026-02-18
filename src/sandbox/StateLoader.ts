/**
 * サンドボックス環境でSyncPayloadからゲーム状態を復元するためのローダー
 */

import type { SyncPayload } from '@/submodule/suit/types/message/payload/client';
import type { IPlayer } from '@/submodule/suit/types/game/player';
import type { IAtom, ICard, IUnit, IDelta } from '@/submodule/suit/types/game/card';
import { Player } from '@/package/core/class/Player';
import type { Core } from '@/package/core';
import type { Card } from '@/package/core/class/card/Card';
import { Unit, Evolve } from '@/package/core/class/card/Unit';
import { Intercept } from '@/package/core/class/card/Intercept';
import { Trigger } from '@/package/core/class/card/Trigger';
import { Joker } from '@/package/core/class/card/Joker';
import { Delta } from '@/package/core/class/delta';
import { DummyCard, DummyUnit } from './DummyCard';
import catalog from '@/game-data/catalog';
import { isGameEvent } from '@/game-data/effects/schema/events';

/**
 * IAtomまたはICard型のデータからカードオブジェクトを復元する
 * catalogIdが存在する場合は実際のカードを、存在しない場合はダミーカードを生成
 * DummyCard は Card を継承しているため、戻り値は Card 型として統一される
 */
function restoreCard(owner: Player, data: IAtom | ICard): Card {
  // catalogIdが存在するかチェック
  if ('catalogId' in data && data.catalogId) {
    const master = catalog.get(data.catalogId);
    if (master) {
      let card: Card;
      switch (master.type) {
        case 'unit':
          card = new Unit(owner, data.catalogId);
          break;
        case 'advanced_unit':
          card = new Evolve(owner, data.catalogId);
          break;
        case 'intercept':
          card = new Intercept(owner, data.catalogId);
          break;
        case 'trigger':
          card = new Trigger(owner, data.catalogId);
          break;
        default:
          return new DummyCard(owner, data);
      }

      // ID と Lv を復元
      // Note: idは新規生成されるため、元のIDを保持したい場合は別途対応が必要
      if ('lv' in data) {
        card.lv = data.lv;
      }

      // deltaを復元
      // シリアライズされたdeltaにはIDeltaの基本プロパティに加え、
      // source, onlyForOwnersTurn, permanentが含まれている可能性がある
      if ('delta' in data && data.delta) {
        card.delta = data.delta.map(d => {
          const serialized = d as IDelta & {
            source?: Delta['source'];
            onlyForOwnersTurn?: boolean;
            permanent?: boolean;
          };
          return new Delta(serialized.effect, {
            count: serialized.count,
            event: serialized.event && isGameEvent(serialized.event) ? serialized.event : undefined,
            source: serialized.source,
            onlyForOwnersTurn: serialized.onlyForOwnersTurn,
            permanent: serialized.permanent,
          });
        });
      }

      return card;
    }
  }

  // catalogIdが存在しない場合はダミーカードを生成
  return new DummyCard(owner, data);
}

/**
 * IUnit型のデータからユニットオブジェクトを復元する
 * DummyUnit は Unit を継承しているため、戻り値は Unit 型として統一される
 */
function restoreUnit(owner: Player, data: IUnit): Unit {
  const master = catalog.get(data.catalogId);

  if (master && (master.type === 'unit' || master.type === 'advanced_unit')) {
    const unit =
      master.type === 'unit' ? new Unit(owner, data.catalogId) : new Evolve(owner, data.catalogId);

    // プロパティを復元
    unit.lv = data.lv;
    unit.bp = data.bp;
    unit.active = data.active;
    unit.isCopy = data.isCopy;
    unit.isBooted = data.isBooted;

    // deltaを復元
    // シリアライズされたdeltaにはIDeltaの基本プロパティに加え、
    // source, onlyForOwnersTurn, permanentが含まれている可能性がある
    if (data.delta) {
      unit.delta = data.delta.map(d => {
        const serialized = d as IDelta & {
          source?: Delta['source'];
          onlyForOwnersTurn?: boolean;
          permanent?: boolean;
        };
        return new Delta(serialized.effect, {
          count: serialized.count,
          event: serialized.event && isGameEvent(serialized.event) ? serialized.event : undefined,
          source: serialized.source,
          onlyForOwnersTurn: serialized.onlyForOwnersTurn,
          permanent: serialized.permanent,
        });
      });
    }

    return unit;
  }

  // カタログに存在しない場合はダミーユニットを生成
  return new DummyUnit(owner, data);
}

/**
 * サンドボックス用のプレイヤーを作成する
 * デッキ検証をスキップして空のデッキでプレイヤーを作成後、状態を復元する
 */
function createSandboxPlayer(playerId: string, data: IPlayer, core: Core): Player {
  // 空のデッキでプレイヤーを作成（デッキ検証をスキップ）
  const player = new Player(
    {
      id: playerId,
      name: data.name,
      deck: { cards: [], jokers: [] }, // 空のデッキで作成
    },
    core
  );

  // 状態を復元
  restorePlayerState(player, data);

  return player;
}

/**
 * SyncPayload の body からゲーム状態を復元する
 * @param core Core インスタンス
 * @param syncBody SyncPayload の body 部分
 */
export function loadState(core: Core, syncBody: SyncPayload['body']): void {
  const { game, players: playersData } = syncBody;

  // ゲーム状態を復元
  core.round = game.round;
  core.turn = game.turn;

  // プレイヤーが存在しない場合は新規作成
  if (core.players.length === 0) {
    // SyncPayloadのプレイヤーデータから新しいプレイヤーを作成
    for (const [playerId, playerData] of Object.entries(playersData)) {
      if (playerData) {
        const player = createSandboxPlayer(playerId, playerData, core);
        core.players.push(player);
        console.log(`[StateLoader] Created player: ${player.name} (${player.id})`);
      }
    }
  } else {
    // 既存のプレイヤーの状態を復元
    core.players.forEach(player => {
      const playerData = playersData[player.id];
      if (!playerData) {
        console.warn(`Player data not found for ${player.id}`);
        return;
      }

      restorePlayerState(player, playerData);
    });
  }

  // sync を実行して状態を同期
  core.room.sync(true);
}

/**
 * プレイヤー状態を復元する
 */
function restorePlayerState(player: Player, data: IPlayer): void {
  // CP を復元
  player.cp = { ...data.cp };

  // ライフを復元
  player.life = { ...data.life };

  // 各カード領域を復元
  // デッキ: IAtom[] または ICard[]
  player.deck = data.deck.map(cardData => restoreCard(player, cardData));

  // 手札: IAtom[] または ICard[]
  player.hand = data.hand.map(cardData => restoreCard(player, cardData));

  // トリガー: IAtom[]
  player.trigger = data.trigger.map(cardData => restoreCard(player, cardData));

  // トラッシュ: ICard[]
  player.trash = data.trash.map(cardData => restoreCard(player, cardData));

  // 消滅: ICard[]
  player.delete = data.delete.map(cardData => restoreCard(player, cardData));

  // フィールド: IUnit[]
  player.field = data.field.map(unitData => restoreUnit(player, unitData));

  // ジョーカー
  player.joker.gauge = data.joker.gauge;
  // ジョーカーカードの復元（既に初期化されている場合はゲージのみ更新）
  if (data.joker.card && data.joker.card.length > 0) {
    player.joker.card = data.joker.card.map(jokerData => {
      const joker = new Joker(player, jokerData.catalogId);
      joker.lv = jokerData.lv;
      return joker;
    });
  }

  // 紫ゲージ
  player.purple = data.purple;
}

/**
 * 空のプレイヤー状態を生成する（テスト用）
 */
export function createEmptyPlayerState(playerId: string, playerName: string): IPlayer {
  return {
    id: playerId,
    name: playerName,
    deck: [],
    hand: [],
    field: [],
    trash: [],
    delete: [],
    trigger: [],
    purple: undefined,
    cp: {
      current: 2,
      max: 2,
    },
    life: {
      current: 8,
      max: 8,
    },
    joker: {
      card: [],
      gauge: 0,
    },
  };
}
