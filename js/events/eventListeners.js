/**
 * ============================================================================
 * Fichier         : eventListeners.js
 * Rôle            : Centralisation des écouteurs d’événements pour TOUTES les pages
 * Auteur          : TrackJnr
 * Dernière MAJ    : 23/03/2025
 * ============================================================================
 */

import { getCurrentPage, domSelectors } from '../config/domSelectors.js';
import { logEvent } from '../utils/utils.js';
import { initvalidform } from '../components/formulaire/contactform.js';
import { initGameMain } from '../components/game/core/game-init.js';
import { handleKeyboardEvent } from './keyboardHandler.js';
import {
  handleModalConfirm,
  handleFormSubmit,
} from './eventHandler.js';

/** ============================================================================
 * INIT GLOBAL — Menu burger & Clavier
 * ============================================================================
 */
function bindGlobalEvents() {
  logEvent('info', '[Global] Initialisation des écouteurs globaux');

  const menuBtn = domSelectors.nav.menuButton;
  const {navLinks} = domSelectors.nav;

  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      menuBtn.classList.toggle('active');
      logEvent('info', '[Global] Menu burger togglé');
    });
  }

  // Écouteur clavier global (accessibilité, navigation lightbox, etc.)
  document.addEventListener('keydown', handleKeyboardEvent);
  logEvent('success', '[Global] Écouteur clavier actif');
}

/** ============================================================================
 * INDEX.HTML
 * ============================================================================
 */
function bindIndexEvents() {
  const cards = document.querySelectorAll('.card-link');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      logEvent('info', '[Index] Navigation vers un projet');
    });
  });

  const {gameLauncher} = domSelectors.game;
  if (gameLauncher) {
    gameLauncher.addEventListener('click', () => {
      logEvent('info', '[Index] Lancement du jeu caché');
      initGameMain();
    });
  }
}

/** ============================================================================
 * CONTACT.HTML
 * ============================================================================
 */
function bindContactEvents() {
  const contactForm = domSelectors.contact.form;
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      initvalidform();
    });
    logEvent('info', '[Contact] Écouteur sur formulaire OK');
  }
}

/** ============================================================================
 * PROJET.HTML
 * ============================================================================
 */
function bindProjetEvents() {
  logEvent('info', '[Projet] Initialisation des onglets dynamiques');
  setupTabSwitching();
  setupLightbox();

}

/** ============================================================================
 * APROPOS.HTML
 * ============================================================================
 */
function bindAproposEvents() {
  const teamLinks = domSelectors?.apropos?.teamLinks || [];
  teamLinks.forEach(link => {
    link.addEventListener('mouseenter', () => {
      link.classList.add('hovered');
    });
    link.addEventListener('mouseleave', () => {
      link.classList.remove('hovered');
    });
  });

  const externalLink = domSelectors?.apropos?.externalLink;
  if (externalLink) {
    externalLink.addEventListener('click', () => {
      logEvent('info', '[À Propos] Redirection vers site externe');
    });
  }

  logEvent('success', '[Apropos] Événements hover & clic initialisés');
}

/** ============================================================================
 * ETAPES / CONCLUSION / PAGES STATIQUES
 * ============================================================================
 */
function bindStaticPagesEvents(pageName) {
  logEvent('info', `[${pageName}] Aucune interaction dynamique prévue`);
}

/** ============================================================================
 * ROUTEUR D’ÉCOUTEURS — Détecte la page en cours et applique les listeners
 * ============================================================================
 */
function dispatchPageSpecificListeners() {
  const currentPage = getCurrentPage();
  logEvent('info', `[Router] Dispatch vers : ${currentPage}`);

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
    case 'apropos':
      bindAproposEvents();
      break;
    case 'conclusion':
    case 'etapes-alim':
    case 'etapes-site':
      bindStaticPagesEvents(currentPage);
      break;
    default:
      logEvent('warn', `[Router] Aucun bind prévu pour : "${currentPage}"`);
  }
}
// ============================
// Fonction : setupTabSwitching
// ============================

export function setupTabSwitching() {
  const allTabButtons = document.querySelectorAll(".tab-button");
  const allTabContents = document.querySelectorAll(".tab-content");

  if (!allTabButtons.length || !allTabContents.length) {
    console.warn("Aucun onglet trouvé à initialiser.");
    return;
  }

  allTabButtons.forEach(button => {
    button.addEventListener("click", () => {
      const targetId = button.getAttribute("data-tab");

      if (!targetId) return;

      // Récupère le conteneur parent de la carte projet
      const projectCard = button.closest(".project-card");

      // 🔹 Onglets et contenus dans ce seul projet
      const tabButtons = projectCard.querySelectorAll(".tab-button");
      const tabContents = projectCard.querySelectorAll(".tab-content");

      // 🔄 Désactive tous les boutons
      tabButtons.forEach(btn => btn.classList.remove("active"));

      // 🔄 Masque tous les contenus
      tabContents.forEach(content => content.classList.remove("active"));

      // ✅ Active le bouton cliqué
      button.classList.add("active");

      // ✅ Affiche le bon contenu
      const targetContent = projectCard.querySelector(`#${targetId}`);
      if (targetContent) {
        targetContent.classList.add("active");
      }
    });
  });
}
/**
 * ============================================================================
 * Fonction : setupLightbox
 * ============================================================================
 * Initialise les comportements de la lightbox 
 */
function setupLightbox() {
  const lightboxLinks = document.querySelectorAll('a.lightbox');

  if (!lightboxLinks.length) {
    logEvent('info', '[Projet] Aucun lien lightbox détecté');
    return;
  }

  lightboxLinks.forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      const imageSrc = link.getAttribute('href');
      openLightbox(imageSrc);
    });
  });

  logEvent('success', '[Projet] Lightbox activée sur les médias');
}
/**
 * =============================================================================
 * Fonction : initModal
 * =============================================================================
 * Initialise la modale de contact et assure la gestion des événements associés.
 *
 * - Vérifie que les éléments DOM de la modale existent avant d’attacher les événements.
 * - Attache les événements nécessaires pour ouvrir et fermer la modale.
 * - Active un **MutationObserver** si le bouton de contact n'est pas immédiatement disponible.
 * - Capture les erreurs potentielles et assure la robustesse du processus.
 */
export function initModal() {
  try {
      logEvent("info", "➡ Initialisation de la modale de contact...");

      // Vérification immédiate de la présence du bouton de contact
      const contactButton = document.querySelector(".contact-button");

      if (contactButton) {
          logEvent("info", " Bouton de contact trouvé immédiatement.");
          attachModalEvents(); // Attache directement les événements si le bouton est présent
      } else {
          logEvent("warning", " Bouton de contact non trouvé. Activation de l'observation DOM...");
          observeDOMForContactButton(); // Lance un observateur pour détecter son apparition
      }

  } catch (error) {
      logEvent("error", " initModal : Erreur lors de l'initialisation de la modale.", { error });
      throw new Error(`Erreur critique dans initModal : ${error.message}`);
  }
}



/**
* =============================================================================
* Fonction : attachModalEvents
* =============================================================================
* Attache tous les événements nécessaires pour gérer la modale de contact.
*
* - Gère l'ouverture et la fermeture de la modale.
* - Vérifie l'existence des éléments DOM avant d'attacher les événements.
* - Ajoute un mécanisme pour éviter les attachements multiples.
* - Capture les entrées utilisateur dans les champs du formulaire.
* - Gère la soumission du formulaire et les modales associées.
*
* @throws {Error} Enregistre et remonte toute erreur critique dans les logs.
*/
export function attachModalEvents() {
  try {
      logEvent("info", "Attachement des événements de la modale...");

      // Récupération dynamique du bouton de contact
      const contactButton = document.querySelector(".contact-button");

      if (!contactButton) {
          logEvent("error", "Bouton de contact introuvable.");
          return;
      }

      // Empêche l'attachement multiple
      if (!contactButton.dataset.eventAttached) {
          contactButton.dataset.eventAttached = "true";
          contactButton.addEventListener("click", () => {
              logEvent("info", "Clic sur le bouton Contact.");
              handleModalOpen();
          });
          logEvent("success", "Événement attaché au bouton Contact.");
      }

      // Récupération des éléments principaux de la modale
      const { modalOverlay, contactForm, closeButton, form, confirmationModal, spamModal } = domSelectors.modal;

      if (!modalOverlay || !contactForm || !closeButton || !form) {
          logEvent("error", "Certains éléments de la modale sont introuvables.");
          return;
      }

      // Attachement des événements de fermeture de la modale
      attachEvent(closeButton, "click", handleModalClose);
      attachEvent(modalOverlay, "click", handleModalClose);

      document.addEventListener("keydown", (event) => {
          if (event.key === "Escape") {
              logEvent("info", "Touche Échap détectée, fermeture de la modale.");
              handleModalClose();
          }
      });

      // Attachement des événements au formulaire de contact
      if (form) {
          // Bouton d'envoi du formulaire
          if (form.submitButton && !form.submitButton.dataset.eventAttached) {
              form.submitButton.dataset.eventAttached = "true";
              attachEvent(form.submitButton, "click", (event) => {
                  event.preventDefault();
                  logEvent("info", "Formulaire soumis.");
                  handleFormSubmit();
              });
              logEvent("success", "Événement attaché au bouton d'envoi du formulaire.");
          }

          // Gestion des champs du formulaire avec logs de saisie
          const formFields = [
              { element: form.firstName, logMessage: "Saisie du prénom." },
              { element: form.lastName, logMessage: "Saisie du nom." },
              { element: form.email, logMessage: "Saisie de l'email." },
              { element: form.messageField, logMessage: "Saisie du message." },
          ];

          formFields.forEach(({ element, logMessage }) => {
              if (element && !element.dataset.eventAttached) {
                  element.dataset.eventAttached = "true";
                  attachEvent(element, "input", () => logEvent("info", logMessage));
              }
          });
      }

      // Gestion de la confirmation après soumission du formulaire
      if (confirmationModal?.confirmButton) {
          attachEvent(confirmationModal.confirmButton, "click", handleModalClose);
      }

      // Gestion de la modale de détection de spam
      if (spamModal?.closeButton) {
          attachEvent(spamModal.closeButton, "click", handleModalClose);
      }

      logEvent("success", "Tous les événements de la modale sont attachés avec succès.");
  
  } catch (error) {
      logEvent("error", "Une erreur est survenue lors de l'attachement des événements de la modale.", { error });
      throw new Error(`Erreur critique dans attachModalEvents : ${error.message}`);
  }
}

/**
* =============================================================================
* Fonction : observeDOMForContactButton
* =============================================================================
* Surveille le DOM pour détecter l'apparition dynamique du bouton de contact.
*
* - Utilise un **MutationObserver** pour surveiller les changements dans le `document.body`.
* - Attache les événements de la modale dès que le bouton est détecté.
* - Déconnecte l'observation après la première détection pour éviter les écoutes inutiles.
* - Capture et logue toute erreur pouvant survenir.
*
* @throws {Error} Enregistre toute erreur critique lors de l'observation du DOM.
*/
function observeDOMForContactButton() {
  try {
      logEvent("info", "Initialisation de l'observation du DOM pour le bouton de contact...");

      // Création de l'observateur
      const observer = new MutationObserver((mutations, obs) => {
          try {
              // Recherche du bouton de contact dans le DOM
              const button = document.querySelector(".contact-button");

              if (button) {
                  logEvent("success", "Bouton de contact détecté par MutationObserver.");

                  // Attache les événements nécessaires à la modale
                  attachModalEvents();

                  // Arrête l'observation une fois que le bouton a été trouvé
                  obs.disconnect();
                  logEvent("info", "MutationObserver arrêté après détection du bouton.");
              }
          } catch (error) {
              logEvent("error", "Erreur lors de l'observation du DOM.", { error });
              obs.disconnect(); // Assure l'arrêt de l'observateur en cas d'erreur
              throw new Error(`Erreur critique dans observeDOMForContactButton : ${error.message}`);
          }
      });

      // Définition des paramètres d'observation
      observer.observe(document.body, {
          childList: true, // Surveille l'ajout/suppression d'éléments dans le body
          subtree: true, // Inclut tous les nœuds enfants
      });

      logEvent("info", "Observation du DOM activée pour détecter le bouton de contact.");

  } catch (error) {
      logEvent("error", "Échec de l'initialisation de l'observation du DOM.", { error });
      throw new Error(`Erreur critique lors du lancement de observeDOMForContactButton : ${error.message}`);
  }
}

/**
* =============================================================================
* Fonction : initModalConfirm
* =============================================================================
* Initialise l'événement de confirmation pour la modale.
*
* - Vérifie si le bouton de confirmation est présent dans le DOM.
* - Attache un événement `click` pour gérer la validation.
* - Capture et logue toute erreur pouvant survenir.
* - Évite les attachements multiples en vérifiant les événements déjà liés.
*
* @throws {Error} Enregistre toute erreur critique lors de l'initialisation.
*/
export function initModalConfirm() {
  try {
      logEvent("info", "Initialisation de l'événement de confirmation...");

      // Sélectionne le bouton de confirmation dans le DOM
      const confirmButton = document.querySelector(".confirm-btn");

      // Vérification de l'existence du bouton
      if (!confirmButton) {
          logEvent("error", "Bouton de confirmation introuvable.");
          throw new Error("Le bouton de confirmation n'a pas été trouvé dans le DOM.");
      }

      // Empêche l'attachement multiple de l'événement
      if (confirmButton.dataset.eventAttached) {
          logEvent("warn", "L'événement de confirmation est déjà attaché.");
          return;
      }

      // Marque le bouton pour éviter les attachements multiples
      confirmButton.dataset.eventAttached = "true";

      // Attache l'événement "click" au bouton de confirmation
      attachEvent(confirmButton, "click", handleModalConfirm);

      logEvent("success", "Événement de confirmation attaché avec succès.");

  } catch (error) {
      logEvent("error", `Erreur critique dans initModalConfirm : ${error.message}`);
      throw new Error(`Erreur lors de l'initialisation de la confirmation : ${error.message}`);
  }
}



/** =============================================================================
* Fonction : setupContactFormEvents
* =============================================================================
* Initialise et gère les événements du formulaire de contact.
*
* - Surveille l'entrée utilisateur dans le champ "message".
* - Met à jour dynamiquement le compteur de caractères en temps réel.
* - Empêche le dépassement de la limite de caractères définie.
* - Vérifie la présence des éléments requis avant d'attacher les événements.
* - Capture et logue toute erreur pouvant survenir.
*
* @throws {Error} Si un élément requis est introuvable dans le DOM.
*/
export function setupContactFormEvents() {
  try {
      logEvent("info", "Initialisation des événements du formulaire de contact...");

      // Récupération sécurisée de l'élément du champ message
      const { messageField, charCounter } = domSelectors.modal.form;

      // Vérification de l'existence du champ "message"
      if (!messageField) {
          logEvent("error", "Champ 'message' introuvable. Vérifiez la structure du DOM.");
          throw new Error("Le champ 'message' est introuvable dans le DOM.");
      }

      // Vérification de l'existence du compteur de caractères
      if (!charCounter) {
          logEvent("warn", "Compteur de caractères introuvable. La mise à jour dynamique sera désactivée.");
      }

      // Empêche l'attachement multiple de l'événement
      if (messageField.dataset.eventAttached) {
          logEvent("warn", "L'événement 'input' sur le champ message est déjà attaché.");
          return;
      }

      // Marque l'élément comme ayant un événement déjà attaché
      messageField.dataset.eventAttached = "true";

      
  } catch (error) {
      logEvent("error", `Erreur dans setupContactFormEvents : ${error.message}`);
      throw new Error(`Erreur lors de l'initialisation du formulaire de contact : ${error.message}`);
  }
}


/**
 * ============================================================================
 * Fonction : openLightbox
 * ============================================================================
 * Ouvre une modale pleine page avec l'image cliquée
 * @param {string} src - Lien vers l’image
 */
function openLightbox(src) {
  const lightboxOverlay = document.createElement('div');
  lightboxOverlay.classList.add('lightbox-overlay');

  const image = document.createElement('img');
  image.src = src;
  image.alt = 'Agrandissement';
  image.classList.add('lightbox-image');

  // Fermer en cliquant sur l’image ou overlay
  lightboxOverlay.addEventListener('click', () => {
    document.body.removeChild(lightboxOverlay);
    logEvent('info', '[Projet] Lightbox fermée');
  });

  lightboxOverlay.appendChild(image);
  document.body.appendChild(lightboxOverlay);

  logEvent('info', `[Projet] Lightbox ouverte : ${src}`);
}

/**
 * =============================================================================
 * Fonction : initKeyboardEvents
 * =============================================================================
 * Initialise la gestion des interactions clavier pour la navigation et l'accessibilité.
 *
 * - Écoute les événements `keydown` pour gérer :
 *   - La navigation au clavier dans la galerie et la lightbox.
 *   - Le focus management dans les modales (`Tab` et `Shift+Tab`).
 *   - L'activation des boutons et liens avec `Entrée` et `Espace`.
 *   - La fermeture des modales et de la lightbox avec `Échap`.
 *
 * - Vérifie que l'événement n'est pas déjà attaché pour éviter les doublons.
 * - Capture les erreurs et les journalise pour une meilleure traçabilité.
 *
 * @throws {Error} Si une erreur survient lors de l'attachement de l'événement.
 */
function initKeyboardEvents() {
    try {
        logEvent("info", "Initialisation des événements clavier...");

        // Vérifie si l'événement est déjà attaché pour éviter les doublons
        if (document.__keyboardEventsAttached) {
            logEvent("warn", "Les événements clavier sont déjà attachés. Aucune action requise.");
            return;
        }

        // Attache l'événement `keydown` pour capturer les interactions clavier
        document.addEventListener("keydown", handleKeyboardEvent);

        // Marqueur interne pour éviter les attachements multiples
        document.__keyboardEventsAttached = true;

        logEvent("success", "Écoute des événements clavier activée avec succès.");
    } catch (error) {
        logEvent("error", `Erreur critique dans initKeyboardEvents : ${error.message}`, { error });
    }
}

/** ============================================================================
 * POINT D’ENTRÉE — À appeler depuis main.js
 * ============================================================================
 */export function initializeGlobalEventListeners() {
  document.addEventListener('DOMContentLoaded', () => {
    logEvent('success', '[Listeners] DOM chargé — Initialisation globale...');

    bindGlobalEvents();
    dispatchPageSpecificListeners();
    // Ces fonctions doivent être appelées uniquement si leurs éléments existent
    initModalConfirm();
    setupContactFormEvents();
    initKeyboardEvents();
  });
}