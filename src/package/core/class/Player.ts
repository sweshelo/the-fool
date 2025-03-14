import type { Action } from "./action"
import type { Atom } from "./card/Atom"
import type { Card } from "./card/Card"
import { Unit } from "./card/Unit"

export interface PlayerAction {
  action: Action
  stack?: unknown
}

export class Player {
  id: string
  deck: Card[]
  hand: Card[]
  field: Card[]

  constructor(deck: Card[]) {
    this.id = crypto.randomUUID()
    this.deck = deck;
    this.hand = []
    this.field = []
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
}