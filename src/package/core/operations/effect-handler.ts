import type { Core } from '../index';

type EffectResponseCallback = Function;

/**
 * 効果応答のハンドラを設定する
 * Core インスタンス固有の effectResponses Map を使用
 * @param core Coreインスタンス
 * @param promptId プロンプトID（crypto.randomUUID() で生成されることを想定）
 * @param handler 応答を処理するコールバック関数
 */
export function setEffectDisplayHandler(
  core: Core,
  promptId: string,
  handler: EffectResponseCallback
): void {
  core.effectResponses.set(promptId, handler);
}

/**
 * クライアントからの効果応答を処理する
 * Core インスタンス固有の effectResponses Map から取得
 * @param core Coreインスタンス
 * @param promptId プロンプトID
 * @param response ユーザーの選択内容
 */
export function handleEffectResponse(
  core: Core,
  promptId: string,
  response: string[] | undefined
): void {
  const handler = core.effectResponses.get(promptId);
  if (handler) {
    handler(response);
    core.effectResponses.delete(promptId);
  } else {
    console.warn(`[Core ${core.id}] No handler found for prompt ${promptId}`);
  }
}

/**
 * クライアントからの再開処理を受け取る
 * Core インスタンス固有の effectResponses Map から取得
 * @param core Coreインスタンス
 * @param promptId プロンプトID
 */
export function handleContinue(core: Core, promptId: string): void {
  const handler = core.effectResponses.get(promptId);
  if (handler) {
    handler();
    core.effectResponses.delete(promptId);
  } else {
    console.warn(`[Core ${core.id}] No handler found for prompt ${promptId}`);
  }
}
