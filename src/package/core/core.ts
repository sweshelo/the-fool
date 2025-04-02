import type { Message } from "@/submodule/suit/types/message/message";
import type { Player } from "./class/Player";
import { config } from "../../config";
import type { DebugDrawPayload, IAtom, OverridePayload, UnitDrivePayload } from "@/submodule/suit/types";
import type { Room } from "../server/room/room";
import catalog from "@/submodule/suit/catalog/catalog";
import type { Unit } from "./class/card";
import { isUnit as checkIsUnit } from "@/helper";
import { Stack } from "./class/stack";

export class Core {
  id: string;
  players: Player[];
  round: number = 0;
  turn: number = 0;
  room: Room;
  stack: Stack | undefined = undefined;

  constructor(room: Room) {
    this.id = crypto.randomUUID()
    this.players = [];
    this.room = room
  }

  entry(player: Player) {
    // 同じIDのプレイヤーが既に存在するか確認
    const existingPlayerIndex = this.players.findIndex(p => p.id === player.id);
    if (existingPlayerIndex >= 0) {
      console.log(`Player with ID ${player.id} already exists. Replacing.`);
      // 既存のプレイヤーを削除
      this.players.splice(existingPlayerIndex, 1);
    }
    // 新しいプレイヤーを追加
    this.players.push(player);
    console.log('Player added:', player.id);
  }

  async start() {
    for (this.round = 1; this.round <= config.game.system.round; this.round++) {
      console.log(`Round ${this.round}`);
      console.log(
        'Players:',
        this.players.map((p) => p.id),
      );

      for await (const player of this.players) {
        this.turn++;
        // TODO: ターン開始処理
        // ...
        console.log(player.draw());

        // TODO: ターン終了処理
        // ...
      }
    }
  }

  handleMessage(message: Message) {
    console.log('passed message to Core : type<%s>', message.action.type)
    switch (message.payload.type) {
      case 'DebugDraw': {
        const payload: DebugDrawPayload = message.payload
        const target = this.players.find(player => player.id === payload.player)
        if (target) {
          target.draw()
          this.room.sync()
        }
        break;
      }
      case 'Override': {
        const payload: OverridePayload = message.payload
        // オーバーライド要件を満たしているかチェックする
        const player = this.players.find(p => p.id === payload.player)
        const parent = player?.find({ ...payload.parent } satisfies IAtom)
        const target = player?.find({ ...payload.target } satisfies IAtom)

        if (!parent?.card || !target?.card || !player) return;

        // 2つのカードがどちらも手札の中にある
        const isOnHand = parent.place?.name === 'hand' && target?.place?.name === 'hand'

        // 2つのカードが同じである
        // TODO: strictModeな設定を作り、同名判定を厳密にするモードを用意する
        const isSameCard = catalog.get(parent.card.catalogId)?.name === catalog.get(target.card.catalogId)?.name

        // 受け皿がLv3未満
        const isUnderLv3 = parent?.card?.lv < 3

        if (isOnHand && isSameCard && isUnderLv3) {
          player.hand = player?.hand.filter(card => card.id !== target.card?.id)
          parent.card.lv++
          player.trash.unshift(target.card)
          player.draw()
          this.room.sync()
        }
        break;
      }
      case 'UnitDrive': {
        const payload: UnitDrivePayload = message.payload
        const player = this.players.find(p => p.id === payload.player)
        const { card } = player?.find({ ...payload.target } satisfies IAtom) ?? {}
        if (!card || !player) return;

        const cardCatalog = catalog.get(card.catalogId)
        if (!cardCatalog) throw new Error('カタログに存在しないカードが指定されました')

        // CPが足りている
        const isEnoughCP = cardCatalog.cost <= player.cp.current || true // debug用

        // フィールドのユニット数が規定未満
        const isEnoughField = player.field.length < this.room.rule.player.max.field

        // ユニットである
        const isUnit = checkIsUnit(card)

        if (isEnoughCP && isEnoughField && isUnit) {
          player.hand = player?.hand.filter(c => c.id !== card?.id)
          player.field.unshift(card)
          this.room.sync()

          // Stack追加
          this.stack = new Stack({
            type: 'drive',
            source: card,
          })
        }
        break;
      }
    }
  }
}
