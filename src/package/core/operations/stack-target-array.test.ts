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
 * - 変更前: 複数回のイベントが発生した際、複数のStackが生成される
 * - 変更後: 1つのStackで複数のtargetを処理できる
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
  describe('handes処理挙動', () => {
    test('複数のハンデス時、1つのStackに複数ターゲットがマージされる', async () => {
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

      // 新しい実装では、複数ハンデスが1つのStackにマージされる
      const handesStacks = parentStack.children.filter((s: StackClass) => s.type === 'handes');
      expect(handesStacks.length).toBe(1);

      // マージされたスタックは複数のターゲットを持つ
      const mergedStack = handesStacks[0];
      expect(mergedStack).toBeDefined();
      expect(mergedStack?.getTargets().length).toBe(2);
      expect(mergedStack?.getTargets()).toContain(card1);
      expect(mergedStack?.getTargets()).toContain(card2);

      // target getter は最初のターゲットを返す（後方互換性）
      expect(mergedStack?.target).toBe(card1);
    });

    test('handes Stack解決時、単一resolveで複数ターゲットを処理', async () => {
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

      // oxlint-disable-next-line typescript-eslint/unbound-method
      const originalResolve = Stack.prototype.resolve;
      Stack.prototype.resolve = async function (
        this: StackClass,
        c: Core,
        onlySelfResolve: boolean = false
      ) {
        if (this.type === 'handes') {
          handesResolveCount++;
          recorder.record(`handes-resolve-targets:${this.getTargets().length}`);
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

        // 1回のhandes resolveで2ターゲットを処理
        expect(handesResolveCount).toBe(1);
        expect(recorder.events).toContain('handes-resolve-targets:2');
      } finally {
        Stack.prototype.resolve = originalResolve;
      }
    });
  });

  describe('damage処理挙動', () => {
    test('複数のダメージ時、同一source/optionのStackがマージされる', async () => {
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

      // 2体にダメージ（同じダメージ値）
      Effect.damage(parentStack, source, target1, 1000);
      Effect.damage(parentStack, source, target2, 1000);

      // 新しい実装では、同一source/optionの場合はマージされる
      const damageStacks = parentStack.children.filter((s: StackClass) => s.type === 'damage');
      expect(damageStacks.length).toBe(1);

      // マージされたスタックは複数のターゲットを持つ
      expect(damageStacks[0]?.getTargets().length).toBe(2);
    });

    test('異なるダメージ値の場合は別々のStackが生成される', async () => {
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

      // 2体に異なるダメージ値
      Effect.damage(parentStack, source, target1, 1000);
      Effect.damage(parentStack, source, target2, 2000);

      // 異なるoptionなので別々のStackが生成される
      const damageStacks = parentStack.children.filter((s: StackClass) => s.type === 'damage');
      expect(damageStacks.length).toBe(2);
    });
  });

  describe('Stack処理順序', () => {
    test('マージされたスタックのターゲットは追加順に保持される', async () => {
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

      // target1, target2 の順でダメージ
      Effect.damage(parentStack, source, target1, 1000);
      Effect.damage(parentStack, source, target2, 1000);

      // マージされたスタックのターゲット順序を確認
      const damageStack = parentStack.children.find((s: StackClass) => s.type === 'damage');
      expect(damageStack).toBeDefined();

      const targets = damageStack?.getTargets() ?? [];
      expect(targets[0]).toBe(target1);
      expect(targets[1]).toBe(target2);
    });
  });

  describe('Stack型の整合性テスト', () => {
    test('target getterは最初のターゲットを返す（後方互換性）', () => {
      const { core, player1 } = createTestContext();
      const unit1 = createUnit(player1, '1-0-001');
      const unit2 = createUnit(player1, '1-0-001');

      // 配列ターゲットでスタック作成
      const stack = new Stack({
        type: 'drive',
        source: player1,
        target: [unit1, unit2],
        core,
      });

      // target は最初のターゲットを返す
      expect(stack.target).toBe(unit1);
      expect(Array.isArray(stack.target)).toBe(false);

      // getTargets() は配列全体を返す
      expect(stack.getTargets().length).toBe(2);
      expect(stack.getTargets()).toContain(unit1);
      expect(stack.getTargets()).toContain(unit2);
    });

    test('addChildStackは配列targetも受け取れる', () => {
      const { core, player1 } = createTestContext();
      const unit = createUnit(player1, '1-0-001');
      const childTarget1 = createUnit(player1, '1-0-001');
      const childTarget2 = createUnit(player1, '1-0-001');

      const parentStack = new Stack({
        type: 'drive',
        source: player1,
        target: unit,
        core,
      });

      // 配列ターゲットで子スタック作成
      const childStack = parentStack.addChildStack('break', unit, [childTarget1, childTarget2]);

      expect(childStack.getTargets().length).toBe(2);
      expect(childStack.target).toBe(childTarget1);
    });

    test('addOrMergeChildStackは同一type/sourceのスタックにターゲットをマージする', () => {
      const { core, player1 } = createTestContext();
      const unit = createUnit(player1, '1-0-001');
      const childTarget1 = createUnit(player1, '1-0-001');
      const childTarget2 = createUnit(player1, '1-0-001');

      const parentStack = new Stack({
        type: 'drive',
        source: player1,
        target: unit,
        core,
      });

      // 1つ目のターゲット
      const childStack1 = parentStack.addOrMergeChildStack('break', unit, childTarget1);
      expect(parentStack.children.length).toBe(1);

      // 2つ目のターゲット（同じスタックにマージされる）
      const childStack2 = parentStack.addOrMergeChildStack('break', unit, childTarget2);
      expect(parentStack.children.length).toBe(1);
      expect(childStack1).toBe(childStack2);

      // 両方のターゲットを持つ
      expect(childStack1.getTargets().length).toBe(2);
    });
  });
});
