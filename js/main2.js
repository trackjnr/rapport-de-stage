/* eslint-disable import/extensions */
/** ************************************************************************
 * @file script.js
 * @description Gestion principale du jeu (obstacles, joueur, score)
 *              ➜ Contient la logique centrale du mini-jeu caché
 * @author Trackozor
 * ************************************************************************ */

import { startGame } from './components/game/start-game.js';
import { logEvent } from './utils/utils.js';

/** ************************************************************************
 *                    🎮 SÉLECTEURS & CONTEXTE DU CANVAS
 * ************************************************************************ */

// Récupère le conteneur principal du jeu
export const gameContainer = document.getElementById('game-container');

// Récupère l'élément canvas
export const canvas = document.getElementById('gameCanvas');

// Initialisation du contexte 2D du canvas
export let ctx = null;
if (!canvas) {
  logEvent('error', "❌ L'élément #gameCanvas est introuvable !");
} else {
  ctx = canvas.getContext('2d');
  logEvent('success', '✅ Canvas détecté et contexte 2D récupéré.');
}

/** ************************************************************************
 *                    🌍 VARIABLES GLOBALES DU JEU
 * ************************************************************************ */

export const gameRunning = false; // Indique si le jeu est actif
export const player = { x: 50 }; // Position horizontale initiale du joueur
export const obstacles = []; // Liste des obstacles à éviter
export const score = 0; // Score du joueur
export const secretCode = ''; // (réservé pour un cheat code ou easter egg)

export let obstacleInterval; // Intervalle pour générer les obstacles
export let scoreInterval; // Intervalle pour incrémenter le score

let obstacleSpeed = 5; // Vitesse de déplacement des obstacles
let spawnRate = 1200; // Temps (ms) entre deux apparitions d’obstacle

/** ************************************************************************
 * 🔄 resetGameData - Réinitialisation complète des variables du jeu
 * ************************************************************************ */
/**
 * @function resetGameData
 * @description Réinitialise l’état du jeu (score, obstacles, etc.)
 */
function resetGameData() {
  logEvent('info', '🔄 Réinitialisation des données du jeu...');
  gameRunning = false;
  score = 0;
  obstacles.length = 0;
}

/** ************************************************************************
 * 🎹 initKeyboardEvents - Active les contrôles clavier pour sauter
 * ************************************************************************ */
/**
 * @function initKeyboardEvents
 * @description Initialise les écouteurs clavier pour gérer le saut
 */
function initKeyboardEvents() {
  try {
    document.addEventListener('keydown', handleKeyDown);
    logEvent('success', "🎹 Gestionnaire d'événements clavier activé.");
  } catch (error) {
    logEvent('error', "Erreur lors de l'ajout des événements clavier.", { error });
  }
}

/** ************************************************************************
 * 🎯 handleKeyDown - Gère les actions lors de la pression d'une touche
 * ************************************************************************ */
/**
 * @function handleKeyDown
 * @param {KeyboardEvent} e - L’événement clavier déclenché
 * @description Si la barre espace est pressée, le joueur saute
 */
function handleKeyDown(e) {
  logEvent('info', `Touche pressée: ${e.code}`);

  if (e.code === 'Space' && !player.jumping) {
    player.dy = -7;
    player.jumping = true;
    logEvent('success', '🕹️ Le joueur saute !');
  }
}

/** ************************************************************************
 * 🚧 startObstacleGeneration - Gère l’apparition dynamique des obstacles
 * ************************************************************************ */
/**
 * @function startObstacleGeneration
 * @description Génère des obstacles à intervalles réguliers
 */
function startObstacleGeneration() {
  clearInterval(obstacleInterval);
  obstacleInterval = setInterval(() => {
    if (gameRunning) {
      const randomHeight = Math.random() * 20 + 20;
      const obstacle = {
        x: canvas.width,
        y: 220,
        width: 20,
        height: randomHeight,
      };
      obstacles.push(obstacle);
      logEvent('info', '🚧 Nouvel obstacle ajouté !');
    }
  }, spawnRate);
}

/** ************************************************************************
 * 🧮 startScoreIncrement - Incrémente le score & adapte la difficulté
 * ************************************************************************ */
/**
 * @function startScoreIncrement
 * @description Augmente le score du joueur chaque seconde et ajuste la difficulté
 */
function startScoreIncrement() {
  clearInterval(scoreInterval);
  scoreInterval = setInterval(() => {
    if (gameRunning) {
      score += 10;

      // Tous les 100 points, on augmente la difficulté
      if (score % 100 === 0) {
        obstacleSpeed += 1;
        spawnRate = Math.max(500, spawnRate - 50);
        startObstacleGeneration(); // Recalibrer le spawn
      }
    }
  }, 1000);
}

/** ************************************************************************
 * 🖼️ updateGame - Rafraîchit le canvas et gère les collisions
 * ************************************************************************ */
/**
 * @function updateGame
 * @description Boucle principale de dessin et de logique du jeu
 */
function updateGame() {
  if (!gameRunning) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Mise à jour verticale du joueur
  player.y += player.dy;
  player.dy += gravity;

  // Le joueur touche le sol
  if (player.y > 220) {
    player.y = 220;
    player.jumping = false;
  }

  // Affiche le joueur
  ctx.fillStyle = 'green';
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // Affiche et gère les obstacles
  ctx.fillStyle = 'red';
  for (let i = 0; i < obstacles.length; i++) {
    const obs = obstacles[i];
    obs.x -= obstacleSpeed;
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

    // Supprime les obstacles sortis de l’écran
    if (obs.x + obs.width < 0) {
      obstacles.splice(i, 1);
    }

    // Collision joueur/obstacle
    const collision = player.x < obs.x + obs.width
      && player.x + player.width > obs.x
      && player.y < obs.y + obs.height
      && player.y + player.height > obs.y;

    if (collision) {
      gameRunning = false;
      clearInterval(obstacleInterval);
      clearInterval(scoreInterval);
      alert(`💥 Game Over! Score: ${score}`);
      document.location.reload();
    }
  }

  // Affiche le score
  ctx.fillStyle = 'black';
  ctx.font = '24px Arial';
  ctx.fillText(`Score: ${score}`, 20, 50);

  // Relance la boucle
  requestAnimationFrame(updateGame);
}

/** ************************************************************************
 * 🚀 initGame - Point d’entrée du jeu : initialise tout
 * ************************************************************************ */
/**
 * @function initGame
 * @description Démarre le jeu : reset, écouteurs, boucles, animation
 */
export function initGame() {
  try {
    logEvent('info', '🔄 Initialisation du jeu...');
    resetGameData();
    initKeyboardEvents();
    gameRunning = true;
    startObstacleGeneration();
    startScoreIncrement();
    updateGame();
    logEvent('success', '🎮 Jeu prêt à être lancé !');
  } catch (error) {
    logEvent('error', `Erreur lors de l'initialisation du jeu: ${error.message}`);
  }
}
