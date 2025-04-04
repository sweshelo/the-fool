import type { ICard } from '@/submodule/suit/types/game/card'
import { Atom } from './Atom'

export abstract class Card extends Atom implements ICard {
  catalogId: string
  lv: number = 1

  constructor(catalogId: string) {
    super()
    this.catalogId = catalogId
  }
}
