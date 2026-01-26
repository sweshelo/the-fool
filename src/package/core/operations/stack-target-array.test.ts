import { describe, test, expect, beforeAll, mock } from 'bun:test';
import type { Core } from '../index';
import type { Stack as StackClass } from '../class/stack';
import type { Unit } from '../class/card';
import type { TestContext, EventRecorder as EventRecorderClass } from '../testing';

// 遅延インポート用の変数（循環依存を避けるため）
let createTestContext: () => TestContext;
let createUnit: (owner: TestContext['player1'], catalogId?: string) => Unit;
let EventRecorder: typeof EventRecorderClass;
let Stack: typeof StackClass;
let Effect: typeof import('@/game-data/effects').Effect;

/**
 * Stack.target 配列対応のためのテスト
 *
 * このテストでは、handes/damage/lost などの複数ターゲットイベントの
 * Stack処理順序を検証する。
 *
 * 【Issue #176】
 * - 現在: 複数回のイベントが発生した際、複数のStackが生成される
 * - 目標: 1つのStackで複数のtargetを処理できるようにする
 */

// テストユーティリティを遅延インポート
beforeAll(async () => {
  // System.sleep をモック化（即座に解決）
  const { System, applyEffectsToCatalog } = await import('@/game-data/effects');
  System.sleep = mock(() => Promise.resolve());

  // カタログに効果を適用
  await applyEffectsToCatalog();

  // テストユーティリティを遅延インポート
  const testing = await import('../testing');
  createTestContext = testing.createTestContext;
  createUnit = testing.createUnit;
  EventRecorder = testing.EventRecorder;

  // Stack を遅延インポート
  const stackModule = await import('../class/stack');
  Stack = stackModule.Stack;

  // Effect を遅延インポート
  const effectModule = await import('@/game-data/effects');
  Effect = effectModule.Effect;
});

describe('Stack.target 配列対応テスト', () => {
  describe('現在のhandes処理挙動（リグレッション用）', () => {
    test('複数のハンデス時、各カードに対して個別のStackが生成される', async () => {
      const { core, player1, player2 } = createTestContext();

      // 相手の手札にカードを追加
      const card1 = createUnit(player2, '1-0-001');
      const card2 = createUnit(player2, '1-0-001');
      player2.hand.push(card1, card2);

      // 自分のフィールドにユニットを配置（効果発動元）
      const source = createUnit(player1, '1-0-001');
      player1.field.push(source);

      // 親スタック作成
      const parentStack = new Stack({
        type: 'drive',
        source: player1,
        target: source,
        core,
      });

      // 2枚ハンデスを実行
      Effect.break(parentStack, source, card1, 'effect');
      Effect.break(parentStack, source, card2, 'effect');

      // 現在の実装では、各ハンデスに対して個別のStackが生成される
      const handesStacks = parentStack.children.filter((s: StackClass) => s.type === 'handes');
      expect(handesStacks.length).toBe(2);
    });

    test('handes Stack解決時、onlySelfResolve で重複発火を防止', async () => {
      const { core, player1, player2 } = createTestContext();
      const recorder = new EventRecorder();

      // 相手の手札にカードを追加
      const card1 = createUnit(player2, '1-0-001');
      const card2 = createUnit(player2, '1-0-001');
      player2.hand.push(card1, card2);

      // 自分のフィールドにユニットを配置
      const source = createUnit(player1, '1-0-001');
      player1.field.push(source);

      // スタック解決をフック
      let handesResolveCount = 0;
      const onlySelfResolveArgs: boolean[] = [];

      // oxlint-disable-next-line typescript-eslint/unbound-method
      const originalResolve = Stack.prototype.resolve;
      Stack.prototype.resolve = async function (
        this: StackClass,
        c: Core,
        onlySelfResolve: boolean = false
      ) {
        if (this.type === 'handes') {
          handesResolveCount++;
          onlySelfResolveArgs.push(onlySelfResolve);
          recorder.record(`handes-resolve-${onlySelfResolve ? 'self' : 'full'}`);
        }
        await originalResolve.call(this, c, onlySelfResolve);
      };

      try {
        // 親スタック作成
        const parentStack = new Stack({
          type: 'drive',
          source: player1,
          target: source,
          core,
        });

        // 2枚ハンデスを実行
        Effect.break(parentStack, source, card1, 'effect');
        Effect.break(parentStack, source, card2, 'effect');

        // 親スタック解決
        await parentStack.resolve(core);

        // 2回のhandes resolveが呼ばれる
        expect(handesResolveCount).toBe(2);

        // 最初は full (false)、2回目は self-only (true)
        // ※同じownerに対する2回目以降は onlySelfResolve=true になる
        expect(onlySelfResolveArgs[0]).toBe(false);
        expect(onlySelfResolveArgs[1]).toBe(true);
      } finally {
        Stack.prototype.resolve = originalResolve;
      }
    });
  });

  describe('現在のdamage処理挙動（リグレッション用）', () => {
    test('複数のダメージ時、各ユニットに対して個別のStackが生成される', async () => {
      const { core, player1, player2 } = createTestContext();

      // 相手のフィールドにユニットを配置
      const target1 = createUnit(player2, '1-0-001');
      const target2 = createUnit(player2, '1-0-001');
      target1.bp = 5000;
      target2.bp = 5000;
      player2.field.push(target1, target2);

      // 自分のフィールドにユニットを配置
      const source = createUnit(player1, '1-0-001');
      player1.field.push(source);

      // 親スタック作成
      const parentStack = new Stack({
        type: 'drive',
        source: player1,
        target: source,
        core,
      });

      // 2体にダメージ
      Effect.damage(parentStack, source, target1, 1000);
      Effect.damage(parentStack, source, target2, 1000);

      // 現在の実装では、各ダメージに対して個別のStackが生成される
      const damageStacks = parentStack.children.filter((s: StackClass) => s.type === 'damage');
      expect(damageStacks.length).toBe(2);
    });
  });

  describe('Stack処理順序（リグレッション用）', () => {
    test('子スタック処理順序はchildren配列の順序に従う', async () => {
      const { core, player1, player2 } = createTestContext();
      const childResolveOrder: string[] = [];

      // 相手のフィールドにユニットを配置
      const target1 = createUnit(player2, '1-0-001');
      const target2 = createUnit(player2, '1-0-001');
      target1.bp = 5000;
      target2.bp = 5000;
      player2.field.push(target1, target2);

      // 自分のフィールドにユニットを配置
      const source = createUnit(player1, '1-0-001');
      player1.field.push(source);

      // スタック解決をフック
      // oxlint-disable-next-line typescript-eslint/unbound-method
      const originalResolve = Stack.prototype.resolve;
      Stack.prototype.resolve = async function (
        this: StackClass,
        c: Core,
        onlySelfResolve: boolean = false
      ) {
        if (this.type === 'damage' && this.target && 'id' in this.target) {
          childResolveOrder.push(this.target.id);
        }
        await originalResolve.call(this, c, onlySelfResolve);
      };

      try {
        // 親スタック作成
        const parentStack = new Stack({
          type: 'drive',
          source: player1,
          target: source,
          core,
        });

        // target1, target2 の順でダメージ（children に追加される順序）
        Effect.damage(parentStack, source, target1, 1000);
        Effect.damage(parentStack, source, target2, 1000);

        // 親スタック解決
        await parentStack.resolve(core);

        // children配列の順序通りに処理される（target1 → target2）
        expect(childResolveOrder[0]).toBe(target1.id);
        expect(childResolveOrder[1]).toBe(target2.id);
      } finally {
        Stack.prototype.resolve = originalResolve;
      }
    });
  });

  describe('Stack型の整合性テスト', () => {
    test('Stack.targetは現在単一の値を取る', () => {
      const { core, player1 } = createTestContext();
      const unit = createUnit(player1, '1-0-001');

      const stack = new Stack({
        type: 'drive',
        source: player1,
        target: unit,
        core,
      });

      // 現在の実装では target は単一の値
      expect(stack.target).toBe(unit);
      expect(Array.isArray(stack.target)).toBe(false);
    });

    test('addChildStackは単一のtargetを受け取る', () => {
      const { core, player1 } = createTestContext();
      const unit = createUnit(player1, '1-0-001');

      const parentStack = new Stack({
        type: 'drive',
        source: player1,
        target: unit,
        core,
      });

      const childTarget = createUnit(player1, '1-0-001');
      const childStack = parentStack.addChildStack('break', unit, childTarget);

      expect(childStack.target).toBe(childTarget);
    });
  });
});
