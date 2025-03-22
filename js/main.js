/* eslint-disable import/extensions */
/**
 * ============================================================================
 * Fichier         : main.js
 * Rôle            : Point d’entrée principal de l’application
 * Auteur          : TrackJnr
 * Dernière MAJ    : 22/03/2025
 * ============================================================================
 */

import { initializeGlobalEventListeners } from './events/eventListeners.js';
import { refreshSelectors } from './config/domSelectors.js';
import { logEvent } from './utils/utils.js';
import { initGameMain } from './main2.js'; // ✅ Import statique propre

/**
 * =============================================================================
 *  Simulation de site "cassé"
 * =============================================================================
 */
function simulateSystemBreak() {
  document.body.classList.add('glitch-effect');

  const overlay = document.createElement('div');
  overlay.className = 'crash-overlay';
  overlay.innerText = 'ERREUR CRITIQUE… INIT GAME MODE';
  document.body.appendChild(overlay);

  setTimeout(() => {
    overlay.remove();
    document.body.classList.remove('glitch-effect');
  }, 4000);
}
/**
 * =============================================================================
 * 🎮 Déclencheur secret : Alt + F12 = Jeu Caché + Simulation de panne
 * =============================================================================
 */
function enableSecretGameTrigger() {
  let triggered = false;

  document.addEventListener('keydown', (e) => {
    if (e.altKey && e.code === 'F12' && !triggered) {
      triggered = true;

      logEvent('secret', '[SECRET] Combo détecté : Alt + F12');

      // 💥 Ajout d’un effet visuel de type "site cassé"
      simulateSystemBreak();

      // ✅ Lancement direct du jeu
      try {
        initGameMain();
        logEvent('success', '[SECRET] Jeu caché lancé avec succès !');
      } catch (err) {
        logEvent('error', '[SECRET] Échec du lancement du jeu caché.', err);
      }
    }
  });
}
/**
 * =============================================================================
 * INITIALISATION GÉNÉRALE
 * =============================================================================
 */
function initializeApp() {
  logEvent('info', '[App] Initialisation générale...');
  refreshSelectors();
  initializeGlobalEventListeners();
  enableSecretGameTrigger(); // 🎮 Active le raccourci secret
  logEvent('success', '[App] Application initialisée avec succès !');
}

/**
 * =============================================================================
 * Exécution après chargement du DOM
 * =============================================================================
 */
document.addEventListener('DOMContentLoaded', initializeApp);
