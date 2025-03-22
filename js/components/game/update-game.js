/* eslint-disable import/extensions */
/** ************************************************************************
 * @file update-game.js
 * @description Gère la mise à jour, le rendu, les collisions et le score du jeu
 * @author TrackJnr
 * @version 1.0.1
 ************************************************************************* */

import {
  canvas,
  ctx,
  player,
  gameRunning,
  gravity,
  obstacles,
  score,
} from './start-game.js';
import { logEvent } from '../../utils/utils.js';

/** ************************************************************************
 * 🌀 updateGame - Boucle principale du jeu (appelée à chaque frame)
 ************************************************************************* */
/**
 * @function updateGame
 * @description Met à jour l'état du jeu à chaque frame.
 */
export function updateGame() {
  if (!gameRunning) return;

  // Efface l'écran pour redessiner une nouvelle frame
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  updatePlayer(); // Met à jour le joueur
  updateObstacles(); // Fait défiler les obstacles
  checkCollisions(); // Vérifie les collisions

  displayScore(); // Affiche le score

  requestAnimationFrame(updateGame); // Relance la frame suivante
}

/** ************************************************************************
 * 👾 updatePlayer - Mouvements verticaux et gravité du joueur
 ************************************************************************* */
/**
 * @function updatePlayer
 * @description Met à jour la position et la gravité du joueur.
 */
function updatePlayer() {
  player.dy += gravity; // Application de la gravité
  player.y += player.dy; // Mise à jour verticale

  // Collision avec le sol
  if (player.y + player.height > canvas.height) {
    player.y = canvas.height - player.height;
    player.dy = 0; // Arrêt du saut
  }

  // Affichage du joueur
  ctx.fillStyle = 'blue';
  ctx.fillRect(player.x, player.y, player.width, player.height);
}

/** ************************************************************************
 * 🚧 updateObstacles - Fait défiler et supprime les obstacles
 ************************************************************************* */
/**
 * @function updateObstacles
 * @description Gère les déplacements et la suppression des obstacles.
 */
function updateObstacles() {
  for (let i = 0; i < obstacles.length; i++) {
    const obs = obstacles[i];
    obs.x -= 5; // Déplacement gauche

    ctx.fillStyle = 'red';
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
  }

  // Supprime les obstacles hors écran et augmente le score
  if (obstacles.length > 0 && obstacles[0].x < -50) {
    obstacles.shift(); // Retire le plus ancien
    score++; // Score +1
  }
}

/** ************************************************************************
 * 🏁 displayScore - Affiche le score à l'écran
 ************************************************************************* */
/**
 * @function displayScore
 * @description Affiche le score du joueur sur le canvas.
 */
function displayScore() {
  ctx.fillStyle = 'black';
  ctx.font = '20px Arial';
  ctx.fillText(`Score: ${score}`, 10, 30);
}

/** ************************************************************************
 *  endGame - Affiche Game Over et arrête le jeu
 ************************************************************************* */
/**
 * @function endGame
 * @description Arrête le jeu et affiche le message "Game Over".
 */
function endGame() {
  logEvent('error', '🚨 Fin du jeu !');
  gameRunning = false;

  // Sombre le canvas
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Message central
  ctx.fillStyle = 'white';
  ctx.font = '30px Arial';
  ctx.fillText('Game Over', canvas.width / 2 - 70, canvas.height / 2);
}
/** ************************************************************************
 * 💥 checkCollisions - Collision entre joueur et obstacle
 ************************************************************************* */
/**
 * @function checkCollisions
 * @description Détecte une collision entre le joueur et un obstacle.
 */
function checkCollisions() {
  for (const obs of obstacles) {
    const isColliding = player.x < obs.x + obs.width
      && player.x + player.width > obs.x
      && player.y < obs.y + obs.height
      && player.y + player.height > obs.y;

    if (isColliding) {
      logEvent('error', '💥 Collision détectée !');
      endGame(); // Fin du jeu
      break;
    }
  }
}
