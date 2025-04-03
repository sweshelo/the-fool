import master from '@/submodule/suit/catalog/catalog';
import { initializeCatalogWithEffects } from './effectHandlers';

// 効果ハンドラを登録してカタログを拡張
export default initializeCatalogWithEffects(master);
