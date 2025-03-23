/* eslint-disable import/prefer-default-export */
/* eslint-disable import/extensions */
/** ============================================================================
 * Fichier         : game-over.js
 * Rôle            : Affichage de l'écran "Game Over"
 * Auteur          : TrackJnr
 * Dernière MAJ    : 23/03/2025
 * ============================================================================
 */

import { ctx, canvas } from '../core/game-init.js';
import { getStats } from '../core/game-stats.js';

/**
 * @function drawGameOver
 * @description Affiche un écran "Game Over" semi-transparent avec le score.
 */
export function triggerGameOver() {
  const { score } = getStats();

  // Fond assombri
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Texte principal
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 36px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('💥 GAME OVER 💥', canvas.width / 2, canvas.height / 2 - 20);

  // Score
  ctx.font = '24px monospace';
  ctx.fillText(`Score : ${score}`, canvas.width / 2, canvas.height / 2 + 30);
}
