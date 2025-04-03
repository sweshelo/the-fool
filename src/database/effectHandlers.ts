import { EffectExamples } from '../package/core/class/effect';
import type { Catalog } from '../submodule/suit/types/game/card';

/**
 * カタログデータにカード効果ハンドラを登録する
 * @param catalog カタログデータ
 */
export function registerEffectHandlers(catalog: Map<string, Catalog>): void {
  // カタログにサンプル効果を登録する例

  // 例1：召喚時に1枚ドローするカード
  const _10040 = catalog.get('1-0-040');
  if (_10040) {
    _10040.onDrive = EffectExamples.drawOnSummon;
  }

  /*
  // 例2：召喚時に相手全体を破壊するカード
  const destroyAllId = 'example_destroy_all_id'; // 実際のカードIDに置き換える
  const destroyAll = catalog.get(destroyAllId);
  if (destroyAll) {
    destroyAll.onDrive = EffectExamples.destroyAllOpponents;
  }

  // 例3：破壊された時にカードを引くカード
  const drawOnDestroyId = 'example_draw_on_destroy_id'; // 実際のカードIDに置き換える
  const drawOnDestroy = catalog.get(drawOnDestroyId);
  if (drawOnDestroy) {
    drawOnDestroy.onBreak = EffectExamples.drawWhenDestroyed;
  }

  // 例4：召喚時に対象を選択して破壊するカード
  const destroySelectId = 'example_destroy_select_id'; // 実際のカードIDに置き換える
  const destroySelect = catalog.get(destroySelectId);
  if (destroySelect) {
    destroySelect.onDrive = EffectExamples.destroySelected;
  }

  // 実際のカタログデータに基づいて効果を登録する
  // カタログ内の全てのカードをループし、能力テキストを解析して適切な効果を割り当てる
  catalog.forEach((card, id) => {
    // 能力テキストに基づいて効果を割り当てる例
    if (card.ability.includes('召喚時：カードを1枚引く')) {
      card.onDrive = EffectExamples.drawOnSummon;
    }
    
    if (card.ability.includes('召喚時：相手のユニットを全て破壊する')) {
      card.onDrive = EffectExamples.destroyAllOpponents;
    }
    
    if (card.ability.includes('破壊時：カードを1枚引く')) {
      card.onBreak = EffectExamples.drawWhenDestroyed;
    }
    
    if (card.ability.includes('召喚時：相手のユニット1体を対象に選び、破壊する')) {
      card.onDrive = EffectExamples.destroySelected;
    }
  });
  */
}

/**
 * カタログの初期化時に効果ハンドラを登録するための関数
 * @param catalog カタログデータ
 */
export function initializeCatalogWithEffects(catalog: Map<string, Catalog>): Map<string, Catalog> {
  // 効果ハンドラを登録
  registerEffectHandlers(catalog);
  return catalog;
}
