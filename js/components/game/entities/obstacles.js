/* eslint-disable import/extensions */
/* eslint-disable no-plusplus */
/* ============================================================================
 * Fichier         : obstacles.js
 * Rôle            : Création, gestion et suppression des obstacles
 * Auteur          : TrackJnr
 * Dernière MAJ    : 23/03/2025
 * ============================================================================
 */

import { canvas } from '../core/game-init.js';
import { getStats } from '../core/game-stats.js';

export const obstacles = [];

/**
 * @function spawnObstacle
 * @description Ajoute un nouvel obstacle avec des dimensions aléatoires.
 */
export function spawnObstacle() {
  const height = Math.random() * 30 + 20;
  const obstacle = {
    x: canvas.width,
    y: canvas.height - height - 30,
    width: 20,
    height,
    color: '#e74c3c',
  };

  obstacles.push(obstacle);
}

/**
 * @function updateObstacles
 * @description Déplace et nettoie les obstacles sortis de l'écran.
 */
export function updateObstacles() {
  const { speed } = getStats();

  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obs = obstacles[i];
    obs.x -= speed;

    // Suppression si hors écran
    if (obs.x + obs.width < 0) {
      obstacles.splice(i, 1);
    }
  }
}
