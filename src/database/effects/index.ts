import { readdirSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import type { HandlerFunction } from '../factory';

// ESモジュールでの__dirnameの代替
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// インターフェース定義
export interface CardEffect {
  [key: string]: HandlerFunction;
}

// カード効果のマップ
const effectMap = new Map<string, CardEffect>();

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
  } catch (error) {
    console.error('Failed to load card effects:', error);
  }
}

// 初期化時に読み込みを実行
await loadCardEffects();

// 特定のカードIDの効果を取得する関数
export function getCardEffect(cardId: string): CardEffect | undefined {
  return effectMap.get(cardId);
}
