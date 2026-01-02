import { Card } from './Card';
import type { Player } from '../Player';
import catalog from '@/database/catalog';

export class Joker extends Card {
  chara: string;
  cost: number;

  constructor(owner: Player, catalogId: string) {
    super(owner, catalogId);

    // Load from catalog
    const catalogEntry = catalog.get(catalogId);
    if (!catalogEntry || catalogEntry.type !== 'joker') {
      throw new Error(`Invalid joker catalogId: ${catalogId}`);
    }

    this.chara = catalogEntry.name; // JOKERカード名（例："THE HERMIT"）
    this.cost = catalogEntry.cost;
  }

  /**
   * Dynamic property: checks if this joker is available to use
   * Depends on player's gauge and checkJoker conditions
   */
  get isAvailable(): boolean {
    const player = this.owner;
    const core = player.core;

    const hasEnoughGauge = player.joker.gauge >= this.cost;
    const meetsConditions = this.catalog.checkJoker?.(player, core) ?? true;

    return hasEnoughGauge && meetsConditions;
  }

  clone(owner: Player): Joker {
    const joker = new Joker(owner, this.catalogId);
    joker.lv = this.lv;
    joker.delta = [...this.delta];
    joker.generation = this.generation;
    return joker;
  }
}
