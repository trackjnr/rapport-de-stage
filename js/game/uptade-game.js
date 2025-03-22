/**************************************************************************
 * @file update-game.js
 * @description Gère la mise à jour et le rendu du jeu
 * @author TrackJnr
 * @version 1.0
 **************************************************************************/

import {
  canvas,
  ctx,
  player,
  gameRunning,
  gravity,
  obstacles,
  score,
} from "./start-game.js";
import { logEvent } from "../utils/utils.js";

/**************************************************************************
 *                          MISE À JOUR DU JEU
 **************************************************************************/

/**
 * @function updateGame
 * @description Met à jour l'état du jeu à chaque frame.
 */
export function updateGame() {
  if (!gameRunning) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height); // Efface l'écran

  updatePlayer();
  updateObstacles();
  checkCollisions();

  displayScore();

  requestAnimationFrame(updateGame); // Boucle de mise à jour
}

/**************************************************************************
 *                         GESTION DU JOUEUR
 **************************************************************************/

/**
 * @function updatePlayer
 * @description Met à jour la position du joueur.
 */
function updatePlayer() {
  player.dy += gravity;
  player.y += player.dy;

  if (player.y + player.height > canvas.height) {
    player.y = canvas.height - player.height;
    player.dy = 0;
  }

  ctx.fillStyle = "blue";
  ctx.fillRect(player.x, player.y, player.width, player.height);
}

/**************************************************************************
 *                         GESTION DES OBSTACLES
 **************************************************************************/

/**
 * @function updateObstacles
 * @description Gère les obstacles et leur déplacement.
 */
function updateObstacles() {
  for (let i = 0; i < obstacles.length; i++) {
    let obs = obstacles[i];
    obs.x -= 5; // Défilement vers la gauche

    ctx.fillStyle = "red";
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
  }

  if (obstacles.length > 0 && obstacles[0].x < -50) {
    obstacles.shift(); // Supprime les obstacles hors écran
    score++; // Augmente le score
  }
}

/**************************************************************************
 *                      DÉTECTION DES COLLISIONS
 **************************************************************************/

/**
 * @function checkCollisions
 * @description Vérifie les collisions entre le joueur et les obstacles.
 */
function checkCollisions() {
  for (let obs of obstacles) {
    if (
      player.x < obs.x + obs.width &&
      player.x + player.width > obs.x &&
      player.y < obs.y + obs.height &&
      player.y + player.height > obs.y
    ) {
      logEvent("error", "💥 Collision détectée !");
      endGame();
    }
  }
}

/**************************************************************************
 *                      AFFICHAGE DU SCORE
 **************************************************************************/

/**
 * @function displayScore
 * @description Affiche le score actuel.
 */
function displayScore() {
  ctx.fillStyle = "black";
  ctx.font = "20px Arial";
  ctx.fillText(`Score: ${score}`, 10, 30);
}

/**************************************************************************
 *                      GESTION DE FIN DE JEU
 **************************************************************************/

/**
 * @function endGame
 * @description Met fin au jeu et affiche un message.
 */
function endGame() {
  logEvent("error", "🚨 Fin du jeu !");
  gameRunning = false;

  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.fillText("Game Over", canvas.width / 2 - 70, canvas.height / 2);
}
