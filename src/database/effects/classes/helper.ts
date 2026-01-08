import { Card, Unit } from '@/package/core/class/card';
import { Player } from '@/package/core/class/Player';
import type { Core } from '@/package/core/core';
import { System } from './system';
import type { Stack } from '@/package/core/class/stack';
import type { Choices } from '@/submodule/suit/types/game/system';
import { createMessage } from '@/submodule/suit/types';

type UnitPickFilter = ((unit: Unit) => boolean) | 'owns' | 'opponents' | 'all';

interface Choice {
  id: string;
  description: string;
  condition?: () => boolean;
}

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
   * @deprecated このメソッドは非推奨です。代わりに、EffectHelper.isUnitSelectable() を利用して下さい。
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

  /**
   * フィールド上に存在するユニットで構成された Unit[] から ユーザに1つを選ばせる
   * カードを選択する場合は selectCard を利用する
   * @param stack stack
   * @param player 対象を選択するプレイヤー
   * @param targets 対象の候補
   * @param title UIに表示するメッセージ
   * @param count 選択するユニット数
   * @returns Promise。 最低1つのUnitを含む Unit[] が得られる。
   * @deprecated このメソッドは非推奨です。代わりに、EffectHelper.pickUnit() を利用して下さい。
   */
  static async selectUnit(
    stack: Stack,
    player: Player,
    targets: Unit[],
    title: string,
    count: number = 1
  ): Promise<[Unit, ...Unit[]]> {
    const selected: Unit[] = [];
    const units = stack.core.players.flatMap(player => player.field);

    while (selected.length < count) {
      const candidate: Unit[] = targets.filter(
        unit => !unit.hasKeyword('加護') && !selected.includes(unit) && units.includes(unit)
      );
      const selectHacked = candidate.filter(
        unit => unit.hasKeyword('セレクトハック') && unit.owner.id !== player.id
      );
      if (candidate.length <= 0) break;

      const [choiceId] = await System.prompt(stack, player.id, {
        title,
        type: 'unit',
        items: selectHacked.length > 0 ? selectHacked : candidate,
      });

      const chosen = targets.find(unit => unit.id === choiceId) ?? candidate[0];
      if (!chosen) throw new Error('対象のユニットが存在しません');

      // クライアントにエフェクトを送信
      stack.core.room.broadcastToAll(
        createMessage({
          action: {
            type: 'effect',
            handler: 'client',
          },
          payload: {
            type: 'VisualEffect',
            body: {
              effect: 'select',
              unitId: chosen.id,
            },
          },
        })
      );

      selected.push(chosen);
    }

    if (selected.length > 0) return selected as [Unit, ...Unit[]];
    throw new Error('選択すべきユニットが見つかりませんでした');
  }

  /**
   * 与えられた Card[] で構成されたリストを提示し ユーザに1つを選ばせる
   * フィールド上のユニットを選択する場合は pickUnit を利用する
   * @param stack stack
   * @param player 対象を選択するプレイヤー
   * @param targets 対象の候補
   * @param title UIに表示するメッセージ
   * @param count 選択するユニット数
   * @returns Promise。 最低1つのCardを含む Card[] が得られる。
   */
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

  /**
   * 与えられたメソッドを繰り返す
   * @param times 回数
   * @param callback 繰り返す関数
   */
  static repeat(times: number, callback: () => unknown) {
    [...Array(times)].forEach(callback);
  }

  /**
   * 与えられた破壊スタックに対して、それが「効果による破壊」とみなされるかを判定する
   * @param stack
   */
  static isBreakByEffect(stack: Stack): boolean {
    if (stack.type !== 'break')
      throw new Error('isBreakByEffect: 破壊スタックではないスタックを渡されました');
    if (stack.option?.type !== 'break')
      throw new Error('isBreakByEffect: 破壊理由が格納されていないスタックを渡されました');

    const cause = stack.option.cause;
    const effectTable = ['damage', 'effect']; // 効果による破壊とみなす cause 一覧

    return effectTable.includes(cause);
  }

  static hasGauge(player: Player, gaugeKey: '小' | '中' | '大' | '特大'): boolean {
    switch (gaugeKey) {
      case '小':
        return player.joker.gauge > 40;
      case '中':
        return player.joker.gauge > 52.5;
      case '大':
        return player.joker.gauge > 65;
      case '特大':
        return player.joker.gauge > 80;
    }
  }

  /**
   * 対象プレイヤーのフィールドに【ウィルス】ユニットを【特殊召喚】可能であるかを調べる
   * @param player 調査対象のプレイヤー
   * @returns boolean
   */
  static isVirusInjectable(player: Player) {
    return player.field.filter(unit => !unit.catalog.species?.includes('ウィルス')).length < 5;
  }

  /**
   * 【加護】を持つユニットを考慮して、プレイヤーがユニットを選択できるかを調べる
   * @param filter 独自のフィルタ関数か 'owns' 'opponents' 'all' のキーワード
   * @param count 厳密にそのユニット数を選択する必要がある場合、選択するユニット数
   * @returns 選択可能であるか
   */
  static isUnitSelectable(
    core: Core,
    filter: UnitPickFilter,
    selector: Player,
    count: number = 1
  ): boolean {
    const exceptBlessing = (unit: Unit) => !unit.hasKeyword('加護');
    // フィルタ関数を取得
    const getFilterMethod = () => {
      switch (filter) {
        case 'owns':
          return (unit: Unit) => unit.owner.id === selector.id;
        case 'opponents':
          return (unit: Unit) => unit.owner.id !== selector.id;
        case 'all':
          return () => true;
      }
      return filter;
    };

    const candidate = core.players
      .map(p => p.field)
      .flat()
      .filter(exceptBlessing)
      .filter(getFilterMethod());

    return candidate.length >= count;
  }

  /**
   * フィールド上に存在するユニットを特定条件でフィルタし、【加護】【セレクトハック】を考慮したうえで ユーザに1つ以上を選ばせる
   * カードを選択する場合は selectCard を利用する
   * @param stack stack
   * @param player 対象を選択するプレイヤー
   * @param filter 自分のユニットのみの場合は 'owns'、敵ユニットのみの場合は 'oppents'、全ての場合は 'all'、カスタム条件の場合は対象の候補を絞り込むフィルター関数
   * @param title UIに表示するメッセージ
   * @param count 選択するユニット数
   * @returns Promise。 最低1つのUnitを含む Unit[] が得られる。
   */
  static async pickUnit(
    stack: Stack,
    player: Player,
    filter: UnitPickFilter,
    title: string,
    count: number = 1
  ): Promise<[Unit, ...Unit[]]> {
    const selected: Unit[] = [];

    // フィルタ関数を取得
    const getFilterMethod = () => {
      switch (filter) {
        case 'owns':
          return (unit: Unit) => unit.owner.id === player.id;
        case 'opponents':
          return (unit: Unit) => unit.owner.id !== player.id;
        case 'all':
          return () => true;
      }
      return filter;
    };

    while (selected.length < count) {
      // フィールド上から対象になりえるユニットを取得
      const candidate: Unit[] = stack.core.players
        .flatMap(player => player.field)
        .filter(unit => !selected.includes(unit) && !unit.hasKeyword('加護'))
        .filter(getFilterMethod());
      if (candidate.length <= 0) break;

      // 選択者と所有者が異なる、セレクトハックを持つユニットを取得
      const selectHacked: Unit[] = candidate.filter(
        unit => unit.owner.id !== player.id && unit.hasKeyword('セレクトハック')
      );

      const [choiceId] = await System.prompt(stack, player.id, {
        title,
        type: 'unit',
        items: selectHacked.length > 0 ? selectHacked : candidate,
      });

      const chosen = candidate.find(unit => unit.id === choiceId) ?? candidate[0];
      if (!chosen) throw new Error('対象のユニットが存在しません');

      // クライアントにエフェクトを送信
      stack.core.room.broadcastToAll(
        createMessage({
          action: {
            type: 'effect',
            handler: 'client',
          },
          payload: {
            type: 'VisualEffect',
            body: {
              effect: 'select',
              unitId: chosen.id,
            },
          },
        })
      );

      selected.push(chosen);
    }

    if (selected.length > 0) return selected as [Unit, ...Unit[]];
    throw new Error('選択すべきユニットが見つかりませんでした');
  }

  static async choice(
    stack: Stack,
    player: Player,
    title: string,
    choices: [Choice, Choice]
  ): Promise<Choice['id'] | undefined> {
    const availableChoices = choices.filter(choice => choice.condition?.() ?? true); // condition をチェックする。未指定ならば条件無しで呼び出し可
    switch (availableChoices.length) {
      case 0:
        return undefined;
      case 1:
        return availableChoices[0]?.id;
      default: {
        const [chosen] = await System.prompt(stack, player.id, {
          type: 'option',
          title,
          items: choices,
        });
        return chosen;
      }
    }
  }
}
