import { EffectTester } from './effectTester';
import catalog from '../../database/catalog';
import { EffectExamples } from '../core/class/effect';

/**
 * カード効果システムのデモンストレーション
 */
async function demonstrateEffectSystem() {
  console.log('=== TCG カード効果システム デモンストレーション ===');

  // カタログにテスト用エフェクトを手動で追加
  const testCards = createTestCards();

  // ドライブ(召喚)効果のデモ
  console.log('\n=== ドライブ(召喚)効果のデモンストレーション ===');
  for (const cardId of testCards.driveEffects) {
    await EffectTester.testDriveEffect(cardId);
    console.log('-'.repeat(50));
  }

  // ブレイク(破壊)効果のデモ
  console.log('\n=== ブレイク(破壊)効果のデモンストレーション ===');
  for (const cardId of testCards.breakEffects) {
    await EffectTester.testBreakEffect(cardId);
    console.log('-'.repeat(50));
  }

  console.log('\n=== デモンストレーション完了 ===');
}

/**
 * テスト用のカードデータを作成する
 */
function createTestCards() {
  const driveEffects: string[] = [];
  const breakEffects: string[] = [];

  // テスト用カード1: ドロー効果
  const drawCardId = 'test_draw_card';
  catalog.set(drawCardId, {
    id: drawCardId,
    name: 'テスト・ドローカード',
    rarity: 'c',
    cost: 1,
    color: 1,
    ability: '召喚時：カードを1枚引く',
    originality: 0,
    img: '',
    type: 'unit',
    info: { version: 1, number: 1000 },
    onDrive: EffectExamples.drawOnSummon
  });
  driveEffects.push(drawCardId);

  // テスト用カード2: 全破壊効果
  const destroyAllId = 'test_destroy_all';
  catalog.set(destroyAllId, {
    id: destroyAllId,
    name: 'テスト・全破壊カード',
    rarity: 'r',
    cost: 5,
    color: 3,
    ability: '召喚時：相手のユニットを全て破壊する',
    originality: 0,
    img: '',
    type: 'unit',
    info: { version: 1, number: 1001 },
    onDrive: EffectExamples.destroyAllOpponents
  });
  driveEffects.push(destroyAllId);

  // テスト用カード3: 破壊時ドロー効果
  const drawOnDestroyId = 'test_draw_on_destroy';
  catalog.set(drawOnDestroyId, {
    id: drawOnDestroyId,
    name: 'テスト・破壊時ドローカード',
    rarity: 'uc',
    cost: 2,
    color: 2,
    ability: '破壊時：カードを1枚引く',
    originality: 0,
    img: '',
    type: 'unit',
    info: { version: 1, number: 1002 },
    onBreak: EffectExamples.drawWhenDestroyed
  });
  breakEffects.push(drawOnDestroyId);

  // テスト用カード4: 選択破壊効果
  const destroySelectId = 'test_destroy_select';
  catalog.set(destroySelectId, {
    id: destroySelectId,
    name: 'テスト・選択破壊カード',
    rarity: 'r',
    cost: 3,
    color: 3,
    ability: '召喚時：相手のユニット1体を対象に選び、破壊する',
    originality: 0,
    img: '',
    type: 'unit',
    info: { version: 1, number: 1003 },
    onDrive: EffectExamples.destroySelected
  });
  driveEffects.push(destroySelectId);

  return {
    driveEffects,
    breakEffects
  };
}

// 実行
if (require.main === module) {
  demonstrateEffectSystem().catch(console.error);
}

export { demonstrateEffectSystem };
