/* eslint-disable import/extensions */
/** ============================================================================
 * Fichier         : game-loop.js
 * Rôle            : Gère la boucle de rendu (animation frame)
 * Auteur          : TrackJnr
 * Dernière MAJ    : 23/03/2025
 * ============================================================================
 */

import { updateGameState } from './game-events.js';
import { renderGame } from '../ui/renderer.js';

let animationFrameId = null; // Identifiant de la frame active

/**
 * @function startGameLoop
 * @description Lance la boucle de jeu avec `requestAnimationFrame`
 */
export function startGameLoop() {
  /**
   * @function loop
   * @description Fonction interne appelée à chaque frame
   */
  function loop() {
    updateGameState(); // ⏱️ Met à jour les positions, états, collisions...
    renderGame(); // 🖼️ Affiche les éléments sur le canvas
    animationFrameId = requestAnimationFrame(loop); // 🔁 Prochaine frame
  }

  animationFrameId = requestAnimationFrame(loop);
  console.info('[Loop] Boucle de jeu démarrée 🌀');
}

/**
 * @function stopGameLoop
 * @description Stoppe la boucle d'animation
 */
export function stopGameLoop() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    console.warn('[Loop] Boucle de jeu arrêtée ⛔');
    animationFrameId = null;
  }
}
