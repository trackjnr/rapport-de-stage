// ========================================================
// Fichier : eventHandler.js
// Description : Gestion centralisée des événements pour modale, lightbox, tri, formulaire et onglets.
// Auteur : Trackozor
// Date : 08/01/2025
// Version : 3.1 (Ajout onglets projet, optimisation DOMContentLoaded)
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
import {
  openLightbox,
  showPreviousMedia,
  showNextMedia,
  closeLightbox,
} from "../components/lightbox/lightbox.js";

/*------------------ Formulaire ------------------*/
import { initvalidform } from "../components/formulaire/contactform.js";

/*------------------ Clavier ------------------*/
import { KEY_CODES } from "../config/constants.js";
import {
  handleEscapeKey,
  handleLightboxNavigation,
} from "./keyboardHandler.js";

/*------------------ Onglets Projet ------------------*/
import { setupTabSwitching } from "./eventListeners.js";

/*==============================================*/
/*        Navigation Clavier Galerie            */
/*==============================================*/

export function handleGalleryNavigation(event, direction) {
  const mediaGallery = document.querySelector("#gallery");
  if (!mediaGallery) {
    return logEvent("error", "#gallery introuvable.");
  }

  const mediaItems = Array.from(mediaGallery.querySelectorAll(".media-item"));
  let activeMedia = document.querySelector(".media-item.selected");
  let currentIndex = mediaItems.findIndex(item => item === activeMedia);
  if (currentIndex === -1) {
    currentIndex = 0;
  }

  const videoElement = activeMedia.querySelector("video");
  if (videoElement && !videoElement.paused) {
    logEvent("warn", "Vidéo en lecture, navigation désactivée.");
    event.preventDefault();
    return;
  }

  const updateIndex = (delta) => {
    currentIndex = (currentIndex + delta + mediaItems.length) % mediaItems.length;
  };

  if (direction === "vertical") {
      if (event.key === "ArrowUp") {
        updateIndex(-1);
      } else if (event.key === "ArrowDown") {
               updateIndex(1);
             }
    }
  else if (event.key === "ArrowLeft") {
         updateIndex(-1);
       } else if (event.key === "ArrowRight") {
                updateIndex(1);
              }

  mediaItems.forEach((item, idx) => {
    item.classList.toggle("selected", idx === currentIndex);
    item.setAttribute("tabindex", idx === currentIndex ? "0" : "-1");
  });

  mediaItems[currentIndex].scrollIntoView({ behavior: "smooth", block: "center" });
  mediaItems[currentIndex].focus();

  logEvent("info", `Média sélectionné (Index ${currentIndex})`);
}

/*==============================================*/
/*             Modale de Confirmation           */
/*==============================================*/

export function handleModalConfirm() {
  logEvent("info", "Confirmation acceptée. Fermeture...");
  try {
    closeConfirmationModal();
    logEvent("success", "Modale de confirmation fermée.");
  } catch (error) {
    logEvent("error", "Fermeture échouée", { error });
  }
}

/*==============================================*/
/*           Soumission du Formulaire           */
/*==============================================*/

export function handleFormSubmit(event) {
  try {
    if (event) {
      event.preventDefault();
    }
    logEvent("info", "Soumission formulaire...");
    if (typeof initvalidform === "function") {
      initvalidform();
      logEvent("success", "Formulaire soumis avec succès.");
    } else {
      throw new Error("initvalidform() non définie.");
    }
  } catch (error) {
    logEvent("error", `Erreur soumission formulaire : ${error.message}`, { error });
    alert("Erreur lors de la soumission du formulaire.");
  }
}

/*==============================================*/
/*              Lightbox - Ouverture            */
/*==============================================*/

export function handleLightboxOpen(event, mediaArray, folderName) {
  try {
    if (!Array.isArray(mediaArray) || !mediaArray.length) {
      throw new Error("mediaArray vide ou invalide !");
    }

    let galleryItem = event.target.closest(".gallery-item") || 
                      (event.target.tagName === "VIDEO" && event.target.closest(".gallery-item"));
    if (!galleryItem) {
      throw new Error("Aucun média sélectionné.");
    }

    const mediaIndex = parseInt(galleryItem.dataset.index, 10);
    if (isNaN(mediaIndex)) {
      throw new Error("Index média invalide.");
    }

    window.mediaList = mediaArray;
    window.globalFolderName = folderName;

    const videoElement = galleryItem.querySelector("video");
    if (videoElement) {
      videoElement.removeAttribute("controls");
    }

    openLightbox(mediaIndex, mediaArray, folderName);

    setTimeout(() => {
      if (videoElement) {
        videoElement.setAttribute("controls", "true");
      }
    }, 300);

    logEvent("success", `Lightbox ouverte (Index ${mediaIndex})`);
  } catch (error) {
    logEvent("error", `Erreur ouverture lightbox : ${error.message}`, { error });
  }
}

/*==============================================*/
/*            Lightbox - Fermeture              */
/*==============================================*/

export function handleLightboxClose() {
  try {
    if (typeof closeLightbox !== "function") {
      throw new Error("closeLightbox() non définie");
    }
    closeLightbox();
    logEvent("success", "Lightbox fermée.");
  } catch (error) {
    logEvent("error", `Fermeture lightbox échouée : ${error.message}`, { error });
  }
}

export function handleLightboxBackgroundClick(event) {
  try {
    if (!event || !event.target) {
      throw new Error("Événement invalide.");
    }

    const exceptions = [
      ".lightbox-media-container",
      ".lightbox-prev",
      ".lightbox-next",
      ".lightbox-close",
    ];

    const isException = exceptions.some(sel => event.target.closest(sel));
    if (isException) return;

    if (event.target === domSelectors.lightbox.lightboxOverlay) {
      logEvent("info", "Clic overlay : fermeture lightbox.");
      handleLightboxClose();
    }
  } catch (error) {
    logEvent("error", `Erreur clic background : ${error.message}`, { error });
  }
}

/*==============================================*/
/*      Lightbox - Navigation Précédente/Suivante      */
/*==============================================*/

export function handleLightboxPrev() {
  try {
    if (!window.MediaList.length) {
      throw new Error("Aucun média disponible.");
    }
    showPreviousMedia();
    logEvent("info", "Lightbox : média précédent.");
  } catch (error) {
    logEvent("error", `Erreur média précédent : ${error.message}`, { error });
  }
}

export function handleLightboxNext() {
  try {
    if (!window.MediaList.length) {
      throw new Error("Aucun média disponible.");
    }
    showNextMedia();
    logEvent("info", "Lightbox : média suivant.");
  } catch (error) {
    logEvent("error", `Erreur média suivant : ${error.message}`, { error });
  }
}

/*==============================================*/
/*             Tri des Médias                   */
/*==============================================*/

export async function handleSortChange(event) {
  try {
    if (!event.target.value) {
      throw new Error("Option de tri invalide.");
    }
    const sortOption = event.target.value;
    logEvent("info", `Tri sélectionné : ${sortOption}`);
    await handleMediaSort(sortOption);
    logEvent("success", "Tri appliqué.");
  } catch (error) {
    logEvent("error", `Erreur tri : ${error.message}`, { error });
  }
}

/*==============================================*/
/*               Gestion des Likes              */
/*==============================================*/

export function handleLikeClick(event, totalLikesElement) {
  try {
    const icon = event.target;
    const mediaItem = icon.closest(".media-item");
    if (!mediaItem) {
      throw new Error("Média introuvable.");
    }

    const mediaId = mediaItem.dataset.id;
    const likeCounter = mediaItem.querySelector(".media-likes");
    if (!mediaId || !likeCounter) {
      throw new Error("ID ou compteur manquant.");
    }

    let currentLikes = parseInt(likeCounter.textContent, 10) || 0;
    let totalLikes = parseInt(totalLikesElement.textContent, 10) || 0;

    if (icon.classList.contains("liked")) {
      icon.classList.remove("liked");
      likeCounter.textContent = currentLikes - 1;
      totalLikesElement.textContent = totalLikes - 1;
      logEvent("info", `Like retiré (ID : ${mediaId})`);
    } else {
      icon.classList.add("liked");
      likeCounter.textContent = currentLikes + 1;
      totalLikesElement.textContent = totalLikes + 1;
      logEvent("success", `Like ajouté (ID : ${mediaId})`);
    }
  } catch (error) {
    logEvent("error", `Erreur like : ${error.message}`, { error });
  }
}

/*==============================================*/
/*         Navigation Clavier Global            */
/*==============================================*/

export function handleKeyboardEvent(event) {
  try {
    if (!event?.key) {
      throw new Error("Événement clavier non défini.");
    }
    const activeModal = document.querySelector(".modal.modal-active");
    const activeLightbox = document.querySelector(".lightbox[aria-hidden='false']");
    const activeMedia = document.querySelector(".media-item.selected");

    if (document.activeElement.tagName === "VIDEO" && !document.activeElement.paused) {
      logEvent("warn", "Vidéo en cours → Navigation désactivée.");
      return;
    }

    if (!activeModal && !activeLightbox) {
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
          if (activeMedia && window.mediaList) {
            const mediaId = activeMedia.getAttribute("data-id");
            const mediaIndex = window.mediaList.findIndex(media => media.id == mediaId);
            if (mediaIndex !== -1) {
              openLightbox(mediaIndex, window.mediaList, window.globalFolderName);
              event.preventDefault();
            }
          }
          break;
      }
    }
  } catch (error) {
    logEvent("error", `Erreur clavier : ${error.message}`, { error });
  }
}

/*==============================================*/
/*        INITIALISATION DOMContentLoaded       */
/*==============================================*/

document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("keydown", handleKeyboardEvent);
  logEvent("success", "Gestion clavier activée.");

  // ✅ Activation dynamique des onglets projet
  if (window.location.pathname.includes("projet.html")) {
    setupTabSwitching();
    logEvent("success", "Onglets projet initialisés.");
  }
});
