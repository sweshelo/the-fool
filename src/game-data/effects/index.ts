import { readdirSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import { jokerEffects } from './jokers';
import type { CardEffects } from './schema/types';

export { System } from './engine/system';
export { Effect } from './engine/effect';
export { EffectHelper } from './engine/helper';
export { EffectTemplate } from './engine/templates';

// ESモジュールでの__dirnameの代替
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// カード効果のマップ
const effectMap = new Map<string, CardEffects>();

// カードモジュールを読み込み、マッピングする関数
async function loadCardEffects() {
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
        effectMap.set(catalogId, effects);
      }
    });

    console.log(`Loaded joker effects for ${Object.entries(jokerEffects).length} abilities`);
  } catch (error) {
    console.error('Failed to load card effects:', error);
  }
}

// 初期化時に読み込みを実行
await loadCardEffects();

// 特定のカードIDの効果を取得する関数
export function getCardEffect(cardId: string): CardEffects | undefined {
  return effectMap.get(cardId);
}
