import { config } from "../../../config"
import type { Action } from "./action"
import type { Atom } from "./card/Atom"
import type { Card } from "./card/Card"
import { Unit } from "./card/Unit"

export interface PlayerAction {
  action: Action
  stack?: unknown
}

export interface FindResult {
  result: boolean
  card?: Card
  place?: {
    name: string
    ref: Array<Card>
  }
}

export class Player {
  id: string
  name: string
  deck: Card[]
  hand: Card[]
  field: Card[]

  constructor(id: string, name: string, deck: Card[]) {
    this.id = id
    this.name = name
    this.deck = deck;
    this.hand = []
    this.field = []
  }

  // プレイヤー領域からカードを探す
  find(target: Card): FindResult {
    const onDeck = this.deck.find(({ id }) => id === target.id)
    if (onDeck) return ({
      result: true,
      card: onDeck,
      place: {
        name: 'deck',
        ref: this.deck
      }
    })

    const onHand = this.hand.find(({ id }) => id === target.id)
    if (onHand) return ({
      result: true,
      card: onHand,
      place: {
        name: 'hand',
        ref: this.hand
      }
    })

    // 本当に必要?
    const onField = this.field.find(({ id }) => id === target.id)
    if (onField) return ({
      result: true,
      card: onField,
      place: {
        name: 'field',
        ref: this.field
      }
    })

    return { result: false }
  }

  // カードを引く
  draw(): PlayerAction | null {
    if (this.deck.length > 0) {
      const source = this.deck.pop() as Card
      this.hand.push(source!)
      return {
        action: {
          role: 'system',
          type: 'draw',
          source: source,
        }
      }
    } else {
      return null
    }
  }

  // ドライブ
  drive(target: Unit) {
    if (this.field.length < config.game.player.max.field) {
      this.field.push(target);
      return {
        action: {
          role: 'user',
          type: 'drive',
          source: target
        }
      }
    } else {
      return null
    }
  }
}