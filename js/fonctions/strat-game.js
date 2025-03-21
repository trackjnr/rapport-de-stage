/* eslint-disable no-use-before-define */
/** -------------------------------------------------------------------------
- file start-game.js
- description Gestion de l'initialisation et des événements du jeu
- author TrackJnr
- version 1.0
----------------------------------------------------------------------------*/

// ✅ Importation des fonctions nécessaires
import { logEvent } from "../utils/utils.js";
import { updateGame } from "./update-game.js";
/** -------------------------------------------------------------------------
-                      VARIABLES GLOBALES DU JEU
 ------------------------------------------------------------------------- */

export const gameContainer = document.getElementById("game-container");
export const canvas = document.getElementById("gameCanvas");
export const ctx = canvas ? canvas.getContext("2d") : null;

export let gameRunning = false;
export let player = {
  x: 50,
  y: 200,
  width: 30,
  height: 30,
  dy: 0,
};
export const gravity = 0.5;
export let obstacles = [];
export let score = 0;
export let secretCode = "";

/** ************************************************************************
 *                          INITIALISATION DU JEU
 ************************************************************************* */

/**
 * @function startGame
 * @description Initialise le jeu et démarre la boucle de mise à jour.
 */
export function startGame() {
  try {
    // Vérifier si le canvas est bien chargé
    if (!canvas || !ctx) {
      throw new Error("Le canvas ou son contexte est introuvable.");
    }

    logEvent("success", "🎮 Démarrage du jeu !");
    gameRunning = true;
    resetGameData();
    initKeyboardEvents();
    checkGameDependencies();
    requestAnimationFrame(updateGame); // Lancer la boucle du jeu
  } catch (error) {
    logEvent("error", `Erreur au démarrage du jeu: ${error.message}`);
  }
}

/** ************************************************************************
 *                          RÉINITIALISATION DU JEU
 ************************************************************************* */

/**
 * @function resetGameData
 * @description Réinitialise les variables du jeu.
 */
function resetGameData() {
  logEvent("info", "🔄 Réinitialisation du jeu...");
  score = 0;
  obstacles = [];
  player = {
    x: 50,
    y: 200,
    width: 30,
    height: 30,
    dy: 0,
  };
}

/** ************************************************************************
 *                     GESTION DES ÉVÉNEMENTS CLAVIER
 ************************************************************************* */

/**
 * @function initKeyboardEvents
 * @description Initialise les écouteurs d'événements clavier.
 */
function initKeyboardEvents() {
  try {
    document.addEventListener("keydown", handleKeyDown);
    logEvent("success", "🎹 Gestionnaire d'événements clavier ajouté.");
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

/** ************************************************************************
 *                   VÉRIFICATION DES DÉPENDANCES
 ************************************************************************* */

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

    if (typeof updateGame !== "function") {
      throw new Error("La fonction updateGame() est introuvable !");
    }
    logEvent("success", "✅ La fonction updateGame() est bien importée.");
  } catch (error) {
    logEvent("error", `Vérification échouée: ${error.message}`);
  }
}

/** ************************************************************************
 *                      DÉMARRAGE AUTOMATIQUE DU JEU
 ************************************************************************* */

logEvent("success", "✅ Script chargé avec succès !");
startGame();
