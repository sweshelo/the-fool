/**
 * サンドボックス環境設定
 * ローカル環境でのみ有効化される
 */

export interface SandboxConfig {
  /** サンドボックスモードが有効かどうか */
  enabled: boolean;
  /** サンドボックスルームの固定ID */
  roomId: string;
}

/**
 * サンドボックスモードが有効かどうかを判定
 * 環境変数 SANDBOX_MODE=true で有効化
 */
export function isSandboxEnabled(): boolean {
  return process.env.SANDBOX_MODE === 'true';
}

/**
 * サンドボックス設定を取得
 */
export function getSandboxConfig(): SandboxConfig {
  return {
    enabled: isSandboxEnabled(),
    roomId: '99999',
  };
}
