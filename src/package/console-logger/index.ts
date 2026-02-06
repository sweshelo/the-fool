const isDebugEnabled = () => process.env.DEBUG_LOG === 'true';

// ゲームロジックのデバッグログ（DEBUG_LOG=true のときのみ出力）
export const debug = (tag: string, message: string, ...args: unknown[]) => {
  if (isDebugEnabled()) console.log(`[${tag}]`, message, ...args);
};

// 運用情報ログ（常に出力）
export const info = (tag: string, message: string, ...args: unknown[]) => {
  console.log(`[${tag}]`, message, ...args);
};

// 警告（常に出力）
export const warn = (tag: string, message: string, ...args: unknown[]) => {
  console.warn(`[${tag}]`, message, ...args);
};

// エラー（常に出力）
export const error = (tag: string, message: string, ...args: unknown[]) => {
  console.error(`[${tag}]`, message, ...args);
};
