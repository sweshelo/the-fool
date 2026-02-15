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

/**
 * スタック処理順序のE2Eテスト
 *
 * このテストでは、実際のカード効果を使用してスタック処理順序を検証する。
 * WebSocketプロンプトは AutoResponder によって自動的に解決される。
 */

// テストユーティリティを遅延インポート
beforeAll(async () => {
  // System.sleep をモック化（即座に解決）
  const { System } = await import('@/game-data/effects');
  System.sleep = mock(() => Promise.resolve());

  // テストユーティリティを遅延インポート
  const testing = await import('../testing');
  createTestContext = testing.createTestContext;
  createUnit = testing.createUnit;
  EventRecorder = testing.EventRecorder;

  // Stack を遅延インポート
  const stackModule = await import('../class/stack');
  Stack = stackModule.Stack;
});

describe('スタック処理順序 E2E', () => {
  describe('Lv3ユニット召喚時のスタック順序', () => {
    test('2-1-110召喚時: drive が完了してから overclock が処理される', async () => {
      // このテストはゲーム内のsetTimeout遅延により時間がかかる
      const { core, player1, player2, autoResponder } = createTestContext();
      const recorder = new EventRecorder();

      // 相手フィールドにユニットを配置（ブロック用）
      const blocker = createUnit(player2, '1-0-001');
      blocker.active = true;
      player2.field.push(blocker);

      // 自動ブロックを設定
      autoResponder.setAutoBlockFirst();

      // 2-1-110 (Lv3ユニット、即時アタック効果) を作成
      const unit = createUnit(player1, '2-1-110');
      unit.lv = 3;

      // スタック解決をフック
      const originalResolve = Stack.prototype.resolve;
      Stack.prototype.resolve = async function (this: StackClass, c: Core) {
        recorder.record(`${this.type}-start`);
        await originalResolve.call(this, c);
        recorder.record(`${this.type}-end`);
      };

      try {
        // 召喚
        await core.drive(player1, unit);

        // drive と overclock が処理されていることを確認
        expect(recorder.contains('drive-start')).toBe(true);
        expect(recorder.contains('overclock-start')).toBe(true);

        // drive が完了してから overclock が開始される
        const driveEndIndex = recorder.indexOf('drive-end');
        const overclockStartIndex = recorder.indexOf('overclock-start');
        expect(driveEndIndex).toBeLessThan(overclockStartIndex);
      } finally {
        Stack.prototype.resolve = originalResolve;
      }
    });

    test('通常のLv3召喚: drive → overclock の順で処理される', async () => {
      const { core, player1 } = createTestContext();
      const recorder = new EventRecorder();

      // 通常のLv3ユニット（即時アタックなし）
      const unit = createUnit(player1, '1-0-001');
      unit.lv = 3;

      const originalResolve = Stack.prototype.resolve;
      Stack.prototype.resolve = async function (this: StackClass, c: Core) {
        recorder.record(this.type);
        await originalResolve.call(this, c);
      };

      try {
        await core.drive(player1, unit);

        // overclock は drive の後
        const driveIndex = recorder.indexOf('drive');
        const overclockIndex = recorder.indexOf('overclock');
        expect(driveIndex).toBeLessThan(overclockIndex);
      } finally {
        Stack.prototype.resolve = originalResolve;
      }
    });
  });

  describe('戦闘処理', () => {
    test('攻撃時、事前に積まれたスタックは処理されない', async () => {
      const { core, player1, autoResponder } = createTestContext();

      const attacker = createUnit(player1, '1-0-001');
      player1.field.push(attacker);
      attacker.active = true;

      // 事前にoverclockスタックを積む
      const preStack = new Stack({
        type: 'overclock',
        source: attacker,
        target: attacker,
        core,
      });
      core.stack.push(preStack);

      // ブロックなし
      autoResponder.setAutoSkipBlock();

      // 攻撃実行
      await core.attack(attacker);

      // 事前のスタックは処理されずに残っている
      expect(core.stack.length).toBe(1);
      expect(core.stack[0]).toBe(preStack);
    });

    test('プレイヤーアタック成功時、相手ライフが減少する', async () => {
      const { core, player1, player2, autoResponder } = createTestContext();

      const attacker = createUnit(player1, '1-0-001');
      player1.field.push(attacker);
      attacker.active = true;

      // ブロックなし
      autoResponder.setAutoSkipBlock();

      const initialLife = player2.life.current;

      // 攻撃実行
      await core.attack(attacker);

      // 相手ライフが1減少
      expect(player2.life.current).toBe(initialLife - 1);
    });

    test('戦闘でブロックした場合、BP比較で勝敗が決まる', async () => {
      const { core, player1, player2, autoResponder } = createTestContext();

      // 高BPユニットで攻撃
      const attacker = createUnit(player1, '1-0-001');
      attacker.bp = 7000;
      attacker.active = true;
      player1.field.push(attacker);

      // 低BPユニットでブロック
      const blocker = createUnit(player2, '1-0-001');
      blocker.bp = 3000;
      blocker.active = true;
      player2.field.push(blocker);

      // 自動ブロック
      autoResponder.setAutoBlockFirst();

      // 攻撃実行
      await core.attack(attacker);

      // ブロッカーは破壊される
      expect(player2.field.find((u: Unit) => u.id === blocker.id)).toBeUndefined();
      // アタッカーは生存
      expect(player1.field.find((u: Unit) => u.id === attacker.id)).toBeDefined();
    });
  });

  describe('スタック親子関係', () => {
    test('attack が親スタックの children に追加される', async () => {
      const { core, player1, autoResponder } = createTestContext();

      const attacker = createUnit(player1, '1-0-001');
      player1.field.push(attacker);
      attacker.active = true;

      // 親スタック（drive）を作成
      const parentStack = new Stack({
        type: 'drive',
        source: player1,
        target: attacker,
        core,
      });

      autoResponder.setAutoSkipBlock();

      // parentStack を渡して attack を呼び出す
      const { attack } = await import('./battle');
      await attack(core, attacker, parentStack);

      // attack スタックが parentStack の children に追加されている
      expect(parentStack.children.length).toBeGreaterThanOrEqual(1);
      const attackChild = parentStack.children.find((c: StackClass) => c.type === 'attack');
      expect(attackChild).toBeDefined();
      expect(attackChild?.parent).toBe(parentStack);
    });
  });

  describe('カード効果の統合テスト', () => {
    test('2-1-110のonOverclockSelfが相手の最高BPユニットを消滅させる', async () => {
      const { core, player1, player2, autoResponder } = createTestContext();

      // 相手フィールドにユニットを配置
      const target1 = createUnit(player2, '1-0-001');
      const target2 = createUnit(player2, '1-0-001');
      target1.bp = 5000;
      target2.bp = 7000;
      target1.active = false; // ブロック不可
      target2.active = false; // ブロック不可
      player2.field.push(target1, target2);

      autoResponder.setAutoSkipBlock(); // ブロックしない

      // 2-1-110 Lv3召喚
      const unit = createUnit(player1, '2-1-110');
      unit.lv = 3;

      await core.drive(player1, unit);

      // overclock効果で最高BPユニット(target2)が消滅
      const target2Exists = player2.field.find((u: Unit) => u.id === target2.id);
      expect(target2Exists).toBeUndefined();

      // 低BPユニットは生存
      const target1Exists = player2.field.find((u: Unit) => u.id === target1.id);
      expect(target1Exists).toBeDefined();
    });

    test('Lv3ユニットは召喚時に行動権を得る（overclock効果）', async () => {
      const { core, player1 } = createTestContext();

      // Lv3ユニット
      const unit = createUnit(player1, '1-0-001');
      unit.lv = 3;

      await core.drive(player1, unit);

      // overclock 後は行動権がある
      expect(unit.active).toBe(true);
      // overclocked フラグが立っている
      expect(unit.overclocked).toBe(true);
    });
  });
});
