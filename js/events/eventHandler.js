/* eslint-disable default-case */
/* eslint-disable no-restricted-globals */
/* eslint-disable import/no-named-as-default */
/* eslint-disable consistent-return */
/* eslint-disable max-len */
/* eslint-disable import/extensions */
/* eslint-disable no-param-reassign */
// ========================================================
// Fichier : eventHandler.js
// Description : Gestion centralisée des événements pour modale, lightbox, tri, formulaire et onglets.
// Auteur : Trackozor
// Date : 08/01/2025
// Version : 3.1 (Ajout onglets projet, optimisation DOMContentLoaded)
// ========================================================

/*= ============================================= */
/*               IMPORTS                        */
/*= ============================================= */

import { logEvent } from '../utils/utils.js';
import domSelectors from '../config/domSelectors.js';
import { closeConfirmationModal } from '../components/modal/modalManager.js';
import { setupBurgerMenu, setupTabSwitching } from './eventListeners.js';
/* ------------------ Médias ------------------*/
import {
  openLightbox,
  showPreviousMedia,
  showNextMedia,
  closeLightbox,
} from '../components/lightbox/lightbox.js';

/* ------------------ Formulaire ------------------*/
import { initvalidform } from '../components/formulaire/contactform.js';

/*= ============================================= */
/*        Navigation Clavier Galerie            */
/*= ============================================= */

export function handleGalleryNavigation(event, direction) {
  const mediaGallery = document.querySelector('#gallery');
  if (!mediaGallery) {
    return logEvent('error', '#gallery introuvable.');
  }

  const mediaItems = Array.from(mediaGallery.querySelectorAll('.media-item'));
  const activeMedia = document.querySelector('.media-item.selected');
  let currentIndex = mediaItems.findIndex((item) => item === activeMedia);
  if (currentIndex === -1) {
    currentIndex = 0;
  }

  const videoElement = activeMedia.querySelector('video');
  if (videoElement && !videoElement.paused) {
    logEvent('warn', 'Vidéo en lecture, navigation désactivée.');
    event.preventDefault();
    return;
  }

  const updateIndex = (delta) => {
    currentIndex = (currentIndex + delta + mediaItems.length) % mediaItems.length;
  };

  if (direction === 'vertical') {
    if (event.key === 'ArrowUp') {
      updateIndex(-1);
    } else if (event.key === 'ArrowDown') {
      updateIndex(1);
    }
  } else if (event.key === 'ArrowLeft') {
    updateIndex(-1);
  } else if (event.key === 'ArrowRight') {
    updateIndex(1);
  }

  mediaItems.forEach((item, idx) => {
    item.classList.toggle('selected', idx === currentIndex);
    item.setAttribute('tabindex', idx === currentIndex ? '0' : '-1');
  });

  mediaItems[currentIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
  mediaItems[currentIndex].focus();

  logEvent('info', `Média sélectionné (Index ${currentIndex})`);
}
/*==============================================*/
/*         Gestion des Modales                  */
/*==============================================*/
/*==============================================*/
/*        Ouverture modale contact              */
/*==============================================*/
/**
 * Gère l'ouverture de la modale de contact d'un photographe.
 * 
 * ### **Fonctionnement :**
 * - Récupère les données des photographes via une requête asynchrone.
 * - Vérifie que les données sont valides avant d'afficher la modale.
 * - Extrait l'ID du photographe à partir de l'URL actuelle.
 * - Recherche le photographe correspondant dans les données.
 * - Ouvre la modale si toutes les conditions sont remplies.
 * - Gère les erreurs et affiche un message en cas d'échec.
 * - Utilise une classe CSS `loading` sur le `<body>` pour améliorer l'expérience utilisateur.
 * 
 * ### **Gestion des erreurs :**
 * - Lève une erreur si les données des photographes sont manquantes.
 * - Lève une erreur si l'ID du photographe est absent de l'URL.
 * - Lève une erreur si le photographe correspondant n'est pas trouvé.
 * - Capture et journalise toute erreur via `logEvent("error", ...)`.
 * - Affiche une alerte utilisateur si un problème survient.
 * 
 * @async
 * @function handleModalOpen
 * @throws {Error} Génère une erreur si l'un des éléments requis (données, ID photographe, etc.) est manquant ou invalide.
 */

export async function handleModalOpen() {
  logEvent("info", "Appel à l'ouverture de la modale.");
  try {
    // Récupère les données des photographes depuis l'API ou la base de données
    const mediaData =  await fetchMedia();

    if (!mediaData?.photographers) {
      throw new Error("Données photographes manquantes.");
    }

    const photographerId = new URLSearchParams(window.location.search).get("id");

    if (!photographerId) {
      throw new Error("ID photographe introuvable dans l'URL.");
    }

    const photographerData = mediaData.photographers.find(
      (photographer) => photographer.id === parseInt(photographerId, 10)
    );

    if (!photographerData) {
      throw new Error(`Photographe ID ${photographerId} introuvable.`);
    }

    // Ouvre la modale avec les informations du photographe
    launchModal(photographerData);

    // Ajoute un écouteur pour la fermeture de la modale
    setTimeout(() => {
      const modal = document.querySelector(".modal.modal-active");
      if (modal) {
        const firstInput = modal.querySelector("input, textarea, select");
        if (firstInput) {
          firstInput.focus();
          logEvent("success", "Focus placé sur le premier champ interactif.");
        } else {
          logEvent("warn", "Aucun champ interactif trouvé pour focus.");
        }
      }
    }, 100); // Petit délai pour s'assurer que la modale est bien affichée

    logEvent("success", "Modale ouverte avec succès.");
  } catch (error) {
    logEvent("error", `Erreur d'ouverture de la modale: ${error.message}`, { error });
    alert("Erreur lors du chargement de la modale.");
  } finally {
    document.body.classList.remove("loading");
  }
}

/*==============================================*/
/*        Fermeture  modale contact             */
/*==============================================*/

/**
 * Gère la fermeture de la modale de contact.
 * 
 * ### **Fonctionnement :**
 * - Déclenche la fermeture de la modale via `closeModal()`.
 * - Vérifie que la fermeture s'effectue sans erreur.
 * - Capture et journalise toute erreur éventuelle.
 * - Utilise `logEvent()` pour suivre l'état de l'opération.
 * 
 * ### **Gestion des erreurs :**
 * - Capture toute exception survenant lors de la fermeture.
 * - Journalise l'erreur via `logEvent("error", ...)`.
 * 
 * @function handleModalClose
 * @throws {Error} Génère une erreur si la fermeture de la modale échoue.
 */

export function handleModalClose() {
  // Indique dans les logs que le processus de fermeture commence
  logEvent("info", "Fermeture de la modale.");

  try {
    // Ferme la modale via la fonction dédiée
    closeModal();

    // Enregistre dans les logs que la modale a été fermée avec succès
    logEvent("success", "Modale fermée.");
  } catch (error) {
    // Capture et journalise toute erreur survenant lors de la fermeture
    logEvent("error", "Erreur lors de la fermeture de la modale", { error });
  }
}

/*= ============================================= */
/*             Modale de Confirmation           */
/*= ============================================= */

export function handleModalConfirm() {
  logEvent('info', 'Confirmation acceptée. Fermeture...');
  try {
    closeConfirmationModal();
    logEvent('success', 'Modale de confirmation fermée.');
  } catch (error) {
    logEvent('error', 'Fermeture échouée', { error });
  }
}

/*= ============================================= */
/*           Soumission du Formulaire           */
/*= ============================================= */

export function handleFormSubmit(event) {
  try {
    if (event) {
      event.preventDefault();
    }
    logEvent('info', 'Soumission formulaire...');
    if (typeof initvalidform === 'function') {
      initvalidform();
      logEvent('success', 'Formulaire soumis avec succès.');
    } else {
      throw new Error('initvalidform() non définie.');
    }
  } catch (error) {
    logEvent('error', `Erreur soumission formulaire : ${error.message}`, { error });
  }
}

/*= ============================================= */
/*              Lightbox - Ouverture            */
/*= ============================================= */

export function handleLightboxOpen(event, mediaArray, folderName) {
  try {
    if (!Array.isArray(mediaArray) || !mediaArray.length) {
      throw new Error('mediaArray vide ou invalide !');
    }

    const galleryItem = event.target.closest('.gallery-item')
                      || (event.target.tagName === 'VIDEO' && event.target.closest('.gallery-item'));
    if (!galleryItem) {
      throw new Error('Aucun média sélectionné.');
    }

    const mediaIndex = parseInt(galleryItem.dataset.index, 10);
    if (isNaN(mediaIndex)) {
      throw new Error('Index média invalide.');
    }

    window.MediaList = mediaArray;
    window.globalFolderName = folderName;

    const videoElement = galleryItem.querySelector('video');
    if (videoElement) {
      videoElement.removeAttribute('controls');
    }

    openLightbox(mediaIndex, mediaArray, folderName);

    setTimeout(() => {
      if (videoElement) {
        videoElement.setAttribute('controls', 'true');
      }
    }, 300);

    logEvent('success', `Lightbox ouverte (Index ${mediaIndex})`);
  } catch (error) {
    logEvent('error', `Erreur ouverture lightbox : ${error.message}`, { error });
  }
}

/*= ============================================= */
/*            Lightbox - Fermeture              */
/*= ============================================= */

export function handleLightboxClose() {
  try {
    if (typeof closeLightbox !== 'function') {
      throw new Error('closeLightbox() non définie');
    }
    closeLightbox();
    logEvent('success', 'Lightbox fermée.');
  } catch (error) {
    logEvent('error', `Fermeture lightbox échouée : ${error.message}`, { error });
  }
}

export function handleLightboxBackgroundClick(event) {
  try {
    if (!event || !event.target) {
      throw new Error('Événement invalide.');
    }

    const exceptions = [
      '.lightbox-media-container',
      '.lightbox-prev',
      '.lightbox-next',
      '.lightbox-close',
    ];

    const isException = exceptions.some((sel) => event.target.closest(sel));
    if (isException) {
      return;
    }

    if (event.target === domSelectors.lightbox.lightboxOverlay) {
      logEvent('info', 'Clic overlay : fermeture lightbox.');
      handleLightboxClose();
    }
  } catch (error) {
    logEvent('error', `Erreur clic background : ${error.message}`, { error });
  }
}

/*= ============================================= */
/*      Lightbox - Navigation Précédente/Suivante      */
/*= ============================================= */

export function handleLightboxPrev() {
  try {
    if (!window.MediaList.length) {
      throw new Error('Aucun média disponible.');
    }
    showPreviousMedia();
    logEvent('info', 'Lightbox : média précédent.');
  } catch (error) {
    logEvent('error', `Erreur média précédent : ${error.message}`, { error });
  }
}

export function handleLightboxNext() {
  try {
    if (!window.MediaList.length) {
      throw new Error('Aucun média disponible.');
    }
    showNextMedia();
    logEvent('info', 'Lightbox : média suivant.');
  } catch (error) {
    logEvent('error', `Erreur média suivant : ${error.message}`, { error });
  }
}

/*= ============================================= */
/*         Navigation Clavier Global            */
/*= ============================================= */

export function handleKeyboardEvent(event) {
  try {
    if (!event.key) {
      throw new Error('Événement clavier non défini.');
    }
    const activeModal = document.querySelector('.modal.modal-active');
    const activeLightbox = document.querySelector(".lightbox[aria-hidden='false']");
    const activeMedia = document.querySelector('.media-item.selected');

    if (document.activeElement.tagName === 'VIDEO' && !document.activeElement.paused) {
      logEvent('warn', 'Vidéo en cours → Navigation désactivée.');
      return;
    }

    if (!activeModal && !activeLightbox) {
      switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowRight':
        handleGalleryNavigation(event, 'horizontal');
        break;
      case 'ArrowUp':
      case 'ArrowDown':
        handleGalleryNavigation(event, 'vertical');
        break;
      case 'Enter':
      case ' ':
        if (activeMedia && window.MediaList) {
          const mediaId = activeMedia.getAttribute('data-id');
          // eslint-disable-next-line eqeqeq
          const mediaIndex = window.MediaList.findIndex((media) => media.id == mediaId);
          if (mediaIndex !== -1) {
            openLightbox(mediaIndex, window.MediaList, window.globalFolderName);
            event.preventDefault();
          }
        }
        break;
      }
    }
  } catch (error) {
    logEvent('error', `Erreur clavier : ${error.message}`, { error });
  }
}

/*= ============================================= */
/*        INITIALISATION DOMContentLoaded       */
/*= ============================================= */

document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('keydown', handleKeyboardEvent);
  logEvent('success', 'Gestion clavier activée.');
  setupBurgerMenu();

  //  Activation dynamique des onglets projet
  if (window.location.pathname.includes('projet.html')) {
    setupTabSwitching();
    logEvent('success', 'Onglets projet initialisés.');
  }
});
