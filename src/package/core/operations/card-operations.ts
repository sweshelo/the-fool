import type { Player } from '../class/Player';
import type { Unit, Card } from '../class/card';
import type { Core } from '../index';
import { Stack } from '../class/stack';
import { Delta } from '../class/delta';
import { Effect, System } from '@/game-data/effects';
import { resolveStack } from './stack-resolver';

/**
 * ユニットを召喚する
 * @param core Coreインスタンス
 * @param player 召喚するフィールドを持つプレイヤー
 * @param card 対象のカード
 * @param source (進化の場合)進化元
 */
export async function drive(
  core: Core,
  player: Player,
  card: Unit,
  source: Unit | undefined = undefined
) {
  if (source !== undefined) {
    // 進化元が存在していたindexに進化先を配置する
    const index = player.field.findIndex(unit => unit.id === source?.id);
    if (index === -1) throw new Error('進化元が見つかりませんでした');

    // 進化元の行動権を継承
    card.active = source.active;
    player.field[index] = card;

    card.delta = [];

    if (!source.isCopy) {
      player.trash.push(source);
      source.reset();
    }
  } else {
    card.active = true;
    player.field.push(card);
    card.delta = [new Delta({ type: 'keyword', name: '行動制限' })];
  }

  card.initBP();
  core.room.soundEffect(source !== undefined ? 'evolve' : 'drive');
  core.room.sync();

  // 起動アイコン
  if (typeof card.catalog.onBootSelf === 'function')
    card.delta.unshift(new Delta({ type: 'keyword', name: '起動' }));

  // 履歴追加
  core.histories.push({
    card: card,
    action: 'drive',
    generation: card.generation,
  });

  /* Stack追加 */
  // フィールド効果チェック用のStackを発行
  // 解決は resolveStack() にて、召喚後に実施される
  const stackForResolveFieldEffectUnmount = new Stack({
    type: '_preDrive',
    source: player,
    target: undefined,
    core: core,
  });

  // 召喚
  const driveStack = new Stack({
    type: 'drive',
    source: player,
    target: card,
    core: core,
  });

  // Lv3起動 - Lv3を維持&未OC&フィールドに残留している
  if (card.lv === 3) {
    core.stack.push(
      new Stack({
        type: 'overclock',
        source: card,
        target: card,
        core: core,
      })
    );
  }

  // フィールド効果の終了に伴う破壊のチェックを実施
  if (source) fieldEffectUnmount(core, source, stackForResolveFieldEffectUnmount);
  core.room.sync();

  // CIP後の最初の割り込みとしてフィールド終了に伴う破壊スタックの解決のため、childrenに予めPush
  driveStack.children.push(stackForResolveFieldEffectUnmount);

  // coreのスタックに積む
  core.stack.push(driveStack);

  core.room.visualEffect({
    effect: 'drive',
    image: `https://coj.sega.jp/player/img/${card.catalog.img}`,
    player: player.id,
    type: card.catalog.type === 'unit' ? 'UNIT' : 'EVOLVE',
  });

  // wait
  await System.sleep(1500);

  // スタックの解決処理を開始
  await resolveStack(core);
}

/**
 * フィールド効果を掃除する
 * フィールドを離れるカードに起因する効果を取り除く
 * @param core Coreインスタンス
 * @param target 対象のユニット
 * @param stack 処理用のスタック
 */
export function fieldEffectUnmount(core: Core, target: Unit, stack?: Stack) {
  const unmount = (card: Card) =>
    // delta.event に 値が設定されていれば、それは source.unit によるフィールド効果ではないとみなす
    (card.delta = card.delta.filter(delta => delta.event || delta.source?.unit !== target.id));

  // フィールド
  core.players
    .flatMap(player => player.field)
    .forEach(unit => {
      unmount(unit);
      if (unit.currentBP <= 0 && !unit.leaving) {
        if (stack) {
          Effect.break(stack, unit, unit, 'system'); // システムによってユニットが自壊した扱いにする
        } else {
          // フィールドエフェクトの終了による破壊を処理させるため、Core.stackに新しいStackを積み直す
          const stack = new Stack({ type: '_fieldEffectUnmounting', source: target, core });
          core.stack.push(stack);
          Effect.break(stack, unit, unit, 'system');
        }
      }
    });

  // 非フィールド
  [
    ...core.players.flatMap(player => player.hand),
    ...core.players.flatMap(player => player.trigger),
  ].forEach(unmount);
}
