/**
 * サンドボックスルーム
 * AIエージェントが手の評価をするためのテスト環境
 * - 固定の部屋番号で作成される
 * - プレイヤーが揃っていなくてもゲームが開始可能
 * - マリガンをスキップ
 * - 任意のフィールド状態を構築可能
 */

import { Room } from '@/package/server/room/room';
import { SandboxCore } from './SandboxCore';
import type { Rule } from '@/submodule/suit/types';
import type { SyncPayload } from '@/submodule/suit/types/message/payload/client';
import { getSandboxConfig } from './config';
import { loadState } from './StateLoader';

export class SandboxRoom extends Room {
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
    (this.core as SandboxCore).startSandbox();
  }

  /**
   * SyncPayloadの内容からゲーム状態を復元する
   * @param syncBody SyncPayloadのbody部分
   */
  loadState(syncBody: SyncPayload['body']) {
    console.log('[Sandbox] Loading state from SyncPayload');
    loadState(this.core, syncBody);
  }
}
