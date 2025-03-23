/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
/** ============================================================================
 * Fichier         : player.js
 * Rôle            : Définition et gestion du joueur
 * Auteur          : TrackJnr
 * Dernière MAJ    : 23/03/2025
 * ============================================================================
 */

import { ctx, canvas } from '../core/game-init.js';
import { logEvent } from '../../../utils/utils.js';

/* ========================= */
/*  Données du Joueur       */
/* ========================= */
export const player = {
  x: 50,
  y: 0,
  width: 40,
  height: 60,
  dy: 0,
  gravity: 0.8,
  jumpForce: -13,
  jumping: false,
  sprite: new Image(),
};

// Chargement de l'image sprite personnalisée
player.sprite.src = '../../../../assets/webp/robot.webp'; // Remplace par ton sprite réel
player.sprite.onload = () => {
  logEvent('info', '[Player] Sprite chargé avec succès.');
};

/* ========================= */
/*  Mise à jour du Joueur   */
/* ========================= */
export function updatePlayer() {
  player.dy += player.gravity;
  player.y += player.dy;

  // Limite au sol
  const ground = canvas.height - player.height - 40; // Décalage bas
  if (player.y > ground) {
    player.y = ground;
    player.dy = 0;
    player.jumping = false;
  }
}

/* ========================= */
/*  Affichage du Joueur     */
/* ========================= */

/**
 * Affiche le robot sur le canvas
 */
export function renderPlayer() {
  ctx.drawImage(player.image, player.x, player.y, player.width, player.height);
}
/* ========================= */
/*  Contrôle du saut        */
/* ========================= */
export function handlePlayerJump() {
  if (!player.jumping) {
    player.dy = player.jumpForce;
    player.jumping = true;
    logEvent('success', '[Player] Saut effectué !');
  }
}
/**
 * @function resetPlayer
 * @description Réinitialise la position, vitesse et état du joueur.
 */
export function resetPlayer() {
  player.x = 50;
  player.y = 0;
  player.dy = 0;
  player.jumping = false;
}
