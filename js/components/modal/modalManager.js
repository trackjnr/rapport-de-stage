/*==================
// Nom du fichier : modal.manager.js
// Description    : Gestion de la modale dans l'application Fisheye
// Auteur         : Trackozor
// Date           : 01/01/2025
// Version        : 2.4.0 (Corrections et logs enrichis)
// ========================================================

/*==============================================*/
/*              Imports                        */
/*=============================================*/
import { logEvent } from "../../utils/utils.js";
import domSelectors from "../../config/domSelectors.js";

/*==============================================*/
/*              Variables                       */
/*=============================================*/
let modalOpen = false; // Variable globale pour suivre l'état de la modale
let modalConfirm = false; // Suivi global de l'état de la modale de confirmation

/*==============================================*/
/*              Ouverture modale                */
/*=============================================*/
/**
 * Affiche la modale de contact et empêche le défilement en arrière-plan.
 *
 * ### **Fonctionnement :**
 * - Vérifie si les données du photographe sont valides.
 * - Récupère et met à jour les éléments DOM de la modale.
 * - Insère dynamiquement le nom du photographe dans la modale.
 * - Active l'affichage de la modale et empêche le scroll en arrière-plan.
 *
 * ### **Gestion des erreurs :**
 * - Vérifie la présence et la validité des données du photographe avant ouverture.
 * - Vérifie l'existence des éléments DOM nécessaires avant de les manipuler.
 * - Capture et journalise toute erreur survenue.
 *
 * @async
 * @function launchModal
 * @param {Object} photographerData - Données du photographe (nom, ID, etc.).
 * @throws {Error} Génère une erreur si les éléments DOM ou les données sont invalides.
 */


export async function launchModal(photographerData) {
  logEvent("test_start", "Début de l'ouverture de la modale.");

  try {
    if (!photographerData || !photographerData.name) {
      throw new Error("Données du photographe invalides ou manquantes.");
    }

    logEvent("info", "Données du photographe valides.", { photographerData });

    // Sélection des éléments DOM
    const contactOverlay = document.getElementById("modal-overlay");
    const contactModal = document.getElementById("contact-modal");

    if (!contactOverlay || !contactModal) {
      throw new Error("Éléments DOM requis pour la modale introuvables.");
    }

    // Insertion du nom dans la modale
    const modalTitle = contactModal.querySelector(".modal-photographer-name");
    if (modalTitle) {
      modalTitle.textContent = `${photographerData.name}`;
      logEvent("info", "Nom du photographe inséré dans la modale.");
    } else {
      logEvent("warn", "Impossible de trouver l'élément pour insérer le nom.");
    }

    // Affichage de la modale
    contactOverlay.classList.add("modal-active");
    contactModal.classList.add("modal-active");
    document.body.classList.add("no-scroll");

    logEvent("success", "Modale affichée avec succès.");
  } catch (error) {
    logEvent("error", "Erreur lors de l'ouverture de la modale.", {
      message: error.message,
      stack: error.stack,
    });
  }
  modalOpen = true;
  logEvent("test_end", "Fin de l'ouverture de la modale.");
}



/*==============================================*/
/*              Fermeture modale                */
/*=============================================*/
/**
 * Ferme la modale et réactive le défilement de la page.
 *
 * ### **Fonctionnement :**
 * - Vérifie si la modale est actuellement ouverte avant de tenter de la fermer.
 * - Supprime les classes CSS pour masquer la modale et l'overlay.
 * - Désactive la modale de confirmation si elle est active.
 * - Réactive le défilement de la page (`body`).
 * - Met à jour l'état global `modalOpen`.
 *
 * ### **Gestion des erreurs :**
 * - Vérifie la validité des éléments DOM avant manipulation.
 * - Capture et journalise toute erreur dans `logEvent("error", ...)`.
 * - Évite de tenter une fermeture inutile si la modale est déjà fermée.
 *
 * @async
 * @function closeModal
 * @returns {void}
 */

export async function closeModal() {
  logEvent("test_start", "Début de la tentative de fermeture de la modale.");

  try {
    logEvent("info", "Vérification de l'état de la modale...");
    const contactOverlay = document.getElementById("modal-overlay");
    const contactModal = document.getElementById("contact-modal");
    const confirmationModal = document.getElementById("confirmation-modal");

    if (!modalOpen || !contactModal?.classList?.contains("modal-active")) {
      logEvent("warn", "Modale déjà fermée ou état incohérent.", {
        modalOpen,
        modalClasses: contactModal?.classList?.value || "Inexistant",
      });
      return;
    }

    // Suppression des classes pour masquer la modale
    if (contactOverlay && contactOverlay.classList) {
      contactOverlay.classList.remove("modal-active");
      logEvent("info", "Classe 'modal-active' supprimée de l'overlay.");
    } else {
      logEvent("warn", "Overlay introuvable ou invalide.");
    }

    if (contactModal && contactModal.classList) {
      contactModal.classList.remove("modal-active");
      logEvent("info", "Classe 'modal-active' supprimée de la modale.");
    } else {
      logEvent("warn", "Modale principale introuvable ou invalide.");
    }

    if (confirmationModal && confirmationModal.classList) {
      confirmationModal.classList.remove("modal-active");
      logEvent(
        "info",
        "Classe 'modal-active' supprimée de la modale de confirmation.",
      );
    } else {
      logEvent("warn", "Aucune modale de confirmation active à fermer.");
    }

    // Réactivation du défilement
    if (document.body.classList.contains("no-scroll")) {
      document.body.classList.remove("no-scroll");
      logEvent("success", "Défilement réactivé.");
    }

    modalOpen = false;
    logEvent("info", "État global de la modale mis à jour : 'fermé'.", {
      modalOpen,
    });
  } catch (error) {
    logEvent("error", "Erreur lors de la fermeture de la modale.", {
      message: error.message,
      stack: error.stack,
    });
  }

  logEvent("test_end", "Fin de la tentative de fermeture de la modale.");
}


/*==============================================*/
/*              Modale de confirmation          */
/*=============================================*/

/*==============================================*/
/*              Ouverture         */
/*=============================================*/
/**
 * Ouvre la modale de confirmation.
 *
 * ### **Fonctionnement :**
 * - Vérifie si la modale est déjà ouverte via `modalConfirm`.
 * - Vérifie si la classe `.modal-active` est déjà présente dans le DOM.
 * - Ajoute la classe `.modal-active` pour afficher la modale.
 * - Met à jour `modalConfirm` pour éviter une ouverture multiple.
 * - Capture et journalise les erreurs.
 *
 * ### **Gestion des erreurs :**
 * - Vérifie la présence de `domSelectors.modal.confirmationModal` avant d'accéder à `container`.
 * - Capture toute exception et log l'erreur avec `logEvent("error", ...)`.
 *
 * @function openConfirmationModal
 * @returns {void}
 */

export function openConfirmationModal() {
  logEvent("test_start", "Début de l'ouverture de la modale de confirmation.");

  try {
    const { container: confirmationModal } =
      domSelectors.modal.confirmationModal;

    if (!confirmationModal) {
      logEvent(
        "error",
        "Élément DOM de la modale de confirmation introuvable.",
      );
      throw new Error("L'élément 'confirmation-modal' est introuvable.");
    }

    if (modalConfirm) {
      logEvent(
        "warn",
        "La modale de confirmation est déjà ouverte (via modalConfirm).",
      );
      return;
    }

    // Vérifie également dans le DOM pour plus de robustesse
    if (confirmationModal.classList.contains("modal-active")) {
      logEvent("warn", "La modale de confirmation est déjà ouverte (via DOM).");
      modalConfirm = true; // Met à jour l'état
      return;
    }

    // Ajoute la classe pour afficher la modale
    confirmationModal.classList.add("modal-active");
    confirmationModal.setAttribute("aria-hidden", "false");

    // Met à jour l'état global
    modalConfirm = true;

    logEvent("success", "Modale de confirmation affichée avec succès.", {
      modalClasses: confirmationModal.classList.value,
    });
  } catch (error) {
    logEvent(
      "error",
      "Erreur lors de l'ouverture de la modale de confirmation.",
      {
        message: error.message,
        stack: error.stack,
      },
    );
  }

  logEvent("test_end", "Fin de l'ouverture de la modale de confirmation.");
}




/*==============================================*/
/*              Fermeture         */
/*=============================================*/
/**
 * Ferme la modale de confirmation et réinitialise le formulaire si nécessaire.
 *
 * ### **Fonctionnement :**
 * - Vérifie que la modale est bien présente et active.
 * - Supprime la classe `.modal-active` et met `aria-hidden="true"`.
 * - Réinitialise le formulaire associé si disponible.
 * - Met à jour `modalConfirm` pour éviter un état incohérent.
 * - Capture et journalise toute erreur éventuelle.
 *
 * ### **Gestion des erreurs :**
 * - Vérifie que `domSelectors.modal.confirmationModal` est bien défini avant d’accéder à `container`.
 * - Vérifie que `.modal-active` est bien supprimé après fermeture.
 * - Capture et log toute exception via `logEvent("error", ...)`.
 *
 * @function closeConfirmationModal
 * @returns {void}
 */

/*
 * Ferme la modale de confirmation.
 *
 * @returns {void}
 */
export function closeConfirmationModal() {
  logEvent("test_start", "Début de la fermeture de la modale de confirmation.");

  try {
    const { container: confirmationModal } =
      domSelectors.modal.confirmationModal;
    const { formElement } = domSelectors.modal.form; // Récupération du formulaire

    if (!confirmationModal || !modalConfirm) {
      logEvent(
        "warn",
        "La modale de confirmation est déjà fermée ou introuvable.",
      );
      return;
    }

    // Supprime la classe pour masquer la modale
    confirmationModal.classList.remove("modal-active");
    confirmationModal.setAttribute("aria-hidden", "true");

    // Réinitialise le formulaire si présent
    if (formElement) {
      formElement.reset();
      logEvent("info", "Formulaire réinitialisé avec succès.");
    } else {
      logEvent("warn", "Aucun formulaire à réinitialiser.");
    }

    // Met à jour l'état global
    modalConfirm = false;

    logEvent("success", "Modale de confirmation masquée avec succès.", {
      modalClasses: confirmationModal.classList.value,
    });
  } catch (error) {
    logEvent(
      "error",
      "Erreur lors de la fermeture de la modale de confirmation.",
      {
        message: error.message,
        stack: error.stack,
      },
    );
  }

  logEvent("test_end", "Fin de la fermeture de la modale de confirmation.");
}
/*==============================================*/
/*              Modale erreur spam            */
/*=============================================*/

/*==============================================*/
/*              Ouverture                     */
/*=============================================*
/**
 * Affiche la modale d'erreur lorsqu'un spam est détecté.
 *
 * ### **Fonctionnement :**
 * - Vérifie que la modale anti-spam est bien présente dans le DOM.
 * - Ajoute les classes CSS nécessaires pour l'afficher et empêcher le défilement.
 * - Capture et journalise toute erreur éventuelle.
 *
 * ### **Gestion des erreurs :**
 * - Vérifie que `spamModal.container` existe avant de modifier ses classes.
 * - Vérifie que `document.body` existe avant d'ajouter la classe `BODY_NO_SCROLL`.
 * - Empêche les ajouts inutiles de classes déjà présentes.
 *
 * @function showSpamModal
 * @returns {void}
 */

export function showSpamModal() {
  try {
    // Vérification de la structure du DOM pour éviter toute erreur
    if (!domSelectors?.spamModal?.container) {
      logEvent("error", "Impossible de trouver la modale anti-spam.");
      throw new Error("Élément 'spamModal.container' introuvable.");
    }

    // Récupération des classes CSS définies dans domSelectors
    const { MODAL_ACTIVE, BODY_NO_SCROLL } = domSelectors.CSS_CLASSES;
    const { container: spamModalContainer } = domSelectors.spamModal;

    // Vérifie si la modale est déjà active pour éviter des ajouts inutiles
    if (!spamModalContainer.classList.contains(MODAL_ACTIVE)) {
      spamModalContainer.classList.add(MODAL_ACTIVE);
      spamModalContainer.setAttribute("aria-hidden", "false");
      logEvent("info", "Modale anti-spam activée.");
    } else {
      logEvent("warn", "La modale anti-spam est déjà active.");
    }

    // Vérifie et applique le blocage du scroll seulement si nécessaire
    if (!document.body.classList.contains(BODY_NO_SCROLL)) {
      document.body.classList.add(BODY_NO_SCROLL);
      logEvent("info", "Défilement désactivé pour l'affichage de la modale anti-spam.");
    } else {
      logEvent("warn", "Le défilement est déjà désactivé.");
    }

  } catch (error) {
    logEvent("error", "Erreur lors de l'affichage de la modale anti-spam.", {
      message: error.message,
      stack: error.stack,
    });
  }
}


/*==============================================*/
/*              Fermeture                      */
/*=============================================*/
/**
 * Ferme la modale anti-spam et réactive le défilement de la page.
 *
 * ### **Fonctionnement :**
 * - Vérifie que la modale anti-spam est bien présente dans le DOM.
 * - Supprime les classes CSS nécessaires pour masquer la modale et réactiver le scroll.
 * - Retire l'écouteur d'événement du bouton de fermeture pour éviter les fuites mémoire.
 *
 * ### **Gestion des erreurs :**
 * - Vérifie que `container` est bien défini avant de modifier ses classes.
 * - Vérifie que `document.body` est bien présent avant de modifier `BODY_NO_SCROLL`.
 * - Empêche les suppressions inutiles de classes déjà absentes.
 *
 * @function closeSpamModal
 * @returns {void}
 */

export function closeSpamModal() {
  try {
    // Récupération des éléments DOM
    const { container, closeButton } = domSelectors.modal.spamModal;
    const { MODAL_ACTIVE, BODY_NO_SCROLL } = domSelectors.CSS_CLASSES;

    // Vérification stricte des éléments essentiels
    if (!container) {
      logEvent(
        "error",
        "Impossible de trouver le conteneur de la modale anti-spam."
      );
      throw new Error("Élément 'spamModal.container' introuvable.");
    }

    // Vérifie si la modale est déjà fermée pour éviter des actions inutiles
    if (!container.classList.contains(MODAL_ACTIVE)) {
      logEvent("warn", "La modale anti-spam est déjà fermée.");
      return;
    }

    // Suppression de la classe active de la modale
    container.classList.remove(MODAL_ACTIVE);
    container.setAttribute("aria-hidden", "true");
    logEvent("info", "Modale anti-spam masquée.");

    // Suppression du blocage du scroll si nécessaire
    if (document.body.classList.contains(BODY_NO_SCROLL)) {
      document.body.classList.remove(BODY_NO_SCROLL);
      logEvent("info", "Défilement réactivé après fermeture de la modale anti-spam.");
    } else {
      logEvent("warn", "Le défilement était déjà activé.");
    }

    // Suppression de l'event listener pour éviter les fuites mémoire
    if (closeButton) {
      closeButton.removeEventListener("click", closeSpamModal);
      logEvent("info", "Écouteur d'événement supprimé du bouton de fermeture.");
    } else {
      logEvent("warn", "Aucun bouton de fermeture défini pour la modale anti-spam.");
    }
  } catch (error) {
    logEvent("error", "Erreur lors de la fermeture de la modale anti-spam.", {
      message: error.message,
      stack: error.stack,
    });
  }
}