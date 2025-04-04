import type { IUnit } from '@/submodule/suit/types/game/card'
import { Card } from './Card'

export class Unit extends Card implements IUnit {
  bp: number

  constructor(catalogId: string) {
    super(catalogId)
    this.bp = 1000
  }
}
