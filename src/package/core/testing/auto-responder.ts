/**
 * テスト用の自動応答クラス
 * WebSocketプロンプト（System.show, System.prompt, ブロック選択など）を自動的に解決する
 */

type PromptPayload = {
  type: string;
  promptId?: string;
  choices?: {
    type: string;
    items?: Array<{ id: string }>;
    isCancelable?: boolean;
  };
};

type PromptHandler = (promptId: string, payload: PromptPayload) => string[] | undefined;

export class AutoResponder {
  private handlers: Map<string, PromptHandler> = new Map();
  private defaultHandler: PromptHandler;

  constructor() {
    // デフォルト: 即座に空配列で応答（キャンセル）
    this.defaultHandler = () => [];
  }

  /**
   * 特定のprompt typeに対するハンドラを設定
   */
  setHandler(type: string, handler: PromptHandler): void {
    this.handlers.set(type, handler);
  }

  /**
   * ブロック時は自動的にブロックしない
   */
  setAutoSkipBlock(): void {
    this.setHandler('block', () => []);
  }

  /**
   * ブロック時は最初のユニットで自動ブロック
   */
  setAutoBlockFirst(): void {
    this.setHandler('block', (_id, payload) => {
      const items = payload.choices?.items ?? [];
      return items.length > 0 && items[0] ? [items[0].id] : [];
    });
  }

  /**
   * DisplayEffect は即座に続行
   */
  setAutoContinue(): void {
    this.setHandler('DisplayEffect', () => undefined);
  }

  /**
   * ユニット選択は最初のユニットを選択
   */
  setAutoSelectFirst(): void {
    this.setHandler('unit', (_id, payload) => {
      const items = payload.choices?.items ?? [];
      return items.length > 0 && items[0] ? [items[0].id] : [];
    });
  }

  /**
   * オプション選択は最初のオプションを選択
   */
  setAutoSelectFirstOption(): void {
    this.setHandler('option', (_id, payload) => {
      const items = payload.choices?.items ?? [];
      return items.length > 0 && items[0] ? [items[0].id] : [];
    });
  }

  /**
   * 応答を処理
   * @returns string[] の場合は handleEffectResponse を呼ぶ、undefined の場合は handleContinue を呼ぶ
   */
  respond(promptId: string, payload: PromptPayload): string[] | undefined {
    const type = payload.type === 'DisplayEffect' ? 'DisplayEffect' : payload.choices?.type;
    if (!type) return [];
    const handler = this.handlers.get(type) ?? this.defaultHandler;
    return handler(promptId, payload);
  }
}
