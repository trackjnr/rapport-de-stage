/* eslint-disable import/extensions */
/* eslint-disable import/prefer-default-export */
/**  ============================================================================
 * Fichier         : game-events.js
 * Rôle            : Met à jour les entités du jeu à chaque frame
 * Auteur          : TrackJnr
 * Dernière MAJ    : 23/03/2025
 * ============================================================================
 */

import { player, updatePlayer } from '../entities/player.js';
import { obstacles, spawnObstacle, updateObstacles } from '../entities/obstacles.js';
import { checkCollision } from './collision.js';
import { triggerGameOver } from '../ui/game-over.js';
import { updateScore } from './game-stats.js';

/**
 * @function updateGameState
 * @description Gère toute la logique de mise à jour du jeu à chaque frame
 */
export function updateGameState() {
  // Mise à jour du joueur
  updatePlayer();

  // Mise à jour et déplacement des obstacles
  updateObstacles();

  // Génération aléatoire de nouveaux obstacles
  spawnObstacle();

  // Vérification des collisions
  if (obstacles.some((obs) => checkCollision(player, obs))) {
    triggerGameOver();
  }

  // Mise à jour du score
  updateScore();
}
