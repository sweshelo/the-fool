import type { Player } from '@/package/core/class/Player';
import type { Stack } from '@/package/core/class/stack';
import type { Core } from '@/package/core/core';
import type { Choices } from '@/submodule/suit/types/game/system';
import { System } from './system';
import { EffectHelper } from './helper';
import { Effect } from './effect';
import { Unit } from '@/package/core/class/card';
import type { StackWithCard } from './types';
import { Delta } from '@/package/core/class/delta';

interface ReinforcementMatcher {
  color?: number;
  species?: string;
  type?: ('unit' | 'advanced_unit' | 'intercept' | 'trigger')[];
}

export class EffectTemplate {
  static draw(player: Player, core: Core): void {
    // 手札が上限に達している場合は何もしない
    if (player.hand.length >= core.room.rule.player.max.hand) return;

    player.draw();
    core.room.soundEffect('draw');
    return;
  }

  /**
   * [リバイブ]効果
   * @param count 回収する枚数
   */
  static async revive(stack: StackWithCard, count: number = 1): Promise<void> {
    // 召喚者特定
    const driver = stack.processing.owner;

    if (!driver) return;

    // 召喚者に対して ChoisePayload を送信
    const choices: Choices = {
      title: '手札に加えるカードを選択してください',
      type: 'card',
      items: driver?.trash ?? [],
      count,
    };
    const [response] = await System.prompt(stack, driver.id, choices);
    console.log('response', response);

    // 召喚者の手札が上限に達している場合は何もしない
    if (driver?.hand === undefined || driver?.hand?.length >= stack.core.room.rule.player.max.hand)
      return;

    const target = driver.trash.find(c => c.id === response);
    console.log('target', target);

    // targetを引き抜き、手札に加える
    if (target && stack.processing) {
      Effect.move(stack, stack.processing, target, 'hand');
    }
    return;
  }

  /**
   * [援軍]効果
   * @param player ドローするプレイヤー
   * @param match サーチする条件
   * @returns void
   */
  static reinforcements(stack: Stack, player: Player, match: ReinforcementMatcher): boolean {
    // 召喚者の手札が上限に達している場合は何もしない
    if (player.hand === undefined || player.hand.length >= stack.core.room.rule.player.max.hand)
      return false;

    // 召喚者のデッキから条件に合致するカードを探す
    const target = player.deck.find(c => {
      // 色の一致
      const colorMatch = match.color ? c.catalog.color === match.color : true;
      // 種族の一致
      const speciesMatch = match.species ? c.catalog.species?.includes(match.species) : true;
      // タイプの一致
      const typeMatch = match.type ? match.type.includes(c.catalog.type) : true;

      return colorMatch && speciesMatch && typeMatch;
    });

    // targetを引き抜き、手札に加える
    if (target && stack.processing) {
      Effect.move(stack, stack.processing, target, 'hand');
      return true;
    }

    return false;
  }

  static async reincarnate(stack: Stack, unit: Unit) {
    const hasFieldSpace = unit.owner.field.length <= 4;
    const targets = unit.owner.deck.filter(card => {
      return (
        card.catalog.species?.includes('武身') &&
        card.catalog.cost >= unit.catalog.cost &&
        card.catalog.cost <= unit.catalog.cost + 1
      );
    });
    const [target] = EffectHelper.random(targets);

    if (hasFieldSpace && targets.length > 0 && target instanceof Unit) {
      await System.show(
        stack,
        '武身転生',
        `コスト${unit.catalog.cost}以上${unit.catalog.cost + 1}以下の【武身】を【特殊召喚】\n自身をデッキに戻す`
      );
      await Effect.summon(stack, unit, target);
      await new Promise(resolve => setTimeout(resolve, 500));
      Effect.bounce(stack, unit, unit, 'deck');
    }
  }

  static virusInjectable(player: Player) {
    return player.field.filter(unit => !unit.catalog.species?.includes('ウィルス')).length < 5;
  }

  static async virusInject(stack: StackWithCard, player: Player, virus: string) {
    // ウィルスを除くユニット数が5体未満
    if (EffectTemplate.virusInjectable(player)) {
      // ウィルスを除外する
      if (player.field.some(unit => unit.catalog.species?.includes('ウィルス'))) {
        player.field = player.field.filter(unit => !unit.catalog.species?.includes('ウィルス'));
        stack.core.room.soundEffect('leave');
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // ウィルスを生成して特殊召喚
      const virusUnit = new Unit(player, virus);
      await Effect.summon(stack, stack.processing, virusUnit);
      virusUnit.delta.push(
        new Delta({ type: 'life' }, { event: 'turnEnd', count: 2, onlyForOwnersTurn: true })
      );
      Effect.keyword(stack, virusUnit, virusUnit, '攻撃禁止');
      Effect.keyword(stack, virusUnit, virusUnit, '防御禁止');
    }
  }
}
