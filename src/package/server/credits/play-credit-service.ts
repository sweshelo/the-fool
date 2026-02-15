import { getSupabaseClient } from '@/package/logging/supabase-client';
import type { PlayerDeck } from '@/submodule/suit/types/game/deck';

export class PlayCreditService {
  /** 強制クレジット消費カードがデッキに含まれるか判定 */
  static containsForceCreditCards(deck: PlayerDeck): boolean {
    const envValue = process.env.FORCE_CREDIT_CARD_IDS;
    if (!envValue) return false;

    const forceCreditCardIds = envValue
      .split(',')
      .map(id => id.trim())
      .filter(Boolean);
    if (forceCreditCardIds.length === 0) return false;

    return deck.cards.some(cardId => forceCreditCardIds.includes(cardId));
  }

  /** プレイ可否チェック */
  async checkEligibility(
    playerId: string,
    mode: string,
    deck?: PlayerDeck
  ): Promise<{ canPlay: boolean; reason?: string; forceCredit?: boolean }> {
    const client = getSupabaseClient();
    if (!client) return { canPlay: false, reason: 'エラーが発生しました' }; // Supabase未設定 → スキップ

    const forceCredit = deck ? PlayCreditService.containsForceCreditCards(deck) : false;

    // 1. ユーザーのクレジット残高を確認（ゲスト判定を兼ねる）
    const { data: credits, error: creditsError } = await client.rpc('get_user_credits', {
      p_user_id: playerId,
    });
    if (creditsError) return { canPlay: false, reason: 'エラーが発生しました' }; // ゲスト → スキップ

    // 強制クレジット消費カードを含む場合: クレジット残高のみで判定
    if (forceCredit) {
      if ((credits ?? 0) > 0) {
        return { canPlay: true, forceCredit: true };
      }
      return { canPlay: false, reason: 'クレジットが不足しています', forceCredit: true };
    }

    // 2. LIMITED_FREE_PLAY が有効なら Limited モードはクレジット不要
    if (mode === 'limited' && process.env.LIMITED_FREE_PLAY === 'true') return { canPlay: true };

    // 3. 1日の無料プレイ上限
    const { data: dailyLimit, error: dailyLimitError } = await client.rpc('get_daily_free_plays');
    if (dailyLimitError) return { canPlay: false, reason: 'エラーが発生しました' };

    // 4. 今日の無料プレイ消費数
    const { data: todayCount, error: todayCountError } = await client.rpc(
      'get_today_free_play_count',
      {
        p_user_id: playerId,
      }
    );
    if (todayCountError) return { canPlay: false, reason: 'エラーが発生しました' };

    const freeRemaining = (dailyLimit ?? 0) - (todayCount ?? 0);
    const totalRemaining = freeRemaining + (credits ?? 0);

    if (totalRemaining <= 0) {
      return { canPlay: false, reason: 'プレイ可能回数が不足しています' };
    }
    return { canPlay: true };
  }

  /** クレジット消費（1試合1回） */
  async consumeCredit(playerId: string, roomId: string): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;

    const { error } = await client.rpc('consume_play_credit', {
      p_user_id: playerId,
      p_deck_id: null,
      p_room_id: roomId,
    });
    if (error) console.error('[Credits] Failed to consume credit:', error);
  }
}
