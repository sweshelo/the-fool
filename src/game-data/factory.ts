import type { Catalog, InternalCatalog } from '../submodule/suit/types/game/card';
import { getCardEffect } from './effects';
import { resolveVersion } from './version-resolver';
import type {
  EventOnHandlers,
  EventOnHandlersWithTargetSuffix,
  EventOnHandlersWithEventSuffix,
  HANDLER_SUFFIXES_TARGET,
  HANDLER_SUFFIXES_EVENT,
} from './effects/schema/handlers';
import type { Core } from '@/package/core';
import type { ICard } from '../submodule/suit/types/game/card';
import type { Stack } from '@/package/core/class/stack';

export interface HandlerFunction {
  (stack: Stack, card: ICard, core: Core): Promise<void>;
}

// 全てのサフィックス付きハンドラーを展開
type AllSuffixHandlers = Partial<
  EventOnHandlersWithTargetSuffix<HandlerFunction, (typeof HANDLER_SUFFIXES_TARGET)[number]> &
    EventOnHandlersWithEventSuffix<HandlerFunction, (typeof HANDLER_SUFFIXES_EVENT)[number]>
>;

export interface CatalogWithHandler
  extends Catalog, Partial<EventOnHandlers<HandlerFunction>>, AllSuffixHandlers {
  fieldEffect?: (stack: Stack) => void;
  handEffect?: (core: Core, card: ICard) => void;
  checkJoker?: (player: import('@/package/core/class/Player').Player, core: Core) => boolean;
  [key: string]: unknown;
}

export type VersionedCatalogEntry = Map<string, CatalogWithHandler>;

/**
 * InternalCatalog から VersionedCatalogEntry を生成する。
 * errata フィールドがある場合は各バージョンごとに CatalogWithHandler を構築し、
 * ない場合は "default" キーで単一エントリを作成する。
 *
 * NOTE: 効果ハンドラはここではマージしない。循環依存により effectMap が
 * 未初期化の状態で呼ばれる可能性があるため、resolveCatalog で遅延マージする。
 */
export function effectFactory(internalCatalog: InternalCatalog): VersionedCatalogEntry {
  const result: VersionedCatalogEntry = new Map();

  if ('errata' in internalCatalog) {
    const errata = internalCatalog.errata;

    for (const [versionKey, ability] of Object.entries(errata)) {
      const catalog: CatalogWithHandler = {
        ...internalCatalog,
        type: ability.type,
        cost: ability.cost,
        bp: ability.bp,
        ability: ability.ability,
        species: ability.species,
      };

      result.set(versionKey, catalog);
    }
  } else {
    const catalog: CatalogWithHandler = {
      ...internalCatalog,
    };

    result.set('default', catalog);
  }

  return result;
}

/**
 * VersionedCatalogEntry からバージョンを解決して CatalogWithHandler を返す。
 * 効果ハンドラを遅延マージする（循環依存対策）。
 */
export function resolveCatalog(entry: VersionedCatalogEntry, version: string): CatalogWithHandler {
  const resolvedKey = resolveVersion(Array.from(entry.keys()), version);
  const catalog = entry.get(resolvedKey) ?? entry.values().next().value;
  if (!catalog) throw new Error('空の VersionedCatalogEntry');

  // 効果ハンドラの遅延マージ
  const versionedEffects = getCardEffect(catalog.id);
  if (versionedEffects) {
    const effects = versionedEffects.get(resolvedKey) ?? versionedEffects.get('default');
    if (effects) {
      for (const [key, handler] of Object.entries(effects)) {
        catalog[key] = handler;
      }
    }
  }

  return catalog;
}
