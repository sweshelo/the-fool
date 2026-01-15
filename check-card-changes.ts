#!/usr/bin/env bun
/**
 * mainブランチとの間のカード変更を確認するスクリプト
 * 使用方法: bun run check-card-changes.ts
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';

interface CatalogCard {
  id: string;
  name: string;
  [key: string]: any;
}

console.log('Checking card changes between current branch and main...');
console.log('================================================================\n');

// mainブランチとの差分を取得
// core.quotepath=false で日本語ファイル名のエスケープを防ぐ
const gitDiff = execSync(
  'git -c core.quotepath=false diff origin/release --name-status -- "src/database/effects/cards/*.ts"',
  {
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'ignore'], // stderrを無視してwarningを非表示に
  }
);

// catalog.jsonを読み込み
const catalogPath = join(process.cwd(), 'src/submodule/suit/catalog/catalog.json');
const catalog: CatalogCard[] = JSON.parse(readFileSync(catalogPath, 'utf-8'));

// IDでインデックス化（検索を高速化）
const catalogMap = new Map<string, string>();
for (const card of catalog) {
  catalogMap.set(card.id, card.name);
}

// 差分を処理してグループ化
interface CardChange {
  status: string;
  id: string;
  name: string;
}

const changes: CardChange[] = [];
const lines = gitDiff
  .trim()
  .split('\n')
  .filter(line => line);

for (const line of lines) {
  const [status, file] = line.split('\t');

  // ファイル名からIDを抽出
  const filename = file?.split('/').pop() || '';
  const id = filename.replace('.ts', '');

  // カード名を取得
  const name = catalogMap.get(id) || '(カード名が見つかりません)';

  // @ts-ignore
  changes.push({ status, id, name });
}

// ステータスごとにグループ化して表示
const statusGroups: { [key: string]: CardChange[] } = {};
const statusOrder = ['M', 'A', 'D']; // Modified, Added, Deleted の順

for (const change of changes) {
  if (!statusGroups[change.status]) {
    statusGroups[change.status] = [];
  }

  // @ts-ignore
  statusGroups[change.status].push(change);
}

// ステータスごとに表示
for (const status of statusOrder) {
  const group = statusGroups[status];
  if (!group || group.length === 0) continue;

  let _statusLabel: string;
  let groupTitle: string;
  switch (status) {
    case 'A':
      _statusLabel = '[NEW]     ';
      groupTitle = '新規追加';
      break;
    case 'M':
      _statusLabel = '[MODIFIED]';
      groupTitle = '変更';
      break;
    case 'D':
      _statusLabel = '[DELETED] ';
      groupTitle = '削除';
      break;
    default:
      _statusLabel = `[${status}]       `;
      groupTitle = status;
  }

  console.log(`\n■ ${groupTitle} (${group.length}件)`);
  console.log(`| カードID | カード名 |${status === 'M' ? ' 内容 |' : ''}`);
  console.log(`| -- | -- |${status === 'M' ? ' -- |' : ''}`);
  for (const change of group) {
    console.log(`| ${change.id} | ${change.name} |${status === 'M' ? '  |' : ''}`);
  }
}

console.log('\n================================================================');
console.log('Done.');
