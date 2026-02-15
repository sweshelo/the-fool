import { describe, expect, test } from 'bun:test';
import { resolveVersion } from './version-resolver';

describe('resolveVersion', () => {
  const versions = ['original', '2013-10-24', '2019-05-23'];

  test('targetVersion が "original" の場合、"original" を返す', () => {
    expect(resolveVersion(versions, 'original')).toBe('original');
  });

  test('targetVersion が "default" の場合、最新の日付バージョンを返す', () => {
    expect(resolveVersion(versions, 'default')).toBe('2019-05-23');
  });

  test('targetVersion が "default" で日付バージョンがない場合、"original" を返す', () => {
    expect(resolveVersion(['original'], 'original')).toBe('original');
  });

  test('完全一致する日付バージョンがある場合、そのバージョンを返す', () => {
    expect(resolveVersion(versions, '2019-05-23')).toBe('2019-05-23');
    expect(resolveVersion(versions, '2013-10-24')).toBe('2013-10-24');
  });

  test('対象日付以降の最短日付を返す', () => {
    expect(resolveVersion(versions, '2014-01-01')).toBe('2019-05-23');
    expect(resolveVersion(versions, '2012-01-01')).toBe('2013-10-24');
  });

  test('対象日付以降のバージョンがない場合、"original" を返す', () => {
    expect(resolveVersion(versions, '2020-01-01')).toBe('original');
  });

  test('バージョニング非対応（キー1つ）の場合、そのキーをそのまま返す', () => {
    expect(resolveVersion(['default'], 'default')).toBe('default');
    expect(resolveVersion(['default'], '2019-05-23')).toBe('default');
    expect(resolveVersion(['default'], 'original')).toBe('default');
  });
});
