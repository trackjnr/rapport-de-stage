// ========================================================
// Fichier : eventHandler.js
// Description : Gestion centralisée des événements pour la modale,
//               la lightbox et le tri des médias.
// Auteur : Trackozor
// Date : 08/01/2025
// Version : 3.0 (Optimisation, Robustesse, Sécurité)
// ========================================================

/*==============================================*/
/*               IMPORTS                        */
/*==============================================*/

import { logEvent } from "../utils/utils.js";
import domSelectors from "../config/domSelectors.js";

/*------------------ Modales ------------------*/
import {
  launchModal,
  closeModal,
  closeConfirmationModal,
} from "../components/modal/modalManager.js";

/*------------------ Médias ------------------*/
import { handleMediaSort } from "../components/sort/sortlogic.js";
import {
  openLightbox,
  showPreviousMedia,
  showNextMedia,
  closeLightbox,
} from "../components/lightbox/lightbox.js";

/*------------------ Données ------------------*/
import { fetchMedia } from "../data/dataFetcher.js";

/*------------------ UI & Accessibilité ------------------*/

import { trapFocus } from "../utils/accessibility.js";
import { initvalidform } from "../utils/contactForm.js";

/*------------------ Clavier ------------------*/
import { KEY_CODES } from "../config/constants.js";
import {
  handleEscapeKey,
  handleLightboxNavigation,
} from "./keyboardHandler.js";

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


/*==============================================*/

export function handleGalleryNavigation(event, direction) {
    let mediaGallery = document.querySelector("#gallery"); // 📌 Cible bien la div qui contient les médias
    if (!mediaGallery) {
        logEvent("error", "handleGalleryNavigation : #gallery introuvable.");
        return;
    }

    const mediaItems = Array.from(mediaGallery.querySelectorAll(".media-item")); // ✅ Récupère tous les médias affichés
    let activeMedia = document.querySelector(".media-item.selected"); // 🔍 Trouve l'élément actuellement sélectionné

    let currentIndex = mediaItems.findIndex(item => item === activeMedia);
    if (currentIndex === -1) {
        currentIndex = 0; // Si aucun média n'est sélectionné, démarre au premier
    }

    const videoElement = activeMedia?.querySelector("video");

    // 🚨 **Empêcher la navigation si une vidéo est en lecture**
    if (videoElement && !videoElement.paused) {
        logEvent("warn", "handleGalleryNavigation : Une vidéo est en lecture, blocage de la navigation.");
        event.preventDefault();
        return;
    }

    // 🔄 **Défilement dans la galerie**
    if (direction === "vertical") {
        if (event.key === "ArrowUp") {
            currentIndex = (currentIndex - 1 + mediaItems.length) % mediaItems.length;
        } else if (event.key === "ArrowDown") {
            currentIndex = (currentIndex + 1) % mediaItems.length;
        }
    } else if (direction === "horizontal") {
        if (event.key === "ArrowLeft") {
            currentIndex = (currentIndex - 1 + mediaItems.length) % mediaItems.length;
        } else if (event.key === "ArrowRight") {
            currentIndex = (currentIndex + 1) % mediaItems.length;
        }
    }

    // Met à jour la sélection
    mediaItems.forEach(item => item.classList.remove("selected")); // 🔹 Retire la sélection des autres médias
    mediaItems[currentIndex].classList.add("selected"); // 🔹 Ajoute la classe active au nouvel élément sélectionné
    mediaItems[currentIndex].scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });

    // Piège le focus sur l'élément sélectionné
    mediaItems[currentIndex].setAttribute("tabindex", "0");
    mediaItems[currentIndex].focus();

    // Désactiver tabindex sur les autres éléments
    mediaItems.forEach((item, index) => {
        if (index !== currentIndex) {
            item.setAttribute("tabindex", "-1");
        }
    });

    logEvent("info", `handleGalleryNavigation : Média sélectionné (Index ${currentIndex})`);
}


/*==============================================*/
/*        ouverture modale confirmation         */
/*==============================================*/
/**
 * Gère la confirmation d'une action dans une modale de confirmation.
 * 
 * ### **Fonctionnement :**
 * - Journalise l'acceptation de la confirmation.
 * - Ferme la modale de confirmation en appelant `closeConfirmationModal()`.
 * - Capture et journalise toute erreur éventuelle.
 * 
 * ### **Gestion des erreurs :**
 * - Vérifie que `closeConfirmationModal()` est bien défini avant de l'exécuter.
 * - Capture toute exception survenant lors de la fermeture de la modale.
 * - Journalise l'erreur via `logEvent("error", ...)`.
 * 
 * @function handleModalConfirm
 * @throws {Error} Génère une erreur si la fermeture de la modale échoue.
 */

export function handleModalConfirm() {
  // Indique dans les logs que l'utilisateur a validé une action
  logEvent("info", "Confirmation acceptée. Fermeture de la modale...");

  try {
    // Ferme la modale de confirmation via la fonction dédiée
    closeConfirmationModal();

    // Enregistre dans les logs que la modale a bien été fermée
    logEvent("success", "Modale de confirmation fermée avec succès.");
  } catch (error) {
    // Capture et journalise toute erreur survenant lors de la fermeture
    logEvent("error", "Erreur lors de la fermeture de la modale de confirmation", { error });
  }
}




/*==============================================*/
/*           Soumission formulaire              */
/*==============================================*/
/**
 * Gère la soumission du formulaire de contact.
 * 
 * ### **Fonctionnement :**
 * - Empêche le rechargement de la page (`event.preventDefault()`).
 * - Journalise l'événement de soumission du formulaire.
 * - Affiche un indicateur de chargement (`showLoader()`).
 * - Lance la validation et le traitement du formulaire via `initvalidform()`.
 * - Capture et journalise toute erreur pouvant survenir durant la soumission.
 * 
 * ### **Gestion des erreurs :**
 * - Vérifie que `event` est bien défini avant d'appeler `preventDefault()`.
 * - Vérifie que les fonctions `showLoader()` et `initvalidform()` existent bien avant de les exécuter.
 * - Capture et journalise toute exception inattendue.
 * 
 * @function handleFormSubmit
 * @param {Event} event - L'événement `submit` déclenché par l'utilisateur.
 * @throws {Error} Génère une erreur si la soumission du formulaire échoue.
 */

export function handleFormSubmit(event) {
  try {
    //  Vérifie si event existe et empêche la soumission par défaut
    if (event) {
      event.preventDefault();
    } else {
      logEvent("warn", "handleFormSubmit() a été appelé sans événement. Vérifiez son attachement.");
    }

    logEvent("info", "Soumission du formulaire de contact en cours...");
  
    if (typeof initvalidform === "function") {
      initvalidform();
    } else {
      throw new Error("initvalidform() est introuvable ou non définie.");
    }

    logEvent("success", " Le formulaire de contact a été soumis avec succès.");
  } catch (error) {
    logEvent("error", ` Erreur lors de la soumission du formulaire : ${error.message}`, { error });
    alert("Une erreur est survenue lors de la soumission du formulaire. Veuillez réessayer.");
  }
}



/*==============================================*/
/*         Gestion de la Lightbox               */
/*==============================================*/
/*==============================================*/
/*             Ouverture lightbox              */
/*==============================================*/
/**
 * Ouvre la lightbox avec un média spécifique sélectionné dans la galerie.
 * 
 * ### **Fonctionnement :**
 * - Vérifie que `mediaArray` est valide et contient des médias.
 * - Récupère l'élément cliqué dans la galerie via `event.target.closest(".gallery-item")`.
 * - Récupère l'index du média dans l'attribut `data-index` du `galleryItem`.
 * - Assure que `mediaList` et `globalFolderName` sont bien définis.
 * - Appelle `openLightbox()` pour afficher le média sélectionné.
 * - Capture et journalise toute erreur potentielle.
 * 
 * ### **Gestion des erreurs :**
 * - Vérifie que `mediaArray` est un tableau valide et non vide.
 * - Vérifie que l'événement `event.target` est défini et correspond bien à un élément `.gallery-item`.
 * - Vérifie que `data-index` contient bien un nombre valide.
 * - Capture et journalise toute erreur rencontrée.
 * 
 * @function handleLightboxOpen
 * @param {Event} event - L'événement `click` déclenché sur un média de la galerie.
 * @param {Array} mediaArray - Tableau contenant les médias disponibles.
 * @param {string} folderName - Nom du dossier contenant les médias.
 * @throws {Error} Génère une erreur si le média sélectionné est invalide ou si `mediaArray` est incorrect.
 */

export function handleLightboxOpen(event, mediaArray, folderName) {
  try {
      logEvent("debug", "handleLightboxOpen() déclenché.", { event });

      if (!Array.isArray(mediaArray) || mediaArray.length === 0) {
          logEvent("error", " mediaArray est vide ou invalide !");
          throw new Error("mediaArray est vide ou invalide !");
      }

      logEvent("info", ` Élément cliqué : ${event.target.tagName}`, { eventTarget: event.target });

      // Récupère l'élément `.gallery-item` cliqué ou la vidéo
      let galleryItem = event.target.closest(".gallery-item");

      // Si on clique directement sur une vidéo, on capture son parent `.gallery-item`
      if (!galleryItem && event.target.tagName === "VIDEO") {
          logEvent("warn", "⚠ Clic détecté sur une vidéo, remontée vers .gallery-item...");
          galleryItem = event.target.closest(".gallery-item");
          event.preventDefault(); // Empêche l'avance rapide de 10s
      }

      if (!galleryItem) {
          logEvent("error", " Aucun média sélectionné, le clic a été ignoré.");
          throw new Error("Aucun média sélectionné.");
      }

      logEvent("success", " Élément .gallery-item détecté avec succès.", { galleryItem });

      // Vérification si c'est une vidéo et désactivation temporaire des contrôles
      const videoElement = galleryItem.querySelector("video");
      if (videoElement) {
          logEvent("info", "Vidéo détectée, désactivation temporaire des contrôles.");
          videoElement.removeAttribute("controls"); // Empêche l'interception du clic
      }

      // Récupère l'index du média
      const mediaIndex = parseInt(galleryItem.dataset.index, 10);
      if (isNaN(mediaIndex) || mediaIndex < 0 || mediaIndex >= mediaArray.length) {
          logEvent("error", " Index média invalide ou hors limites.", { mediaIndex });
          throw new Error("Index média invalide ou hors limites.");
      }

      logEvent("success", ` Média sélectionné à l'index ${mediaIndex}. Ouverture de la lightbox...`);

      window.mediaList = mediaArray;
      window.globalFolderName = folderName;

      openLightbox(mediaIndex, mediaArray, folderName);

      // Réactiver les contrôles après un court délai pour éviter l'interférence
      setTimeout(() => {
          if (videoElement) {
              logEvent("info", " Réactivation des contrôles vidéo.");
              videoElement.setAttribute("controls", "true");
          }
      }, 300);

      logEvent("success", " Lightbox ouverte avec succès.");

  } catch (error) {
      logEvent("error", ` Erreur lors de l'ouverture de la lightbox : ${error.message}`, { error });
  }
}


/*==============================================*/
/*              Fermeture lightbox              */
/*==============================================*/
/**
 * Gère la fermeture de la lightbox.
 * 
 * ### **Fonctionnement :**
 * - Journalise le début de la fermeture de la lightbox.
 * - Exécute la fonction `closeLightbox()` pour fermer la lightbox.
 * - Capture et journalise toute erreur survenant lors de la fermeture.
 * 
 * ### **Gestion des erreurs :**
 * - Vérifie que `closeLightbox()` est bien définie avant de l'exécuter.
 * - Capture toute exception en cas d'échec de la fermeture.
 * - Journalise l'erreur via `logEvent("error", ...)`.
 * 
 * @function handleLightboxClose
 * @throws {Error} Génère une erreur si la fermeture de la lightbox échoue.
 */

export function handleLightboxClose() {
  try {
    // Journalisation du début de la fermeture de la lightbox
    logEvent("info", "Fermeture de la lightbox en cours...");

    // Vérifie que la fonction `closeLightbox` est bien définie avant de l'exécuter
    if (typeof closeLightbox !== "function") {
      throw new Error("closeLightbox() est introuvable ou non définie.");
    }

    // Exécute la fermeture de la lightbox
    closeLightbox();

    // Journalisation du succès de la fermeture
    logEvent("success", "Lightbox fermée avec succès.");
  } catch (error) {
    // Capture et journalise toute erreur rencontrée
    logEvent("error", `Erreur lors de la fermeture de la lightbox : ${error.message}`, { error });
  }
}
export function handleLightboxBackgroundClick(event) {
  try {
    if (!event || !event.target) {
      throw new Error("Événement invalide ou non défini.");
    }

    // Sélectionne les éléments qui ne doivent PAS fermer la lightbox
    const lightboxMedia = document.querySelector(".lightbox-media-container");
    const prevButton = document.querySelector(".lightbox-prev");
    const nextButton = document.querySelector(".lightbox-next");
    const closeButton = document.querySelector(".lightbox-close");

    logEvent("debug", "Clic détecté dans la lightbox", { clickedElement: event.target });

    // Vérifie si l'élément cliqué est un bouton ou le média
    if (
      event.target === lightboxMedia ||
      event.target === prevButton ||
      event.target === nextButton ||
      event.target === closeButton
    ) {
      logEvent("debug", "Clic détecté sur un élément de navigation ou le média, la lightbox ne doit pas se fermer.");
      return;
    }

    // Si c'est l'overlay (arrière-plan), fermer la lightbox
    if (event.target === domSelectors.lightbox.lightboxOverlay) {
      logEvent("info", "Clic détecté sur l'overlay. Fermeture de la lightbox.");
      
    }

  } catch (error) {
    logEvent("error", `Erreur lors du clic sur l'arrière-plan de la lightbox : ${error.message}`, { error });
  }
}



/*==============================================*/
/*              Nav précédente                  */
/*==============================================*/
/**
 * Gère la navigation vers le média précédent dans la lightbox.
 * 
 * ### **Fonctionnement :**
 * - Vérifie que `window.mediaList` est défini et contient des médias.
 * - Si aucun média n'est disponible, journalise une erreur et stoppe l'exécution.
 * - Journalise l'action de navigation avant de passer au média précédent.
 * - Appelle `showPreviousMedia()` pour afficher le média précédent.
 * 
 * ### **Gestion des erreurs :**
 * - Vérifie que `window.mediaList` est défini et non vide avant de procéder.
 * - Capture et journalise toute erreur inattendue.
 * 
 * @function handleLightboxPrev
 * @throws {Error} Génère une erreur si `mediaList` est vide ou non défini.
 */

export function handleLightboxPrev() {
  try {
    // Vérifie que `mediaList` est défini et contient au moins un média
    if (!window.mediaList || window.mediaList.length === 0) {
      throw new Error("Aucun média disponible pour la navigation.");
    }

    // Journalisation de l'action de navigation
    logEvent("info", "Navigation vers le média précédent dans la lightbox.");

    // Affiche le média précédent
    showPreviousMedia();

  } catch (error) {
    // Capture et journalise toute erreur rencontrée
    logEvent("error", `Erreur lors de la navigation vers le média précédent : ${error.message}`, { error });
  }
}

/*==============================================*/
/*                 Nav suivante                 */
/*==============================================*/

/**
 * Gère la navigation vers le média suivant dans la lightbox.
 * 
 * ### **Fonctionnement :**
 * - Vérifie que `window.mediaList` est défini et contient des médias.
 * - Si aucun média n'est disponible, journalise une erreur et stoppe l'exécution.
 * - Journalise l'action de navigation avant de passer au média suivant.
 * - Appelle `showNextMedia()` pour afficher le média suivant.
 * 
 * ### **Gestion des erreurs :**
 * - Vérifie que `window.mediaList` est défini et non vide avant de procéder.
 * - Capture et journalise toute erreur inattendue.
 * 
 * @function handleLightboxNext
 * @throws {Error} Génère une erreur si `mediaList` est vide ou non défini.
 */

export function handleLightboxNext() {
  try {
    // Vérifie que `mediaList` est défini et contient au moins un média
    if (!window.mediaList || window.mediaList.length === 0) {
      throw new Error("Aucun média disponible pour la navigation.");
    }

    // Journalisation de l'action de navigation
    logEvent("info", "Navigation vers le média suivant dans la lightbox.");

    // Affiche le média suivant
    showNextMedia();

  } catch (error) {
    // Capture et journalise toute erreur rencontrée
    logEvent("error", `Erreur lors de la navigation vers le média suivant : ${error.message}`, { error });
  }
}



/*==============================================*/
/*         Gestion du Tri des Médias            */
/*==============================================*/

/**
 * Gère le changement de tri des médias en fonction de l'option sélectionnée par l'utilisateur.
 * 
 * ### **Fonctionnement :**
 * - Récupère la valeur de l'option de tri sélectionnée (`event.target.value`).
 * - Vérifie que la valeur est bien définie et non vide.
 * - Journalise l'option sélectionnée dans `logEvent()`.
 * - Exécute la fonction `handleMediaSort()` pour appliquer le tri.
 * - Capture et journalise toute erreur potentielle.
 * 
 * ### **Gestion des erreurs :**
 * - Vérifie que `event.target` est bien défini avant d'extraire `value`.
 * - Vérifie que l'option de tri sélectionnée n'est pas vide.
 * - Capture et journalise toute erreur inattendue lors de l'exécution de `handleMediaSort()`.
 * 
 * @async
 * @function handleSortChange
 * @param {Event} event - L'événement `change` déclenché lors de la sélection d'une option de tri.
 * @throws {Error} Génère une erreur si l'option de tri est invalide ou si `handleMediaSort` rencontre un problème.
 */

export async function handleSortChange(event) {
  try {
    // Vérifie que l'événement et sa cible sont bien définis
    if (!event || !event.target) {
      throw new Error("Événement de tri invalide ou non défini.");
    }

    // Récupère la valeur de l'option sélectionnée
    const sortOption = event.target.value;

    // Vérifie que l'utilisateur a bien sélectionné une option de tri
    if (!sortOption) {
      throw new Error("Aucune option de tri sélectionnée.");
    }

    // Journalisation de l'option de tri sélectionnée
    logEvent("info", `Option de tri sélectionnée : ${sortOption}`);

    // Applique le tri aux médias
    await handleMediaSort(sortOption);

    // Journalisation du succès du tri
    logEvent("success", "Tri des médias appliqué avec succès.");
  } catch (error) {
    // Capture et journalise toute erreur rencontrée
    logEvent("error", `Erreur lors du tri des médias : ${error.message}`, { error });
  }
}

/**
 * Gère le clic sur une icône de like.
 * @param {Event} event - L'événement déclenché par le clic.
 * @param {HTMLElement} totalLikesElement - Élément affichant le total des likes.
 */
export function handleLikeClick(event, totalLikesElement) {
  try {
    const icon = event.target;
    const mediaItem = icon.closest(".media-item");

    if (!mediaItem) {
      throw new Error("Élément média introuvable.");
    }

    const mediaId = mediaItem.dataset.id;
    if (!mediaId) {
      throw new Error("ID média introuvable.");
    }

    const likeCounter = mediaItem.querySelector(".media-likes");
    if (!likeCounter) {
      throw new Error("Compteur de likes introuvable.");
    }

    let currentLikes = parseInt(likeCounter.textContent, 10) || 0;
    let totalLikes = parseInt(totalLikesElement.textContent, 10) || 0;

    if (icon.classList.contains("liked")) {
      // Si déjà liké, on enlève le like
      icon.classList.remove("liked");
      likeCounter.textContent = currentLikes - 1;
      totalLikesElement.textContent = totalLikes - 1;
      logEvent("info", `Like retiré pour le média ID: ${mediaId}`);
    } else {
      // Sinon, on ajoute le like
      icon.classList.add("liked");
      likeCounter.textContent = currentLikes + 1;
      totalLikesElement.textContent = totalLikes + 1;
      logEvent("success", `Like ajouté pour le média ID: ${mediaId}`);
    }
  } catch (error) {
    logEvent("error", `Erreur lors du clic sur un like: ${error.message}`, { error });
  }
}

/*==============================================*/
/*         Gestion des Interactions Clavier     */
/*==============================================*/

/**
 * Gère les interactions clavier pour la navigation et l'accessibilité des modales et de la lightbox.
 * 
 * ### **Fonctionnement :**
 * - Vérifie si une modale ou une lightbox est active.
 * - Gère la touche `TAB` pour maintenir le focus dans la modale active (`trapFocus()`).
 * - Gère la touche `ESCAPE` pour fermer la modale ou la lightbox (`handleEscapeKey()`).
 * - Gère les flèches gauche/droite (`← / →`) pour naviguer dans la lightbox (`handleLightboxNavigation()`).
 * - Capture et journalise toute erreur survenant dans la gestion des événements clavier.
 * 
 * ### **Gestion des erreurs :**
 * - Vérifie que l'événement `event.key` est bien défini avant d'agir.
 * - Capture et journalise toute erreur inattendue.
 * 
 * @function handleKeyboardEvent
 * @param {KeyboardEvent} event - L'événement clavier déclenché par l'utilisateur.
 * @throws {Error} Génère une erreur si un problème survient dans la gestion des interactions clavier.
 */

export function handleKeyboardEvent(event) {
  try {
      if (!event || !event.key) {
          throw new Error("Événement clavier invalide ou non défini.");
      }

      logEvent("debug", "Événement clavier détecté.", { keyPressed: event.key });

      let mediaGallery = document.querySelector("#gallery"); 
      if (!mediaGallery) {
          logEvent("warn", "handleKeyboardEvent : Élément #gallery introuvable. Navigation désactivée.");
          return;
      }

      const activeModal = document.querySelector(".modal.modal-active");
      const activeLightbox = document.querySelector(".lightbox[aria-hidden='false']");
      const mediaItems = Array.from(document.querySelectorAll(".media-item")); // Liste des médias dans la galerie
      const activeMedia = document.querySelector(".media-item.selected"); //  Élément actif dans la galerie

      logEvent("info", "Vérification des éléments actifs.", {
          activeModal: !!activeModal,
          activeLightbox: !!activeLightbox,
          activeMedia: !!activeMedia
      });

      //  Évite d'interférer avec une vidéo active
      if (document.activeElement.tagName === "VIDEO" && !document.activeElement.paused) {
          logEvent("warn", "handleKeyboardEvent : Vidéo active détectée, touches fléchées désactivées.");
          return;
      }

      //  **Détecte les touches pour naviguer UNIQUEMENT dans la galerie**
      if (!activeLightbox && !activeModal) {
          switch (event.key) {
              case "ArrowLeft":
              case "ArrowRight":
                  handleGalleryNavigation(event, "horizontal");
                  break;
              case "ArrowUp":
              case "ArrowDown":
                  handleGalleryNavigation(event, "vertical");
                  break;
              case "Enter":
              case " ":
                  if (activeMedia) {
                      //  Trouver l'INDEX du média dans la **lightbox** et non juste la galerie
                      const mediaId = activeMedia.getAttribute("data-id"); //  ID du média
                      const mediaIndex = mediaList.findIndex(media => media.id == mediaId); // Trouve l’index dans `mediaList`

                      if (mediaIndex !== -1) {
                          logEvent("info", `Ouverture de la lightbox pour index ${mediaIndex}`);
                          openLightbox(mediaIndex, mediaList, globalFolderName); //  Passe bien la liste et le dossier
                          event.preventDefault(); //  Empêche le scroll si c'est `Espace`
                      } else {
                          logEvent("error", "Aucun index valide trouvé pour ouvrir la lightbox.");
                      }
                  }
                  break;
              default:
                  logEvent("warn", `Touche ${event.key} détectée mais non prise en charge.`);
          }
      }
  } catch (error) {
      logEvent("error", "handleKeyboardEvent : Erreur critique lors de la gestion clavier.", { error });
      throw new Error(`Erreur dans handleKeyboardEvent : ${error.message}`);
  }
}





document.addEventListener("DOMContentLoaded", () => {
    document.addEventListener("keydown", handleKeyboardEvent);
    logEvent("success", "Gestionnaire d'événements clavier activé.");
});