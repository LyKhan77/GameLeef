/**
 * Game Leef - Bridge SDK for HTML Games
 * 
 * PANDUAN PENGGUNAAN DI DALAM GAME HTML5:
 * Cukup tambahkan kode berikut di game Anda saat pemain mencetak skor atau game over:
 * 
 * ```javascript
 * // Kirim skor ke Game Leef parent window
 * if (window.parent) {
 *   window.parent.postMessage({
 *     type: 'GAMELEEF_SUBMIT_SCORE',
 *     gameId: 'leef-jumper', // ID game sesuai games.ts
 *     score: currentScore,
 *     data: { level: 5, coins: 20 }
 *   }, '*');
 * }
 * ```
 */

export interface GameBridgeScoreMessage {
  type: 'GAMELEEF_SUBMIT_SCORE';
  gameId: string;
  score: number;
  data?: Record<string, unknown>;
}

export interface GameBridgeEventMessage {
  type: 'GAMELEEF_EVENT';
  gameId: string;
  event: 'START' | 'PAUSE' | 'RESUME' | 'GAME_OVER';
  data?: Record<string, unknown>;
}

export type GameBridgeMessage = GameBridgeScoreMessage | GameBridgeEventMessage;
