/**************************************************************************
 * @file script.js
 * @description Gestion principale du jeu (initialisation, événements, logs)
 * @author Trackozor
 * @version 1.0
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
export let player = { x: 50, y: 200, width: 30, height: 30, dy: 0 };
export let gravity = 0.5;
export let obstacles = [];
export let score = 0;
export let secretCode = "";

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
    logEvent("success", "🎮 Jeu prêt à être lancé !");
  } catch (error) {
    logEvent(
      "error",
      `Erreur lors de l'initialisation du jeu: ${error.message}`,
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
  player = { x: 50, y: 200, width: 30, height: 30, dy: 0 };
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

  if (e.code === "Space" && gameRunning) {
    player.dy = -7; // Saut du joueur
    logEvent("success", "🕹️ Le joueur saute !");
  }

  // Ajout du code secret pour débloquer le jeu
  secretCode += e.key.toLowerCase();
  logEvent("info", `Code secret en cours : ${secretCode}`);

  if (secretCode.endsWith("play")) {
    logEvent("success", "🎮 Code secret activé, relance du jeu !");
    startGame();
    secretCode = ""; // Réinitialisation
  }
}

/**************************************************************************
 *                      VÉRIFICATION DES DÉPENDANCES
 **************************************************************************/

/**
 * @function checkGameDependencies
 * @description Vérifie la présence des éléments et des fonctions nécessaires au jeu.
 */
function checkGameDependencies() {
  try {
    if (!canvas || !ctx) {
      throw new Error("Le canvas ou son contexte est introuvable.");
    }
    logEvent("success", "✅ Canvas et contexte détectés.");
  } catch (error) {
    logEvent("error", `Vérification échouée: ${error.message}`);
  }
}

/**************************************************************************
 *                      DÉMARRAGE AUTOMATIQUE DU JEU
 **************************************************************************/

logEvent("success", "✅ Script chargé avec succès !");
initGame();
