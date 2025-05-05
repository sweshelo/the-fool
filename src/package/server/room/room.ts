import { createMessage, type Message } from '@/submodule/suit/types/message/message';
import { Player } from '../../core/class/Player';
import { Core } from '../../core/core';
import type { ServerWebSocket } from 'bun';
import type { Rule } from '@/submodule/suit/types';
import { config } from '@/config';

export class Room {
  id = crypto.randomUUID();
  name: string;
  core: Core;
  players: Map<string, Player> = new Map<string, Player>();
  clients: Map<string, ServerWebSocket> = new Map<string, ServerWebSocket>();
  rule: Rule = { ...config.game }; // デフォルトのルールをコピー
  cache: string | undefined;

  constructor(name: string, rule?: Rule) {
    this.core = new Core(this);
    this.name = name;
    this.cache = undefined;
    if (rule) this.rule = rule;
  }

  // メッセージを処理
  handleMessage(socket: ServerWebSocket, message: Message) {
    console.log('handling message on Room: %s', message.action.type);
    switch (message.action.type) {
      case 'join':
        this.join(socket, message);
    }
  }

  // プレイヤー参加処理
  join(socket: ServerWebSocket, message: Message) {
    if (message.payload.type === 'PlayerEntry') {
      // 再接続チェック
      const exists = this.players.get(message.payload.player.id);

      if (exists) {
        // clients再登録
        this.clients.delete(exists.id);
        this.clients.set(exists.id, socket);
      } else if (this.core.players.length < 2) {
        const player = new Player(message.payload.player, this.core);
        // socket 登録
        this.clients.set(player.id, socket);
        this.core.entry(player);
        this.players.set(player.id, player);
      }
      this.sync();
      return true;
    } else {
      return false;
    }
  }

  // ゲーム開始
  start() {
    this.core.start();
  }

  /**
   * 特定のプレイヤーにメッセージを送信する
   * @param playerId 送信先プレイヤーID
   * @param payload 送信するペイロード
   */
  broadcastToPlayer(playerId: string, message: Message) {
    const client = this.clients.get(playerId);
    if (client) {
      client.send(JSON.stringify(message));
    } else {
      console.warn(`Failed to broadcast to player ${playerId}: Player not found`);
    }
  }

  /**
   * 全プレイヤーにメッセージを送信する
   * @param payload 送信するペイロード
   */
  broadcastToAll(message: Message) {
    this.clients.forEach(client => {
      client.send(JSON.stringify(message));
    });
  }

  // SEイベントを送信
  soundEffect(soundId: string, playerId?: string) {
    const message = createMessage({
      action: {
        type: 'effect',
        handler: 'client',
      },
      payload: {
        type: 'SoundEffect',
        soundId: soundId,
      },
    });

    if (playerId) {
      this.broadcastToPlayer(playerId, message);
    } else {
      this.broadcastToAll(message);
    }
  }

  // 現在のステータスを全て送信
  sync = () => {
    // Colorマッピング
    const colorMap: { [key: number]: 'red' | 'yellow' | 'blue' | 'green' | 'purple' | 'none' } = {
      1: 'red',
      2: 'yellow',
      3: 'blue',
      4: 'green',
      5: 'purple',
      6: 'none',
    };

    // すべてのプレイヤーの状態をまとめてハッシュ化し、キャッシュと比較
    const playersState: { [key: string]: Player | object } = {};
    this.core.players.forEach(player => {
      playersState[player.id] = {
        ...player,
        deck: player.deck.map(card => ({ id: card.id })),
        hand: player.hand.map(card => ({ id: card.id })),
        trigger: player.trigger.map(card => ({
          id: card.id,
          color: colorMap[card.catalog.color as number] ?? 'none',
        })),
      };
    });
    const syncState = JSON.stringify({
      rule: this.rule,
      game: {
        round: this.core.round,
        turn: this.core.turn,
      },
      players: playersState,
    });

    // 簡易ハッシュ関数
    function simpleHash(str: string): string {
      let hash = 0,
        i,
        chr;
      if (str.length === 0) return hash.toString();
      for (i = 0; i < str.length; i++) {
        chr = str.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0; // Convert to 32bit integer
      }
      return hash.toString();
    }

    const currentHash = simpleHash(syncState);

    if (this.cache === currentHash) {
      // 状態が変わっていなければ通信をスキップ
      console.log('sync skipped (no state change)');
      return;
    }

    // 状態が変わった場合のみ通信
    this.clients.forEach((client, playerId) => {
      const players = this.core.players.reduce(
        (acc: { [key: string]: Player | object }, player) => {
          if (player.id === playerId) {
            // 自分: 全情報
            acc[player.id] = player;
          } else {
            // 相手: デッキ・手札はIDのみ、トリガーはID+color
            acc[player.id] = {
              ...player,
              deck: player.deck.map(card => ({ id: card.id })),
              hand: player.hand.map(card => ({ id: card.id })),
              trigger: player.trigger.map(card => ({
                id: card.id,
                color: colorMap[card.catalog.color as number] ?? 'none',
              })),
            };
          }
          return acc;
        },
        {}
      );

      const data = JSON.stringify({
        action: {
          type: 'sync',
          handler: 'client',
        },
        payload: {
          type: 'Sync',
          body: {
            rule: this.rule,
            game: {
              round: this.core.round,
              turn: this.core.turn,
            },
            players,
          },
        },
      });
      client.send(data);
    });

    // 通信した場合はキャッシュを更新
    this.cache = currentHash;
  };
}
