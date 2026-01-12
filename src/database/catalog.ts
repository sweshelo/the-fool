import master from '@/submodule/suit/catalog/catalog';
import { effectFactory, type CatalogWithHandler } from './factory';

// oxlint-disable-next-line no-unsafe-type-assertion
master.forEach(catalog => effectFactory(catalog as CatalogWithHandler));

// 効果ハンドラを登録してカタログを拡張
// oxlint-disable-next-line no-unsafe-type-assertion
export default master as Map<string, CatalogWithHandler>;
