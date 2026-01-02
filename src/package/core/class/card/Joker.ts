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

    // このターンに使用済みならば呼び出し不可
    const hasActivatedJoker = core.histories.find(
      history => history.action === 'drive' && history.card.catalog.type === 'joker'
    );

    const hasEnoughCp = player.cp.current >= this.cost;
    const meetsConditions = this.catalog.checkJoker?.(player, core) ?? false;

    return hasEnoughCp && meetsConditions && !hasActivatedJoker;
  }

  clone(): never {
    throw new Error('Joker.clone() メソッドを呼び出すことは出来ません');
  }
}
