import type { Unit } from '@/package/core/class/card';
import { Player } from '@/package/core/class/Player';
import type { Core } from '@/package/core/core';
import type { IAtom } from '@/submodule/suit/types';

export class EffectHelper {
  /**
   * @deprecated Card.owner を使用して下さい
   */
  static owner(core: Core, card: IAtom | undefined): Player {
    if (!card) throw new Error('所有者を特定したいカードが渡されませんでした');

    const result = core.players.find(player => player.find(card).result);
    if (result === undefined) throw new Error('存在しないカードが選択されました');

    return result;
  }

  /**
   * @deprecated Player.opponent を使用して下さい
   */
  static opponent(core: Core, card: IAtom): Player {
    const owner = this.owner(core, card);
    const opponent = core.players.find(p => p.id !== owner.id);

    if (opponent) {
      return opponent;
    } else {
      throw new Error('対戦相手が存在しません');
    }
  }

  /**
   * 『自身以外に』の効果を実行する
   * @param effect 実行する効果
   */
  static exceptSelf(core: Core, card: Unit, effect: (unit: Unit) => void): void {
    // 自身以外
    const units = core.players
      .map(p => p.field)
      .flat()
      .filter(u => u.id !== card.id);
    units.forEach(effect);
  }

  static candidate(core: Core, filter: (unit: Unit) => boolean): Unit[] {
    const exceptBlessing = (unit: Unit) => unit.hasKeyword('加護');
    return core.players
      .map(p => p.field)
      .flat()
      .filter(exceptBlessing)
      .filter(filter);
  }

  /**
   * 与えられた T型の配列から 重複しないnumber個のランダムに選択された要素を選択する
   * @param targets 要素を選択する配列（undefined要素は除外される）
   * @param number 選択する要素数（デフォルト: 1）
   */
  static random<T>(targets: T[], number = 1): T[] {
    if (!Array.isArray(targets) || targets.length === 0 || number <= 0) return [];

    // 必要な数だけ取得
    return this.shuffle(targets).slice(0, Math.min(number, targets.length));
  }

  /**
   * 対象をランダムにソートする
   */
  static shuffle<T>(targets: T[]): T[] {
    const out: (T | undefined)[] = Array.from(targets);
    for (let i = out.length - 1; i > 0; i--) {
      const r = Math.floor(Math.random() * (i + 1));
      const tmp = out[i];
      out[i] = out[r];
      out[r] = tmp;
    }

    return out.filter(e => e !== undefined);
  }
}
