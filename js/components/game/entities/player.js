/* eslint-disable import/extensions */
/** ============================================================================
 * Fichier         : player.js
 * Rôle            : Définition et gestion du joueur
 * Auteur          : TrackJnr
 * Dernière MAJ    : 23/03/2025
 * ============================================================================
 */

import { canvas } from '../core/game-init.js';

export const player = {
  x: 50,
  y: 0,
  width: 30,
  height: 30,
  dy: 0,
  jumping: false,
  color: '#2ecc71',
};

const gravity = 0.6;
const jumpForce = -10;

/**
 * @function updatePlayer
 * @description Met à jour la position et la physique du joueur.
 */
export function updatePlayer() {
  player.dy += gravity;
  player.y += player.dy;

  if (player.y + player.height >= canvas.height - 30) {
    player.y = canvas.height - 30 - player.height;
    player.dy = 0;
    player.jumping = false;
  }
}

/**
 * @function playerJump
 * @description Déclenche le saut si possible.
 */
export function playerJump() {
  if (!player.jumping) {
    player.dy = jumpForce;
    player.jumping = true;
  }
}
