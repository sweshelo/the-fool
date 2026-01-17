import { readdirSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import { jokerEffects } from './jokers';
import type { CardEffects } from './schema/types';

// カード効果のマップ（TDZ回避のためvarを使用）
// oxlint-disable-next-line no-var
var effectMap: Map<string, CardEffects> | null = null;
// oxlint-disable-next-line no-var
var effectsLoaded = false;

// 特定のカードIDの効果を取得する関数（循環依存を避けるため、エクスポートより前に宣言）
export function getCardEffect(cardId: string): CardEffects | undefined {
  // 循環依存の場合、effectMapがまだnullの可能性がある
  if (!effectMap) {
    return undefined;
  }
  return effectMap.get(cardId);
}

export { System } from './engine/system';
export { Effect } from './engine/effect';
export { EffectHelper } from './engine/helper';
export { EffectTemplate } from './engine/templates';

// ESモジュールでの__dirnameの代替
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// カードモジュールを読み込み、マッピングする関数
async function loadCardEffects() {
  if (effectsLoaded) return;

  // マップを初期化
  effectMap = new Map<string, CardEffects>();

  try {
    const cardsDir = join(__dirname, 'cards');
    const files = readdirSync(cardsDir).filter(
      file => file.endsWith('.ts') || file.endsWith('.js')
    );

    for (const file of files) {
      try {
        // カードIDをファイル名から取得
        const cardId = basename(file, file.endsWith('.ts') ? '.ts' : '.js');

        // Bunの動的インポート
        const module = await import(join(cardsDir, file));

        if (module.effects) {
          // カードIDと効果をマッピング
          effectMap.set(cardId, module.effects);
        }
      } catch (err) {
        console.error(`Error loading card effect file ${file}:`, err);
      }
    }

    console.log(`Loaded effects for ${effectMap.size} cards`);

    Object.entries(jokerEffects).forEach(([catalogId, effects]) => {
      if (effects) {
        effectMap?.set(catalogId, effects);
      }
    });

    console.log(`Loaded joker effects for ${Object.entries(jokerEffects).length} abilities`);
    effectsLoaded = true;
  } catch (error) {
    console.error('Failed to load card effects:', error);
  }
}

// 初期化時に読み込みを実行
await loadCardEffects();

// カタログに効果を適用する関数（テスト用）
// catalog.ts が effects のロード前に初期化された場合に、後から効果を適用するために使用
export async function applyEffectsToCatalog(): Promise<void> {
  // effectsがロードされていることを確認
  if (!effectsLoaded) {
    await loadCardEffects();
  }

  // catalog と factory を遅延インポート（循環依存を避けるため）
  const { default: master } = await import('../catalog');
  const { effectFactory } = await import('../factory');

  // 全カタログに効果を再適用
  master.forEach(catalog => {
    effectFactory(catalog);
  });
}
