/* eslint-disable import/prefer-default-export */
/* eslint-disable no-console */
/**
 * ============================================================================
 * 📁 FICHIER : assets-loader.js
 * @description Gère le préchargement des assets graphiques pour Cyber Hackrunner
 * Auteur      : TrackJnr
 * Dernière MAJ: 23/03/2025
 * ============================================================================
 */

import { logEvent } from '../../../utils/utils.js';

// Liste des assets à précharger (images, icônes, sprites, etc.)
const assetsToLoad = {
  player: './assets/game/robot-runner.png',
  background: './assets/game/background.jpg',
  obstacleIcon1: './assets/game/windows-icon-1.png',
  obstacleIcon2: './assets/game/windows-icon-2.png',
  // Ajoute d'autres éléments ici...
};

// Objet global pour accéder aux images préchargées
export const loadedAssets = {};

/**
 * ============================================================================
 * @function loadAllGameAssets
 * @description Précharge tous les assets nécessaires au jeu
 * @returns {Promise<void>} - Résolue quand tous les assets sont chargés
 * ============================================================================
 */
export function loadAllGameAssets() {
  return new Promise((resolve, reject) => {
    let loadedCount = 0;
    const totalAssets = Object.keys(assetsToLoad).length;

    if (totalAssets === 0) {
      resolve(); // Aucun asset à charger
      return;
    }

    Object.entries(assetsToLoad).forEach(([key, src]) => {
      const img = new Image();
      img.src = src;

      img.onload = () => {
        loadedAssets[key] = img;
        logEvent(`[Assets] Image chargée : ${src}`, 'info');

        loadedCount++;
        if (loadedCount === totalAssets) {
          resolve(); // Tous les assets sont chargés
        }
      };

      img.onerror = (err) => {
        logEvent(`[Assets] Échec du chargement : ${src}`, 'error');
        reject(new Error(`Erreur de chargement de l’asset : ${src}`));
      };
    });
  });
}
