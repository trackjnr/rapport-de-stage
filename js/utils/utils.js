/* =============================================================================
/* PROJET      : Les Petits Plats
/* FICHIER     : utils.js
/* AUTEUR      : Trackjnr
/* DATE        : 21/01/2025
/* VERSION     : 1.2.0
/* DESCRIPTION : Fonctions utilitaires globales du projet.
/*               - Gestion et vérification des logs.
/*               - Manipulation sécurisée des classes CSS.
/*               - Détection de la page actuelle.
/*               - Gestion des erreurs des formulaires.
/* ============================================================================= */

/* =============================================================================
/* SECTION : IMPORTATIONS (Imports des constantes globales)
/* ============================================================================= */

import {
  CONFIGLOG, // Configuration des logs (niveaux de logs, couleurs, icônes...)
  ENVIRONMENTS, // Liste des environnements (Développement, Production...)
  ACTIVE_ENVIRONMENT, // Environnement actif du projet
} from "../config/constants.js";

/* =============================================================================
/*                 SECTION 1 : FONCTIONS DE LOG
/* ============================================================================= */

/* =============================================================================
/* 1.1 ISLOGENABLED : VÉRIFICATION DE L'ACTIVATION DES LOGS
/* ============================================================================= */

/**
 * Vérifie si un niveau de log est activé selon la configuration du projet.
 *
 * - Prend en compte :
 *   - La configuration des niveaux de log (`CONFIGLOG.LOG_LEVELS`).
 *   - La verbosité sélectionnée (`CONFIGLOG.VERBOSITY`).
 *   - L'environnement actif (`ACTIVE_ENVIRONMENT`).
 * - Restreint certains logs à l'environnement de développement uniquement.
 *
 * @param {string} level - Niveau de log à vérifier (ex : "info", "error", etc.).
 * @returns {boolean} `true` si le log est autorisé, sinon `false`.
 */
export const isLogEnabled = (level) => {
  // === Validation de l'entrée : Vérifie que `level` est une chaîne de caractères ===
  if (typeof level !== "string" || level.trim() === "") {
    console.error("isLogEnabled : Niveau de log invalide.", { level });
    return false; // Stoppe la fonction si le niveau est invalide
  }

  // === Définition des niveaux de verbosité ===
  const verbosityMap = {
    low: ["error", "warn"], // Mode bas : seulement erreurs et avertissements
    medium: ["error", "warn", "success"], // Mode moyen : inclut les succès
    high: ["error", "warn", "success", "info", "test_start", "test_end"], // Mode haut : inclut tous les logs
  };

  // === Récupération des niveaux de logs autorisés selon la verbosité ===
  const allowedLevels = verbosityMap[CONFIGLOG.VERBOSITY] || [];

  // === Vérifie si le niveau demandé est activé dans la configuration globale ===
  const isLevelEnabledInConfig = CONFIGLOG.LOG_LEVELS?.[level] ?? false;

  // === Vérifie si le niveau demandé est inclus dans la verbosité active ===
  const isAllowedByVerbosity = allowedLevels.includes(level);

  // === Limitation des logs "info" et "test" aux environnements de développement uniquement ===
  const isEnvironmentAllowed =
    ACTIVE_ENVIRONMENT === ENVIRONMENTS.DEVELOPMENT || // Si on est en développement, tous les logs sont autorisés
    !["info", "test_start", "test_end"].includes(level); // Sinon, ces logs sont bloqués

  // === Retourne `true` uniquement si toutes les conditions sont validées ===
  return isLevelEnabledInConfig && isAllowedByVerbosity && isEnvironmentAllowed;
};

/* =============================================================================
/* 1.2 LOGEVENT : ENREGISTREMENT D'UN ÉVÉNEMENT DE LOG
/* ============================================================================= */

/**
 * Enregistre un événement de log dans la console avec formatage avancé.
 *
 * - Génère un horodatage pour chaque log.
 * - Applique un style et une icône spécifique selon le type de log.
 * - Permet d'ajouter des données contextuelles pour un meilleur débogage.
 * - Gère les erreurs pour éviter un crash en cas de problème.
 *
 * @param {string} type - Type de log (ex: "info", "warn", "error").
 * @param {string} message - Message à afficher.
 * @param {Object} [data={}] - Données contextuelles facultatives.
 */
export function logEvent(type, message, data = {}) {
  // === Validation du type de log ===
  if (!type || typeof type !== "string") {
    console.error("logEvent : Type de log invalide ou non défini.", { type });
    return; // Stoppe l'exécution si le type est invalide
  }

  // === Génération d'un horodatage formaté ===
  const timestamp = new Date().toLocaleTimeString();

  // === Construction du préfixe standardisé pour les logs ===
  const prefix = `[stage][${timestamp}]`;

  // === Sélection des icônes en fonction du type de log ===
  const icon =
    CONFIGLOG.LOG_ICONS?.[type] || CONFIGLOG.LOG_ICONS?.default || "🔵";

  // === Sélection du style CSS pour afficher le log coloré ===
  const style =
    CONFIGLOG.LOG_STYLES?.[type] ||
    CONFIGLOG.LOG_STYLES?.default ||
    "color: black;";

  // === Construction du message final formaté ===
  const fullMessage = `${icon} ${prefix} ${type.toUpperCase()}: ${message}`;

  try {
    // === Vérification et affichage du log dans la console ===
    if (console[type] && typeof console[type] === "function") {
      console[type](`%c${fullMessage}`, style, data); // Affichage stylisé
    } else {
      console.log(`%c${fullMessage}`, style, data); // Affichage par défaut si `console[type]` n'existe pas
    }
  } catch (error) {
    // === Gestion des erreurs en cas de problème avec la console ===
    console.error(
      "%cErreur dans logEvent :",
      CONFIGLOG.LOG_STYLES?.error || "color: red;",
      error,
    );
  }
}

/* =============================================================================
/*              SECTION 2 : MANIPULATION DES CLASSES CSS
/* ============================================================================= */

/* =============================================================================
/* 2.1 ADDCLASS : AJOUT SÉCURISÉ D'UNE CLASSE CSS À UN ÉLÉMENT
/* ============================================================================= */

/**
 * Ajoute une classe CSS à un élément HTML de manière sécurisée.
 *
 * - Vérifie si `element` est bien un élément HTML valide.
 * - Vérifie si `className` est une chaîne de caractères valide.
 * - Vérifie si la classe est déjà présente avant de l'ajouter.
 * - Gère les erreurs pour éviter tout crash.
 *
 * @param {HTMLElement} element - Élément cible.
 * @param {string} className - Classe CSS à ajouter.
 * @returns {boolean} `true` si la classe a été ajoutée, sinon `false`.
 */
export function addClass(element, className) {
  // === Validation de l'élément HTML ===
  if (!(element instanceof HTMLElement)) {
    logEvent("error", "addClass: Élément HTML invalide.", { element });
    return false; // Retourne `false` si l'élément n'est pas valide
  }

  // === Validation du nom de classe ===
  if (typeof className !== "string" || className.trim() === "") {
    logEvent("error", "addClass: Nom de classe invalide.", { className });
    return false; // Retourne `false` si la classe est invalide
  }

  // === Vérifie si la classe est déjà présente pour éviter un ajout inutile ===
  if (element.classList.contains(className)) {
    logEvent("info", `addClass: Classe "${className}" déjà présente.`, {
      element,
    });
    return false; // Retourne `false` si la classe est déjà appliquée
  }

  try {
    // === Ajout sécurisé de la classe ===
    element.classList.add(className);

    // === Log de confirmation de l'ajout ===
    logEvent("success", `addClass: Classe "${className}" ajoutée.`, {
      element,
    });

    return true; // Retourne `true` si l'ajout est réussi
  } catch (error) {
    // === Gestion des erreurs en cas d'échec ===
    logEvent("error", "addClass: Erreur lors de l'ajout de la classe.", {
      error,
    });
    return false; // Retourne `false` en cas d'erreur
  }
}

/* =============================================================================
/* 2.2 REMOVECLASS : SUPPRESSION SÉCURISÉE D'UNE CLASSE CSS D'UN ÉLÉMENT
/* ============================================================================= */

/**
 * Supprime une classe CSS d'un élément HTML de manière sécurisée.
 *
 * - Vérifie si `element` est bien un élément HTML valide.
 * - Vérifie si `className` est une chaîne de caractères valide.
 * - Vérifie si la classe est bien présente avant de la supprimer.
 * - Gère les erreurs pour éviter tout crash.
 *
 * @param {HTMLElement} element - Élément cible.
 * @param {string} className - Classe CSS à supprimer.
 * @returns {boolean} `true` si la classe a été supprimée, sinon `false`.
 */
export function removeClass(element, className) {
  // === Validation de l'élément HTML ===
  if (!(element instanceof HTMLElement)) {
    logEvent("error", "removeClass: Élément HTML invalide.", { element });
    return false; // Retourne `false` si l'élément n'est pas valide
  }

  // === Validation du nom de classe ===
  if (typeof className !== "string" || className.trim() === "") {
    logEvent("error", "removeClass: Nom de classe invalide.", { className });
    return false; // Retourne `false` si la classe est invalide
  }

  // === Vérifie si la classe est bien présente pour éviter une suppression inutile ===
  if (!element.classList.contains(className)) {
    logEvent("info", `removeClass: Classe "${className}" non présente.`, {
      element,
    });
    return false; // Retourne `false` si la classe n'est pas appliquée
  }

  try {
    // === Suppression sécurisée de la classe ===
    element.classList.remove(className);

    // === Log de confirmation de la suppression ===
    logEvent("success", `removeClass: Classe "${className}" supprimée.`, {
      element,
    });

    return true; // Retourne `true` si la suppression est réussie
  } catch (error) {
    // === Gestion des erreurs en cas d'échec ===
    logEvent(
      "error",
      "removeClass: Erreur lors de la suppression de la classe.",
      { error },
    );
    return false; // Retourne `false` en cas d'erreur
  }
}
/**
 * Attend qu'un élément spécifique apparaisse dans le DOM avant de l’utiliser.
 *
 * - Utilise `safeQuerySelector()` pour exploiter le cache DOM.
 * - Observe les changements en temps réel avec `MutationObserver`.
 * - Gère proprement le timeout pour éviter les boucles infinies.
 *
 * @param {string} selector - Sélecteur CSS de l'élément à attendre.
 * @param {number} timeout - Délai maximum (par défaut : 5000ms).
 * @returns {Promise<Element>} Élément DOM résolu ou rejeté après expiration.
 */


/**
 * Fonction debounce pour limiter l'exécution d'une fonction lorsqu'elle est appelée fréquemment.
 *
 * - Empêche l’exécution immédiate à chaque frappe.
 * - N'exécute la fonction qu'après un temps d'inactivité défini.
 *
 * @param {Function} func - Fonction à exécuter après le délai.
 * @param {number} delay - Temps en millisecondes avant l'exécution (ex : 300ms).
 * @returns {Function} Fonction enveloppée avec debounce.
 */
export function debounce(func, delay = 300) {
  let timeout;

  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
}

export function sanitizeText(text) {
  if (typeof text !== "string") {
    return "";
  }

  return text.replace(/[&<>"'/]/g, (char) => {
    const charMap = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
      "/": "&#x2F;",
    };
    return charMap[char] || char;
  });
}
/*===============================================================================================*/
/*                                 ======= Messages erreurs =======                              */
/*===============================================================================================*/

/* ============ Fonction pour afficher un message d'erreur et ajouter une bordure rouge ============*/

/**
 * Affiche un message d'erreur et applique une bordure rouge au champ cible.
 *
 * @param {string} message - Message d'erreur à afficher.
 * @param {HTMLElement} inputElement - Champ d'entrée associé à l'erreur.
 */
export function showError(message, inputElement) {
  try {
    // === Validation des paramètres ===
    if (!message || !(inputElement instanceof HTMLElement)) {
      logEvent("error", "Paramètres invalides dans showError.", {
        message,
        inputElement,
      });
      return;
    }

    // === Log : Début de l'affichage de l'erreur ===
    logEvent("info", "Affichage d'une erreur.", {
      field: inputElement.id || "non défini",
      message,
    });

    // === Suppression des erreurs existantes (pour éviter les doublons) ===
    removeError(inputElement);

    // === Création et ajout du message d'erreur ===
    const errorTooltip = document.createElement("div");
    errorTooltip.classList.add("error-modal"); // Classe CSS pour styliser le message d'erreur
    errorTooltip.textContent = message; // Ajout du texte d'erreur

    // Applique une bordure rouge au champ d'entrée
    inputElement.classList.add("error-input");

    // Ajoute le message d'erreur en tant qu'enfant de l'élément parent
    const { parentElement } = inputElement;
    if (parentElement) {
      parentElement.appendChild(errorTooltip);
    } else {
      logEvent("error", "Impossible de trouver l'élément parent.", {
        field: inputElement.id || "non défini",
      });
    }

    // === Log : Succès de l'ajout ===
    logEvent("success", "Message d'erreur ajouté.", {
      field: inputElement.id || "non défini",
      message,
    });
  } catch (error) {
    // === Gestion des erreurs ===
    logEvent("error", "Erreur dans showError.", { error: error.message });
  }
}

/* ============ Fonction pour supprimer un message d'erreur et retirer la bordure rouge ============ */
/**
 * Supprime un message d'erreur et retire la bordure rouge du champ cible.
 *
 * @param {HTMLElement} inputElement - Champ d'entrée associé à l'erreur.
 */
export function removeError(inputElement) {
  try {
    // === Validation du paramètre ===
    if (!(inputElement instanceof HTMLElement)) {
      logEvent("error", "Paramètre invalide dans removeError.", {
        inputElement,
      });
      return;
    }

    // === Suppression du message d'erreur ===
    const { parentElement } = inputElement;
    if (parentElement) {
      const errorTooltip = parentElement.querySelector(".error-modal");
      if (errorTooltip) {
        errorTooltip.remove(); // Supprime l'élément du DOM
        logEvent("success", "Message d'erreur supprimé.", {
          field: inputElement.id || "non défini",
        });
      }
    } else {
      logEvent("error", "Impossible de trouver l'élément parent.", {
        field: inputElement.id || "non défini",
      });
    }

    // === Suppression de la classe de bordure rouge ===
    inputElement.classList.remove("error-input");

    // === Log : Succès de la suppression ===
    logEvent("success", "Erreur visuelle supprimée.", {
      field: inputElement.id || "non défini",
    });
  } catch (error) {
    // === Gestion des erreurs ===
    logEvent("error", "Erreur dans removeError.", { error: error.message });
  }
}