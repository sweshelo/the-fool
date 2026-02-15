import master from '@/submodule/suit/catalog/catalog';
import { effectFactory, type VersionedCatalogEntry } from './factory';

const versionedMaster = new Map<string, VersionedCatalogEntry>();
master.forEach((catalog, id) => {
  versionedMaster.set(id, effectFactory(catalog));
});

export default versionedMaster;
