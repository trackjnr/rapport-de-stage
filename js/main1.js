/* eslint-disable import/prefer-default-export */
/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
/**
 * ============================================================================
 * 🎮 FICHIER : main1.js
 * @description Point d’entrée du jeu caché "Cyber Hackrunner"
 * ============================================================================
 */

import { initializeGameCanvas } from './components/game/core/game-init.js';
import { setupGameState } from './components/game/core/game-stats.js';
import { startGameLoop } from './components/game/core/game-loop.js';
import { loadAssets } from './components/game/ui/assets-loader.js';
import { initKeyboardControls } from './events/keyboardHandler.js';
import { logEvent } from './utils/utils.js';

/**
 * @function initGameMain
 * @description Fonction d'entrée exportée (appelée depuis main.js au Alt+G)
 */
export function initGameMain() {
  logEvent(' Initialisation du jeu caché...', 'info');

  // Étape 1 : Charge tous les assets graphiques
  loadAssets().then(() => {
    logEvent(' Assets chargés avec succès.', 'success');

    // Étape 2 : Préparation du canvas, joueur, fond, etc.
    initializeGameCanvas();

    // Étape 3 : Prépare les variables globales et entités initiales
    setupGameState();

    // Étape 4 : Active les contrôles clavier
    initKeyboardControls();

    // Étape 5 : Lancement de la boucle principale
    startGameLoop();

    logEvent(' Jeu "Cyber Hackrunner" lancé !', 'success');
  }).catch((err) => {
    logEvent(`❌ Échec du chargement des assets : ${err.message}`, 'error');
  });
}
