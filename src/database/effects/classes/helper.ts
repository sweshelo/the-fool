import { Card, Unit } from '@/package/core/class/card';
import { Player } from '@/package/core/class/Player';
import type { Core } from '@/package/core/core';
import { System } from './system';
import type { Stack } from '@/package/core/class/stack';
import type { Choices } from '@/submodule/suit/types/game/system';

export class EffectHelper {
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

  /**
   * 【セレクトハック】や【加護】を持つユニットを考慮して、プレイヤー向けにユニットの選択肢を生成する
   * @param filter 独自のフィルタ関数
   * @param selector 選択肢を提供するプレイヤー
   * @returns 選択可能なユニット
   */
  static candidate(core: Core, filter: (unit: Unit) => boolean, selector: Player): Unit[] {
    const exceptBlessing = (unit: Unit) => !unit.hasKeyword('加護');
    const units = core.players
      .map(p => p.field)
      .flat()
      .filter(exceptBlessing)
      .filter(filter);

    // セレクトハック持ちがいたらそれだけ返す
    return units.some(unit => unit.hasKeyword('セレクトハック') && unit.owner.id !== selector.id)
      ? units.filter(unit => unit.hasKeyword('セレクトハック'))
      : units;
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

  static async selectUnit(
    stack: Stack,
    player: Player,
    targets: Unit[],
    title: string,
    count: number = 1
  ): Promise<[Unit, ...Unit[]]> {
    const selected: Unit[] = [];
    let candidate: Unit[] = EffectHelper.candidate(
      stack.core,
      unit => targets.map(unit => unit.id).includes(unit.id),
      player
    );

    while (selected.length < count && candidate.length > 0) {
      const [choiceId] = await System.prompt(stack, player.id, {
        title,
        type: 'unit',
        items: candidate,
      });

      const chosen = targets.find(unit => unit.id === choiceId) ?? candidate[0];
      if (!chosen) throw new Error('対象のユニットが存在しません');

      selected.push(chosen);
      candidate = EffectHelper.candidate(
        stack.core,
        unit => targets.some(t => t.id === unit.id) && !selected.some(s => s.id === unit.id),
        player
      );
    }

    if (selected.length > 0) return selected as [Unit, ...Unit[]];
    throw new Error('選択すべきユニットが見つかりませんでした');
  }

  static async selectCard(
    stack: Stack,
    player: Player,
    targets: Card[],
    title: string,
    count: number = 1
  ): Promise<[Card, ...Card[]]> {
    const choices: Choices = {
      title,
      type: 'card',
      items: targets,
      count,
    };
    const response = await System.prompt(stack, player.id, choices);
    const result = targets.filter(card => response.includes(card.id));

    if (result.length > 0) return result as [Card, ...Card[]];
    throw new Error('選択すべきカードが見つかりませんでした');
  }
}
