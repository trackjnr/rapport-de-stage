/* eslint-disable import/extensions */
/* eslint-disable no-restricted-syntax */
/* eslint-disable import/prefer-default-export */
/** ============================================================================
 * Fichier         : renderer.js
 * Rôle            : Dessin de tous les éléments sur le canvas
 * Auteur          : TrackJnr
 * Dernière MAJ    : 23/03/2025
 * ============================================================================
 */

import { ctx, canvas } from '../core/game-init.js';
import { player } from '../entities/player.js';
import { obstacles } from '../entities/obstacles.js';
import { getStats } from '../core/game-stats.js';

/**
 * @function renderGame
 * @description Dessine l’arrière-plan, le joueur, les obstacles et le score.
 */
export function renderGame() {
  const { score } = getStats();

  // === Fond dynamique ===
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#2980b9');
  gradient.addColorStop(1, '#6dd5fa');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // === Joueur ===
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // === Obstacles ===
  for (const obs of obstacles) {
    ctx.fillStyle = obs.color;
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
  }

  // === Score ===
  ctx.fillStyle = '#fff';
  ctx.font = '20px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`Score: ${score}`, 20, 40);
}
