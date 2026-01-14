/**
 * サンドボックス用Core
 * AIエージェントの手の評価用に特化したゲームロジック
 * - マリガンをスキップ
 * - プレイヤーが1人でもゲーム開始可能
 */

import { Core } from '@/package/core/core';
import type { Room } from '@/package/server/room/room';
import type { Player } from '@/package/core/class/Player';
import { MessageHelper } from '@/package/core/message';
import { createMessage } from '@/submodule/suit/types/message/message';
import { Stack } from '@/package/core/class/stack';

export class SandboxCore extends Core {
  /** サンドボックスモードかどうか */
  private sandboxMode: boolean = true;

  constructor(room: Room) {
    super(room);
  }

  /**
   * プレイヤーエントリー
   * サンドボックスモードでは2人揃わなくても自動開始しない
   */
  entry(player: Player) {
    // 同じIDのプレイヤーが既に存在するか確認
    const existingPlayerIndex = this.players.findIndex(p => p.id === player.id);
    if (existingPlayerIndex >= 0) {
      console.log(`[Sandbox] Player with ID ${player.id} already exists. Replacing.`);
      this.players.splice(existingPlayerIndex, 1);
    }

    this.players.push(player);
    this.room.broadcastToPlayer(player.id, MessageHelper.freeze());
    console.log('[Sandbox] Player %s added in room %s', player.id, this.room.id);

    // サンドボックスモードでは自動開始しない
    // startSandbox() を明示的に呼び出す必要がある
  }

  /**
   * サンドボックスモードでゲームを開始
   * マリガンをスキップし、即座にゲームを開始する
   */
  async startSandbox() {
    console.log('[Sandbox] Starting sandbox game...');

    // ターンプレイヤーを解凍
    if (this.players.length > 0) {
      this.room.broadcastToPlayer(this.getTurnPlayer().id, MessageHelper.defrost());
    }

    // マリガンなしでターン開始
    await this.turnChangeSandbox(true);
  }

  /**
   * サンドボックス用ターンチェンジ
   * マリガンをスキップしてターンを進める
   */
  async turnChangeSandbox(isFirstTurn: boolean = false) {
    // freeze
    this.room.broadcastToAll(MessageHelper.freeze());

    if (!isFirstTurn) {
      // ターン終了スタックを積み、解決する
      this.stack.push(
        new Stack({
          type: 'turnEnd',
          source: this.getTurnPlayer(),
          core: this,
        })
      );
      await this.resolveStack();

      // ターン終了処理（通常のturnChangeと同じ）
      const { Effect } = await import('@/database/effects');
      const deathCounterCheckStack = new Stack({
        type: '_deathCounterCheckStack',
        source: this.getTurnPlayer(),
        core: this,
      });
      this.getTurnPlayer().field.forEach(unit => {
        if (unit.hasKeyword('不屈') && !unit.active) {
          unit.active = true;
          this.room.soundEffect('reboot');
        }
        if (unit.delta.some(delta => delta.effect.type === 'death' && delta.count <= 0)) {
          Effect.break(deathCounterCheckStack, unit, unit, 'death');
        }
      });
      this.stack.push(deathCounterCheckStack);
      await this.resolveStack();

      // ウィルス除外
      const afterField = this.getTurnPlayer().field.filter(
        unit => !unit.delta.some(delta => delta.effect.type === 'life' && delta.count <= 0)
      );
      if (afterField.length !== this.getTurnPlayer().field.length) {
        this.getTurnPlayer().field = afterField;
        this.room.soundEffect('leave');
      }

      this.getTurnPlayer().joker.gauge = Math.min(this.getTurnPlayer().joker.gauge + 10, 100);
      this.room.sync();

      // ターン開始処理
      this.turn++;
      this.round = Math.floor((this.turn + 1) / 2);
    }
    // isFirstTurn の場合、マリガンをスキップ

    // CP初期化
    const turnPlayer = this.getTurnPlayer();
    if (turnPlayer) {
      console.log(
        `[Sandbox][turnChange] Room: %s | ROUND: %s / Turn: %s`,
        this.room.id,
        this.round,
        this.turn
      );

      this.room.broadcastToAll(
        createMessage({
          action: {
            handler: 'client',
            type: 'visual',
          },
          payload: {
            type: 'TurnChange',
            player: turnPlayer.id,
            isFirst: (this.turn - 1) % 2 === 0,
          },
        })
      );
      await new Promise(resolve => setTimeout(resolve, 500)); // サンドボックスでは短縮

      const max =
        this.room.rule.system.cp.init +
        this.room.rule.system.cp.increase * (this.round - 1) +
        (this.room.rule.system.handicap.cp && this.round === 1 && this.turn === 2 ? 1 : 0);

      turnPlayer.cp = {
        current: Math.min(
          max + (this.room.rule.system.cp.carryover ? turnPlayer.cp.current : 0),
          this.room.rule.system.cp.ceil,
          this.room.rule.system.cp.max
        ),
        max: Math.min(max, this.room.rule.system.cp.ceil, this.room.rule.system.cp.max),
      };
      this.room.soundEffect('cp-increase');

      // ドロー
      if (!(this.turn === 1 && this.room.rule.system.handicap.draw)) {
        [...Array(this.room.rule.system.draw.top)].forEach(() => {
          if (turnPlayer.hand.length < this.room.rule.player.max.hand) turnPlayer.draw();
        });
        this.room.soundEffect('draw');
      }

      turnPlayer.field.forEach(unit => {
        if (!unit.hasKeyword('呪縛') && !unit.active) {
          unit.active = true;
          this.room.soundEffect('reboot');
        }
        unit.isBooted = false;
      });
    }

    // 行動制限を解除する
    this.getTurnPlayer().field.forEach(
      unit =>
        (unit.delta = unit.delta.filter(
          delta => !(delta.effect.type === 'keyword' && delta.effect.name === '行動制限')
        ))
    );

    this.room.sync();

    // ターン開始スタックを積み、解決する
    this.histories = [];
    this.stack.push(
      new Stack({
        type: 'turnStart',
        source: this.getTurnPlayer(),
        core: this,
      })
    );
    await this.resolveStack();

    // 狂戦士 アタックさせる
    for (const unit of this.getTurnPlayer().field.filter(
      unit =>
        unit.hasKeyword('狂戦士') &&
        !unit.hasKeyword('攻撃禁止') &&
        !unit.hasKeyword('行動制限') &&
        unit.active
    )) {
      await this.attack(unit);
    }

    // defrost
    this.room.broadcastToPlayer(this.getTurnPlayer().id, MessageHelper.defrost());
  }

  /**
   * ターンプレイヤーを取得
   * プレイヤーが1人の場合はそのプレイヤーを返す
   */
  getTurnPlayer(): Player {
    if (this.players.length === 1) {
      const player = this.players[0];
      if (!player) throw new Error('[Sandbox] No player found');
      return player;
    }
    return super.getTurnPlayer();
  }
}
