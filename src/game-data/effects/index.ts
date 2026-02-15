import { readdirSync, statSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import { jokerEffects } from './jokers';
import type { CardEffects } from './schema/types';

// カード効果のマップ（TDZ回避のためvarを使用）
// 外側: cardId → 内側: versionKey → CardEffects
// oxlint-disable-next-line no-var
var effectMap: Map<string, Map<string, CardEffects>> | null = null;
// oxlint-disable-next-line no-var
var effectsLoaded = false;

// 特定のカードIDの効果を取得する関数（循環依存を避けるため、エクスポートより前に宣言）
export function getCardEffect(cardId: string): Map<string, CardEffects> | undefined {
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
  effectMap = new Map<string, Map<string, CardEffects>>();

  try {
    const cardsDir = join(__dirname, 'cards');
    const entries = readdirSync(cardsDir);

    // ディレクトリ名を先に収集（同名の.tsファイルをスキップするため）
    const directoryNames = new Set(
      entries.filter(entry => statSync(join(cardsDir, entry)).isDirectory())
    );

    for (const entry of entries) {
      try {
        const fullPath = join(cardsDir, entry);
        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
          // ディレクトリの場合: 中の各ファイルをバージョンキーとして格納
          const cardId = entry;
          const versionMap = new Map<string, CardEffects>();
          const files = readdirSync(fullPath).filter(
            f => (f.endsWith('.ts') || f.endsWith('.js')) && !f.startsWith('_')
          );

          for (const file of files) {
            const versionKey = basename(file, file.endsWith('.ts') ? '.ts' : '.js');
            const module = await import(join(fullPath, file));
            if (module.effects) {
              versionMap.set(versionKey, module.effects);
            }
          }

          if (versionMap.size > 0) {
            effectMap.set(cardId, versionMap);
          }
        } else if (entry.endsWith('.ts') || entry.endsWith('.js')) {
          // 同名ディレクトリが存在する場合はスキップ（ディレクトリ版が優先）
          const cardId = basename(entry, entry.endsWith('.ts') ? '.ts' : '.js');
          if (directoryNames.has(cardId)) continue;

          const module = await import(fullPath);
          if (module.effects) {
            const versionMap = new Map<string, CardEffects>();
            versionMap.set('default', module.effects);
            effectMap.set(cardId, versionMap);
          }
        }
      } catch (err) {
        console.error(`Error loading card effect entry ${entry}:`, err);
      }
    }

    console.log(`Loaded effects for ${effectMap.size} cards`);

    Object.entries(jokerEffects).forEach(([catalogId, effects]) => {
      if (effects) {
        const versionMap = new Map<string, CardEffects>();
        versionMap.set('default', effects);
        effectMap?.set(catalogId, versionMap);
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
