/**
 * サンドボックスルーム
 * AIエージェントが手の評価をするためのテスト環境
 * - 固定の部屋番号で作成される
 * - プレイヤーが揃っていなくてもゲームが開始可能
 * - マリガンをスキップ
 * - 任意のフィールド状態を構築可能
 */

import { Room } from '@/package/server/room/room';
import { Player } from '@/package/core/class/Player';
import { SandboxCore } from './SandboxCore';
import type { Rule } from '@/submodule/suit/types';
import type { SyncPayload } from '@/submodule/suit/types/message/payload/client';
import type { Message } from '@/submodule/suit/types/message/message';
import type { ServerWebSocket } from 'bun';
import { getSandboxConfig } from './config';
import { loadState } from './StateLoader';

export class SandboxRoom extends Room {
  override core: SandboxCore;

  constructor(name: string, rule?: Rule) {
    super(name, rule);

    // 固定の部屋IDを設定
    this.id = getSandboxConfig().roomId;

    // SandboxCoreで置き換え
    this.core = new SandboxCore(this);
  }

  /**
   * サンドボックスモードでゲームを開始する
   * プレイヤーが揃っていなくても開始可能
   */
  startSandbox() {
    if (this.core.players.length === 0) {
      console.warn('[Sandbox] No players in room, cannot start game');
      return;
    }

    console.log(`[Sandbox] Starting game with ${this.core.players.length} player(s)`);
    // oxlint-disable-next-line no-floating-promises
    this.core.startSandbox();
  }

  /**
   * SyncPayloadの内容からゲーム状態を復元する
   * @param syncBody SyncPayloadのbody部分
   */
  loadState(syncBody: SyncPayload['body']) {
    console.log('[Sandbox] Loading state from SyncPayload');
    loadState(this.core, syncBody);
  }

  /**
   * サンドボックス用のプレイヤー参加処理
   * loadStateで既にプレイヤーが設定されている場合、WebSocketクライアントのみを関連付ける
   */
  override join(socket: ServerWebSocket, message: Message): boolean {
    if (message.payload.type !== 'PlayerEntry') {
      return false;
    }

    const playerId = message.payload.player.id;
    const playerName = message.payload.player.name;

    // loadStateで設定されたプレイヤーを探す
    const existingPlayer = this.core.players.find(p => p.id === playerId);

    if (existingPlayer) {
      // 既存プレイヤーにWebSocketクライアントを関連付ける
      this.clients.set(existingPlayer.id, socket);
      this.players.set(existingPlayer.id, existingPlayer);
      console.log(`[Sandbox] Player ${playerName} (${playerId}) connected to existing session`);
    } else {
      // loadStateで設定されていないプレイヤーの場合、新規プレイヤーを作成
      console.log(`[Sandbox] New player ${playerName} (${playerId}) joining sandbox`);

      const player = new Player(message.payload.player, this.core);
      this.clients.set(player.id, socket);
      this.core.entry(player);
      this.players.set(player.id, player);
    }

    // 同期メッセージを送信
    this.sync(true);
    return true;
  }
}
