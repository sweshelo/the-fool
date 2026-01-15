import { createMessage, type Message } from '@/submodule/suit/types/message/message';
import type { PlayerReconnectedPayload } from '@/submodule/suit/types/message/payload/client';
import { Player } from '../../core/class/Player';
import { Core } from '../../core';
import { Joker } from '../../core/class/card/Joker';
import catalog from '@/database/catalog';
import type { ServerWebSocket } from 'bun';
import type { Rule } from '@/submodule/suit/types';
import { config } from '@/config';
import { MessageHelper } from '@/package/core/helpers/message';
import { Intercept } from '@/package/core/class/card';

export class Room {
  id = Math.floor(Math.random() * 99999)
    .toString()
    .padStart(5, '0');
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

        // 再接続通知を他のプレイヤーに送信
        const reconnectPayload: PlayerReconnectedPayload = {
          type: 'PlayerReconnected',
          reconnectedPlayerId: exists.id,
          timestamp: Date.now(),
        };

        this.broadcastToAllExcept(
          {
            action: { handler: 'client', type: 'reconnected' },
            payload: reconnectPayload,
          },
          exists.id
        );

        // 再接続で自分のターン中の場合は defrost する
        if (this.core.getTurnPlayer().id === message.payload.player.id) {
          this.broadcastToPlayer(message.payload.player.id, MessageHelper.defrost());
        }
      } else if (this.core.players.length < 2) {
        const player = new Player(message.payload.player, this.core);

        // Initialize jokers from owned JOKER card names
        if (message.payload.jokersOwned) {
          const ownedJokerAbilities: string[] = [];
          message.payload.jokersOwned.forEach(jokerCardName => {
            catalog.forEach(entry => {
              if (entry.type === 'joker' && entry.id === jokerCardName) {
                ownedJokerAbilities.push(entry.id);
              }
            });
          });

          player.joker.card = ownedJokerAbilities.map(catalogId => new Joker(player, catalogId));
        }

        // socket 登録
        this.clients.set(player.id, socket);
        this.core.entry(player);
        this.players.set(player.id, player);
      }
      this.sync(true);
      return true;
    } else {
      return false;
    }
  }

  // ゲーム開始
  start() {
    // oxlint-disable-next-line no-floating-promises
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

  /**
   * 特定のプレイヤーを除く全員にメッセージを送信する
   * @param message 送信するメッセージ
   * @param excludePlayerId 除外するプレイヤーID
   */
  broadcastToAllExcept(message: Message, excludePlayerId: string) {
    this.clients.forEach((client, playerId) => {
      if (playerId !== excludePlayerId && client.readyState === 1) {
        // 1 = WebSocket.OPEN
        client.send(JSON.stringify(message));
      }
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
  sync = (force: boolean = false) => {
    // Colorマッピング
    const colorMap: { [key: number]: 'red' | 'yellow' | 'blue' | 'green' | 'purple' | 'none' } = {
      1: 'red',
      2: 'yellow',
      3: 'blue',
      4: 'green',
      5: 'purple',
      6: 'none',
    };

    // sync メソッド内またはクラスメソッドとして追加
    const serializeJokerState = (player: Player) => ({
      card: player.joker.card.map(joker => ({
        id: joker.id,
        catalogId: joker.catalogId,
        chara: joker.chara,
        cost: joker.cost,
        isAvailable: joker.isAvailable,
        lv: joker.lv,
      })),
      gauge: player.joker.gauge,
    });

    // すべてのプレイヤーの状態をまとめてハッシュ化し、キャッシュと比較
    const playersState: { [key: string]: Player | object } = {};
    this.core.players.forEach(player => {
      playersState[player.id] = {
        ...player,
        joker: serializeJokerState(player),
        deck: player.deck.map(card => ({ id: card.id })),
        hand: player.hand.map(card => ({ id: card.id })),
        trigger: player.trigger.map(card => ({
          id: card.id,
          color: colorMap[card.catalog.color] ?? 'none',
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

    if (this.cache === currentHash && !force) {
      // 状態が変わっていなければ通信をスキップ
      return;
    }

    // 状態が変わった場合のみ通信
    this.clients.forEach((client, playerId) => {
      const players = this.core.players.reduce(
        (acc: { [key: string]: Player | object }, player) => {
          if (player.id === playerId) {
            // 自分: デッキはIDのみ
            acc[player.id] = {
              ...player,
              deck:
                this.rule.debug?.enable && this.rule.debug.reveal.self.deck
                  ? player.deck
                  : player.deck.map(card => ({ id: card.id })),
            };
          } else {
            // 相手: デッキ・手札はIDのみ、トリガーはID+color
            acc[player.id] = {
              ...player,
              deck:
                this.rule.debug?.enable && this.rule.debug.reveal.opponent.deck
                  ? player.deck
                  : player.deck.map(card => ({ id: card.id })),
              hand:
                this.rule.debug?.enable && this.rule.debug.reveal.opponent.hand
                  ? player.hand
                  : player.hand.map(card => ({ id: card.id })),
              trigger:
                this.rule.debug?.enable && this.rule.debug.reveal.opponent.trigger
                  ? player.trigger
                  : // Interceptが revealed (= 複数回使用可能で、既に使用済み) であれば公開する
                    player.trigger.map(card =>
                      card instanceof Intercept && card.revealed
                        ? card
                        : {
                            id: card.id,
                            color: colorMap[card.catalog.color] ?? 'none',
                          }
                    ),
            };
          }

          // joker : isAvailable を取得して渡す
          acc[player.id] = {
            ...acc[player.id],
            joker: serializeJokerState(player),
          };

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
