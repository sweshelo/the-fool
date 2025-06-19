import master from '@/submodule/suit/catalog/catalog';
import { effectFactory, type CatalogWithHandler } from './factory';

master.forEach(card => effectFactory(card as CatalogWithHandler));

// 効果ハンドラを登録してカタログを拡張
export default master as Map<string, CatalogWithHandler>;
