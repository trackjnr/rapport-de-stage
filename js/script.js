/**************************************************************************
 * @file script.js
 * @description Gestion principale du jeu (alignement obstacles & difficulté progressive)
 * @author Trackozor
 * @version 1.7 (Correction de l'alignement des obstacles avec le joueur)
 **************************************************************************/

// ✅ Importation des fonctions nécessaires
import { startGame } from "./functions/start-game.js";
import { logEvent } from "./utils/utils.js";

/**************************************************************************
 *                      SÉLECTION DES ÉLÉMENTS HTML
 **************************************************************************/

export const gameContainer = document.getElementById("game-container");
export const canvas = document.getElementById("gameCanvas");

// ✅ Vérification du canvas et du contexte 2D
export let ctx = null;

if (!canvas) {
  logEvent("error", "❌ L'élément #gameCanvas est introuvable !");
} else {
  ctx = canvas.getContext("2d");
  logEvent("success", "✅ Canvas détecté et contexte 2D récupéré.");
}

/**************************************************************************
 *                      VARIABLES GLOBALES DU JEU
 **************************************************************************/

export let gameRunning = false;
export let player = {
  x: 50,
  y: 220,
  width: 30,
  height: 30,
  dy: 0,
  jumping: false,
};
export let gravity = 0.5;
export let obstacles = [];
export let score = 0;
export let secretCode = "";
export let obstacleInterval;
export let scoreInterval;
let obstacleSpeed = 5; // Vitesse initiale des obstacles
let spawnRate = 1200; // Temps d'apparition des obstacles (ms)

/**************************************************************************
 *                      INITIALISATION DU JEU
 **************************************************************************/

/**
 * @function initGame
 * @description Initialise les événements et vérifie les dépendances.
 */
export function initGame() {
  try {
    logEvent("info", "🔄 Initialisation du jeu...");
    resetGameData();
    initKeyboardEvents();
    gameRunning = true;
    startObstacleGeneration();
    startScoreIncrement();
    updateGame();
    logEvent("success", "🎮 Jeu prêt à être lancé !");
  } catch (error) {
    logEvent(
      "error",
      `Erreur lors de l'initialisation du jeu: ${error.message}`
    );
  }
}

/**************************************************************************
 *                      RÉINITIALISATION DU JEU
 **************************************************************************/

/**
 * @function resetGameData
 * @description Réinitialise les variables du jeu.
 */
function resetGameData() {
  logEvent("info", "🔄 Réinitialisation des données du jeu...");
  gameRunning = false;
  score = 0;
  obstacles = [];
  player = { x: 50, y: 220, width: 30, height: 30, dy: 0, jumping: false };
  obstacleSpeed = 5;
  spawnRate = 1200;
}

/**************************************************************************
 *                      GESTION DES ÉVÉNEMENTS CLAVIER
 **************************************************************************/

/**
 * @function initKeyboardEvents
 * @description Initialise les écouteurs d'événements clavier.
 */
function initKeyboardEvents() {
  try {
    document.addEventListener("keydown", handleKeyDown);
    logEvent("success", "🎹 Gestionnaire d'événements clavier activé.");
  } catch (error) {
    logEvent("error", "Erreur lors de l'ajout des événements clavier.", {
      error,
    });
  }
}

/**
 * @function handleKeyDown
 * @description Gère les entrées clavier du joueur.
 * @param {KeyboardEvent} e - Événement de touche enfoncée.
 */
function handleKeyDown(e) {
  logEvent("info", `Touche pressée: ${e.code}`);

  if (e.code === "Space" && !player.jumping) {
    player.dy = -7;
    player.jumping = true;
    logEvent("success", "🕹️ Le joueur saute !");
  }
}

/**************************************************************************
 *                      GÉNÉRATION DES OBSTACLES (ALIGNÉS AU SOL)
 **************************************************************************/

function startObstacleGeneration() {
  clearInterval(obstacleInterval);
  obstacleInterval = setInterval(() => {
    if (gameRunning) {
      let randomHeight = Math.random() * 20 + 20; // Hauteur variable
      let obstacle = {
        x: canvas.width,
        y: 220,
        width: 20,
        height: randomHeight,
      };
      obstacles.push(obstacle);
      logEvent("info", "🚧 Nouvel obstacle ajouté !");
    }
  }, spawnRate);
}

function startScoreIncrement() {
  clearInterval(scoreInterval);
  scoreInterval = setInterval(() => {
    if (gameRunning) {
      score += 10;
      if (score % 100 === 0) {
        obstacleSpeed += 1; // Augmente la vitesse des obstacles
        spawnRate = Math.max(500, spawnRate - 50); // Réduit le temps d'apparition
        startObstacleGeneration();
      }
    }
  }, 1000);
}

function updateGame() {
  if (!gameRunning) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  player.y += player.dy;
  player.dy += gravity;
  if (player.y > 220) {
    player.y = 220;
    player.jumping = false;
  }

  ctx.fillStyle = "green";
  ctx.fillRect(player.x, player.y, player.width, player.height);

  ctx.fillStyle = "red";
  for (let i = 0; i < obstacles.length; i++) {
    let obs = obstacles[i];
    obs.x -= obstacleSpeed;
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

    if (obs.x + obs.width < 0) {
      obstacles.splice(i, 1);
    }

    if (
      player.x < obs.x + obs.width &&
      player.x + player.width > obs.x &&
      player.y < obs.y + obs.height &&
      player.y + player.height > obs.y
    ) {
      gameRunning = false;
      clearInterval(obstacleInterval);
      clearInterval(scoreInterval);
      alert("Game Over! Score: " + score);
      document.location.reload();
    }
  }

  ctx.fillStyle = "black";
  ctx.font = "24px Arial";
  ctx.fillText("Score: " + score, 20, 50);

  requestAnimationFrame(updateGame);
}

/**************************************************************************
 *                      DÉMARRAGE AUTOMATIQUE DU JEU
 **************************************************************************/

logEvent("success", "✅ Script chargé avec succès !");
initGame();
