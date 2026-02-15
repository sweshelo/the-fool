/**
 * 利用可能なバージョンキーの中から、指定されたターゲットバージョンに最適なキーを解決する。
 *
 * - `"original"` → `"original"` を返す
 * - `"default"` → 日付バージョンのうち最新を返す（なければ `"original"`）
 * - `"YYYY-MM-DD"` → 対象日付以降の最短日付を返す。なければ `"original"`
 * - バージョニング非対応（キー1つ）→ そのキーをそのまま返す
 */
export function resolveVersion(availableVersions: string[], targetVersion: string): string {
  if (availableVersions.length === 1 && availableVersions[0]) {
    return availableVersions[0];
  }

  switch (targetVersion) {
    case 'original':
      return 'original';

    case 'default': {
      const dateVersions = availableVersions.filter(v => /^\d{4}-\d{2}-\d{2}$/.test(v));
      if (dateVersions.length === 0) return 'original';
      dateVersions.sort();
      const key = dateVersions[dateVersions.length - 1];
      return key || 'original';
    }

    default: {
      // YYYY-MM-DD 形式のターゲットバージョン
      // 対象日付以前の最短日付を返す
      const dateVersions = availableVersions
        .filter(v => /^\d{4}-\d{2}-\d{2}$/.test(v))
        .filter(v => new Date(v).valueOf() <= new Date(targetVersion).valueOf())
        .sort((a, b) => new Date(b).valueOf() - new Date(a).valueOf());

      if (dateVersions.length === 0) return 'original';
      return dateVersions[0] || 'original';
    }
  }
}
