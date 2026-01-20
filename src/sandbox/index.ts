/**
 * サンドボックス環境モジュール
 * AIエージェントがゲームに対して手の評価をするためのテスト環境
 *
 * 機能:
 * - 固定の部屋番号(99999)でのサンドボックス起動
 * - 任意のフィールドを構築する機能
 * - プレイヤーが揃っていなくてもゲーム開始可能
 * - マリガンなし
 *
 * 注意:
 * - ローカル環境でのみ有効 (環境変数 SANDBOX_MODE=true)
 * - 本番デプロイ時は無効化すること
 */

export { SandboxRoom } from './SandboxRoom';
export { SandboxCore } from './SandboxCore';
export { DummyCard, DummyUnit, DUMMY_CATALOG } from './DummyCard';
export { loadState, createEmptyPlayerState } from './StateLoader';
export { isSandboxEnabled, getSandboxConfig } from './config';
export type { SandboxConfig } from './config';
