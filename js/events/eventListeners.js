/**
 * ============================================================================
 * Fichier         : eventListeners.js
 * Rôle            : Centralisation des écouteurs d’événements pour TOUTES les pages
 * Auteur          : TrackJnr
 * Dernière MAJ    : 22/03/2025
 * ============================================================================
 */

import { getCurrentPage, domSelectors } from '../config/domSelectors.js';
import { logEvent } from '../utils/utils.js';

//  Importation des gestionnaires spécifiques par page
import { initContactFormEvents } from '../formulaire/contactform.js';


/**
 * =============================================================================
 * GESTION GLOBALE — Accessible depuis n'importe quelle page
 * =============================================================================
 */
function bindGlobalEvents() {
  logEvent('info', '[Global] Initialisation des écouteurs globaux');

  const menuBtn = domSelectors?.nav?.menuButton;
  const navLinks = domSelectors?.nav?.navLinks;

  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      menuBtn.classList.toggle('active');
      logEvent('info', '[Global] Menu burger togglé');
    });
  }
}

/**
 * =============================================================================
 * PAGE : INDEX
 * =============================================================================
 */
function bindIndexEvents() {
  logEvent('info', '[Index] Aucun listener spécifique à index.html (pour le moment)');
}

/**
 * =============================================================================
 * PAGE : CONTACT
 * =============================================================================
 */
function bindContactEvents() {
  logEvent('info', '[Contact] Initialisation du formulaire de contact');
  initContactFormEvents();
}

/**
 * =============================================================================
 * PAGE : PROJET
 * =============================================================================
 */
function bindProjetEvents() {
  logEvent('info', '[Projet] Activation des onglets dynamiques');
  setupProjetTabs();
}

/**
 * =============================================================================
 * PAGE : CONCLUSION / APROPOS / ETAPES
 * =============================================================================
 */
function bindStaticPagesEvents(pageName) {
  logEvent('info', `[${pageName}] Aucune interaction dynamique prévue pour cette page`);
}

/**
 * =============================================================================
 * ROUTEUR D’ÉCOUTEURS — Redirige vers le bon bind
 * =============================================================================
 */
function dispatchPageSpecificListeners() {
  const currentPage = getCurrentPage();
  logEvent('info', `Dispatching listeners pour la page : ${currentPage}`);

  switch (currentPage) {
    case 'index':
      bindIndexEvents();
      break;
    case 'contact':
      bindContactEvents();
      break;
    case 'projet':
      bindProjetEvents();
      break;
    case 'conclusion':
    case 'apropos':
    case 'etapes-alim':
    case 'etapes-site':
      bindStaticPagesEvents(currentPage);
      break;
    default:
      logEvent('warn', `[Global] Aucune configuration de listeners pour "${currentPage}"`);
  }
}

/**
 * =============================================================================
 * POINT D’ENTRÉE PRINCIPAL : À appeler depuis main.js
 * =============================================================================
 */
export function initializeGlobalEventListeners() {
  document.addEventListener('DOMContentLoaded', () => {
    logEvent('success', '[Global] DOM chargé, initialisation des listeners...');
    bindGlobalEvents();
    dispatchPageSpecificListeners();
  });
}
