/* eslint-disable import/prefer-default-export */
/* eslint-disable import/extensions */
/** ============================================================================
 * Fichier         : game-init.js
 * Rôle            : Initialisation complète du jeu caché
 * Auteur          : TrackJnr
 * Dernière MAJ    : 23/03/2025
 * ============================================================================
 */

// == Imports des modules nécessaires =======================
import { resetPlayer } from '../entities/player.js';
import { resetObstacles } from '../entities/obstacles.js';
import { resetStats } from './game-stats.js';
import { startGameLoop } from './game-loop.js';
import { logEvent } from '../../../utils/utils.js';

// == Variables internes ====================================
export let canvas;
export let ctx;

/**
 * =============================================================================
 * @function initGameMain
 * Initialise le jeu : canvas, état des entités, démarrage de la boucle.
 * =============================================================================
 */
export function initGameMain() {
  logEvent('info', '[INIT] Initialisation du jeu...');

  // === Récupération du canvas HTML ===
  canvas = document.getElementById('gameCanvas');
  if (!canvas) {
    logEvent('error', '[INIT] Canvas introuvable (#gameCanvas).');
    return;
  }

  // === Contexte 2D (dessin) ===
  ctx = canvas.getContext('2d');
  if (!ctx) {
    logEvent('error', '[INIT] Impossible d’obtenir le contexte 2D.');
    return;
  }

  // === Ajuste les dimensions ===
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  logEvent('success', '[INIT] Canvas dimensionné en plein écran.');

  // === Réinitialisation des composants du jeu ===
  resetPlayer(); // Position, gravité, état du joueur
  resetObstacles(); // Vide tous les obstacles précédents
  resetStats(); // Score, niveau, etc.

  // === Démarrage de la boucle principale ===
  startGameLoop(canvas, ctx); // 👈 On transmet le canvas & contexte au moteur
  logEvent('success', '[INIT] Jeu démarré avec succès ✅');
}
