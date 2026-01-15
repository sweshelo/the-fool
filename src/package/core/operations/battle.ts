import { createMessage } from '@/submodule/suit/types/message/message';
import type { Unit } from '../class/card';
import type { Core } from '../index';
import { Stack } from '../class/stack';
import { Parry } from '../class/parry';
import { Effect } from '@/game-data/effects';
import { resolveStack } from './stack-resolver';
import { setEffectDisplayHandler } from './effect-handler';

/**
 * アタック
 * @param core Coreインスタンス
 * @param attacker 攻撃するユニット
 */
export async function attack(core: Core, attacker: Unit) {
  if (!attacker.owner.field.find(unit => unit.id === attacker.id)) return;

  core.room.broadcastToAll(
    createMessage({
      action: {
        type: 'effect',
        handler: 'client',
      },
      payload: {
        type: 'VisualEffect',
        body: {
          effect: 'attack',
          attackerId: attacker.id,
        },
      },
    })
  );
  core.room.soundEffect('decide');

  core.stack.push(
    new Stack({
      type: 'attack',
      source: attacker.owner,
      target: attacker,
      core: core,
    })
  );
  await resolveStack(core);

  // アタッカー生存チェック
  if (!attacker.owner.field.find(unit => unit.id === attacker.id)) return;

  let blocker: Unit | undefined = undefined;

  try {
    blocker = await block(core, attacker);

    // アタッカー/ブロッカー生存チェック
    if (
      !attacker.owner.field.find(unit => unit.id === attacker.id) ||
      (blocker && !blocker.owner.field.find(unit => unit.id === blocker?.id))
    ) {
      attacker.active = false;
      core.room.broadcastToAll(
        createMessage({
          action: {
            type: 'effect',
            handler: 'client',
          },
          payload: {
            type: 'VisualEffect',
            body: {
              effect: 'launch-cancel',
              attackerId: attacker.id,
            },
          },
        })
      );
      return;
    }

    if (blocker) {
      await preBattle(core, attacker, blocker);
      // アタッカー/ブロッカー生存チェック
      if (
        !attacker.owner.field.find(unit => unit.id === attacker.id) ||
        !blocker.owner.field.find(unit => unit.id === blocker?.id)
      ) {
        attacker.active = false;
        core.room.broadcastToAll(
          createMessage({
            action: {
              type: 'effect',
              handler: 'client',
            },
            payload: {
              type: 'VisualEffect',
              body: {
                effect: 'launch-cancel',
                attackerId: attacker.id,
              },
            },
          })
        );
        return;
      }
    }
  } catch (e) {
    if (e instanceof Parry) {
      console.log(`${e.card.catalog.name} によるパリィが行われました`);
    }
  }

  // NOTE: 生存確認処理を行い、attacker/blocker(非undefinedの場合)の両者が生存していれば以下が実行される
  core.room.broadcastToAll(
    createMessage({
      action: {
        type: 'effect',
        handler: 'client',
      },
      payload: {
        type: 'VisualEffect',
        body: {
          effect: 'launch',
          attackerId: attacker.id,
          blockerId: blocker?.id,
        },
      },
    })
  );

  attacker.active = false;
  core.room.sync();

  if (blocker) {
    await postBattle(core, attacker, blocker);
  } else {
    attacker.owner.opponent.damage();
    await new Promise(resolve => setTimeout(resolve, 1000));

    // プレイヤーアタックに成功
    core.stack.push(
      new Stack({
        type: 'playerAttack',
        target: attacker.owner.opponent,
        source: attacker,
        core: core,
      })
    );
    await resolveStack(core);
  }
}

/**
 * アタック後、ブロックして効果を解決する
 * @param core Coreインスタンス
 * @param attacker 攻撃するユニット
 */
export async function block(core: Core, attacker: Unit): Promise<Unit | undefined> {
  // プレイヤーを特定
  const attackerOwner = attacker.owner;
  const blockerOwner = core.players.find(player => player.id !== attackerOwner.id);

  if (!blockerOwner || !attackerOwner)
    throw new Error('存在しないプレイヤーまたはユニットが指定されました');

  // ブロック側ユニットのブロック可能ユニットを列挙
  const blockable = blockerOwner.field.filter((unit: Unit) => {
    // 次元干渉を発動している場合、指定コスト以上のユニットはブロックできない
    const blockableCost = attacker.hasKeyword('次元干渉')
      ? Math.min(
          ...attacker.delta
            .map(delta =>
              delta.effect.type === 'keyword' && delta.effect.name === '次元干渉'
                ? delta.effect.cost
                : undefined
            )
            .filter(v => v !== undefined)
        )
      : undefined;
    const isNumber = blockableCost !== undefined && Number.isInteger(blockableCost);

    return (
      unit.active &&
      !unit.hasKeyword('防御禁止') &&
      (isNumber ? unit.catalog.cost < blockableCost : true)
    );
  });

  const forceBlock = blockable.filter((unit: Unit) => {
    return unit.hasKeyword('強制防御');
  });

  // 強制防御を持つユニットがいない場合はそのまま素のcandidateを返却する
  const candidate = forceBlock.length > 0 ? forceBlock : blockable;

  // ブロックさせる
  const promptId = `${core.id}_block_${crypto.randomUUID()}`;
  if (candidate.length > 0) {
    core.room.broadcastToPlayer(
      blockerOwner.id,
      createMessage({
        action: {
          type: 'pause',
          handler: 'client',
        },
        payload: {
          type: 'Choices',
          promptId,
          player: blockerOwner.id,
          choices: {
            title: 'ブロックするユニットを選択してください',
            type: 'block',
            items: candidate,
            isCancelable: forceBlock.length === 0,
          },
        },
      })
    );
  }

  // クライアントからの応答を待つ
  const [blockerId] =
    candidate.length > 0
      ? await new Promise<string[]>(resolve => {
          setEffectDisplayHandler(core, promptId, (choice: string[] | undefined) => {
            resolve(choice ?? []);
          });
        })
      : [];

  // IDから対象を割り出し
  const blocker = blockerOwner.field.find(unit => unit.id === blockerId);

  core.room.soundEffect('decide');
  if (blocker) {
    core.room.broadcastToAll(
      createMessage({
        action: {
          handler: 'client',
          type: 'effect',
        },
        payload: {
          type: 'VisualEffect',
          body: {
            effect: 'block',
            blockerId: blocker.id,
          },
        },
      })
    );
  }
  await new Promise(resolve => setTimeout(resolve, 1000));

  if (blocker) {
    core.stack.push(
      new Stack({
        type: 'block',
        source: attacker,
        target: blocker,
        core: core,
      })
    );
    await resolveStack(core);
  }

  return blocker;
}

/**
 * 戦闘 前処理 - Stack解決
 * @param core Coreインスタンス
 * @param attacker 攻撃するユニット
 * @param blocker ブロックするユニット
 */
export async function preBattle(core: Core, attacker: Unit, blocker: Unit) {
  core.stack.push(
    new Stack({
      type: 'battle',
      source: attacker,
      target: blocker,
      core: core,
    })
  );
  console.log('戦闘Stack: %s vs %s', attacker.catalog.name, blocker.catalog.name);
  await resolveStack(core);
}

/**
 * 戦闘 後処理 - BP比較演算
 * @param core Coreインスタンス
 * @param attacker 攻撃するユニット
 * @param blocker ブロックするユニット
 */
export async function postBattle(core: Core, attacker: Unit, blocker: Unit) {
  // BP順にソートして暫定的に勝敗を決める
  // 実際の戦闘処理はこのあとのダメージを与え合う過程で行われ、
  // ダメージを与えあったあとの生存状況に応じて勝敗が確定する
  const [winner, loser] = [attacker, blocker].sort((a, b) => {
    // BPが異なる場合は大きい方を優先
    if (b.currentBP !== a.currentBP) {
      return b.currentBP - a.currentBP;
    }
    // BPが等しい場合、不滅キーワードを持っている方を優先
    if (a.hasKeyword('不滅') && !b.hasKeyword('不滅')) {
      return -1; // aを優先
    } else if (!a.hasKeyword('不滅') && b.hasKeyword('不滅')) {
      return 1; // bを優先
    }
    return 0; // どちらも不滅を持っているか、どちらも持っていない場合は等価
  });

  if (!winner || !loser) {
    throw new Error('ユニットの勝敗判定に失敗しました');
  }

  // システムスタック: Effect.damage() を呼ぶために生成している
  const stack = new Stack({
    type: '_postBattle',
    source: attacker,
    target: blocker,
    core: core,
  });

  // ダメージ量を確定する
  const [loserDamage, winnerDamage] = [winner.currentBP, loser.currentBP];

  // ダメージを与えるのは次の場合:
  // - 敗者が破壊されることが確定している: 敗者に【不滅】がない (-> 直接破壊する)
  // - 勝者が破壊されることが確定している: 勝者と敗者のBPが等しく、勝者に【不滅】がない (-> 直接破壊する)
  // - 勝者のレベルが 3 以上で、【不滅】または【王の治癒力】がない
  const isLoserBreaked = loser.hasKeyword('不滅') ? false : true;
  const isWinnerBreaked = winner.hasKeyword('不滅')
    ? false
    : winner.hasKeyword('王の治癒力') && winner.currentBP > winnerDamage
      ? false
      : winner.lv >= 3 || loser.hasKeyword('不滅')
        ? Effect.damage(stack, loser, winner, winnerDamage, 'battle') // Lv3の場合、キーワード効果を持たない限り勝っても負けてもダメージを負う
        : winnerDamage === loserDamage;

  // 破壊が決定したら破壊する
  if (isLoserBreaked && !loser.destination) Effect.break(stack, winner, loser, 'battle');
  if (isWinnerBreaked && !winner.destination) Effect.break(stack, loser, winner, 'battle');

  await new Promise(resolve => setTimeout(resolve, 1000));

  core.stack.push(stack);
  await resolveStack(core);

  // 戦闘勝利後の処理
  const isWinnerHasPenetrate = winner.hasKeyword('貫通');
  const isWinnerIsAttacker = winner.id === attacker.id;
  if (!isWinnerBreaked && isLoserBreaked) {
    // 【貫通】処理
    if (isWinnerHasPenetrate && isWinnerIsAttacker) {
      loser.owner.damage();
    }

    // winnerが生存しており、Lvが3未満の場合はクロックアップさせる
    // NOTE: 戦闘による破壊スタックによってフィールドを離れる可能性があるので生存チェックをする
    if (winner.owner.field.find(unit => unit.id === winner.id)) {
      // 戦闘勝利後のクロックアップ処理
      const systemStack =
        winner.lv < 3
          ? new Stack({
              type: '_postBattleClockUp',
              source: loser,
              target: winner,
              core: core,
            })
          : undefined;
      if (systemStack) Effect.clock(systemStack, loser, winner, 1);

      // 戦闘勝利スタック
      const winnerStack = new Stack({
        type: 'win',
        source: loser,
        target: winner,
        core: core,
      });

      core.stack.push(
        ...[systemStack, winnerStack].filter((stack): stack is Stack => stack !== undefined)
      );
      await resolveStack(core);
    }
  }

  core.room.sync();
  return;
}
