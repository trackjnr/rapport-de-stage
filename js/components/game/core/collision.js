/* eslint-disable import/prefer-default-export */
/* eslint-disable import/extensions */
/** ============================================================================
 * Fichier         : collision.js
 * Rôle            : Détection des collisions entre le joueur et les obstacles
 * Auteur          : TrackJnr
 * Dernière MAJ    : 23/03/2025
 * ============================================================================
 */

import { logEvent } from '../../../utils/utils.js';

/**
 * @function checkCollision
 * @description Détecte si deux entités (joueur et obstacle) se superposent.
 * @param {Object} player - Entité joueur avec position et dimensions
 * @param {Object} obstacle - Entité obstacle avec position et dimensions
 * @returns {boolean} - true si collision détectée, false sinon
 */
export function checkCollision(player, obstacle) {
  const collided = player.x < obstacle.x + obstacle.width
    && player.x + player.width > obstacle.x
    && player.y < obstacle.y + obstacle.height
    && player.y + player.height > obstacle.y;

  if (collided) {
    logEvent('error', '💥 Collision détectée entre le joueur et un obstacle !', {
      player,
      obstacle,
    });
  }

  return collided;
}
