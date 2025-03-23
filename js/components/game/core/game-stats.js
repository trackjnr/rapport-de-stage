/* eslint-disable import/extensions */
/** ============================================================================
 * Fichier         : game-stats.js
 * Rôle            : Gestion des statistiques du jeu (score, vitesse, difficulté)
 * Auteur          : TrackJnr
 * Dernière MAJ    : 23/03/2025
 * ============================================================================
 */

import { logEvent } from '../../../utils/utils.js';

// ========== Variables internes ==========
let score = 0;
let speed = 5;
let spawnRate = 1200;
const difficultyThreshold = 100;

/**
 * @function resetStats
 * @description Réinitialise les statistiques à leur état initial.
 */
export function resetStats() {
  score = 0;
  speed = 5;
  spawnRate = 1200;
  logEvent('info', '[Stats] Statistiques remises à zéro.');
}
/**
 * @function increaseDifficulty
 * @description Augmente la vitesse et réduit le taux de spawn.
 */
function increaseDifficulty() {
  speed += 1;
  spawnRate = Math.max(400, spawnRate - 50);
  logEvent('info', `[Stats] Difficulté augmentée : vitesse = ${speed}, spawn = ${spawnRate}ms`);
}
/**
 * @function incrementScore
 * @description Incrémente le score et ajuste la difficulté si nécessaire.
 * @returns {number} - Score actuel après incrément.
 */
export function incrementScore() {
  score += 10;

  if (score % difficultyThreshold === 0) {
    increaseDifficulty();
  }

  return score;
}
/**
 * @function updateScore
 * @description Met à jour l'affichage du score sur le canvas.
 * Appelée dans la boucle de jeu à chaque frame.
 * 
 * @param {CanvasRenderingContext2D} ctx - Le contexte 2D du canvas
 */
export function updateScore(ctx) {
  const { score } = getStats();

  ctx.fillStyle = '#fff'; // Blanc ou à adapter selon ton fond
  ctx.font = '20px "Press Start 2P", monospace'; // Style arcade
  ctx.textAlign = 'left';
  ctx.fillText(`Score : ${score}`, 20, 30);
}

/**
 * @function getStats
 * @description Retourne un snapshot des statistiques du jeu.
 * @returns {Object} - Données actuelles du jeu (score, vitesse, spawnRate)
 */
export function getStats() {
  return {
    score,
    speed,
    spawnRate,
  };
}
