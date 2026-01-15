import type { Core } from '../index';

type EffectResponseCallback = Function;

/**
 * 効果応答ハンドラマップ
 * promptId をキーとして、対応するコールバック関数を保持する
 */
export const effectResponses: Map<string, EffectResponseCallback> = new Map();

/**
 * 効果応答のハンドラを設定する
 * @param core Coreインスタンス
 * @param promptId プロンプトID
 * @param handler 応答を処理するコールバック関数
 */
export function setEffectDisplayHandler(
  core: Core,
  promptId: string,
  handler: EffectResponseCallback
): void {
  effectResponses.set(promptId, handler);
}

/**
 * クライアントからの効果応答を処理する
 * @param core Coreインスタンス
 * @param promptId プロンプトID
 * @param response ユーザーの選択内容
 */
export function handleEffectResponse(
  core: Core,
  promptId: string,
  response: string[] | undefined
): void {
  const handler = effectResponses.get(promptId);
  if (handler) {
    handler(response);
    effectResponses.delete(promptId);
  } else {
    console.warn(`No handler found for prompt ${promptId}`);
  }
}

/**
 * クライアントからの再開処理を受け取る
 * @param core Coreインスタンス
 * @param promptId プロンプトID
 */
export function handleContinue(core: Core, promptId: string): void {
  const handler = effectResponses.get(promptId);
  if (handler) {
    handler();
    effectResponses.delete(promptId);
  } else {
    console.warn(`No handler found for prompt ${promptId}`);
  }
}
