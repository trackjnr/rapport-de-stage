/* eslint-disable import/prefer-default-export */
/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
/**
 * ============================================================================
 * 🎮 FICHIER : main1.js
 * @description Point d’entrée du jeu caché "Cyber Hackrunner"
 * ============================================================================
 */

import { initializeGameCanvas } from './core/game-init.js';
import { setupGameState } from './core/game-state.js';
import { startGameLoop } from './core/game-loop.js';
import { loadAssets } from './ui/assets-loader.js';
import { initKeyboardControls } from './events/keyboard-events.js';
import { log } from './utils/log.js';

/**
 * @function initGameMain
 * @description Fonction d'entrée exportée (appelée depuis main.js au Alt+G)
 */
export function initGameMain() {
  log('🚀 Initialisation du jeu caché...', 'info');

  // Étape 1 : Charge tous les assets graphiques
  loadAssets().then(() => {
    log('🖼️ Assets chargés avec succès.', 'success');

    // Étape 2 : Préparation du canvas, joueur, fond, etc.
    initializeGameCanvas();

    // Étape 3 : Prépare les variables globales et entités initiales
    setupGameState();

    // Étape 4 : Active les contrôles clavier
    initKeyboardControls();

    // Étape 5 : Lancement de la boucle principale
    startGameLoop();

    log('🎮 Jeu "Cyber Hackrunner" lancé !', 'success');
  }).catch((err) => {
    log(`❌ Échec du chargement des assets : ${err.message}`, 'error');
  });
}
