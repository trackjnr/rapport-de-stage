// ========================================================
// Nom du fichier : lightbox.js
// Description    : Gestion de la lightbox pour afficher les médias (images ou vidéos) en plein écran.
// Auteur         : Trackozor
// Date           : 15/01/2025
// Version        : 1.4.1 (Optimisation de la gestion des animations et suppression des doublons)
// ========================================================

/*==============================================*/
/*              Imports et Config              */
/*==============================================*/
import { logEvent } from "../../utils/utils.js";
import domSelectors from "../../config/domSelectors.js";
import {handleLightboxNavigation} from "../../events/keyboardHandler.js";
// Indice du média actuellement affiché dans la lightbox
let currentIndex = 0;

// Liste des médias disponibles pour la lightbox
let mediaList = [];

// Nom du dossier contenant les fichiers médias (images, vidéos, etc.)
let globalFolderName = "";
let isVideoLightboxOpen = false; // Indicateur d'ouverture pour les vidéos
let isTransitioning = false;
let lastDirection = "right";  

let exitClass = "";

/*==============================================*/
/*              Initialisation              */
/*==============================================*/
/**
 * Initialise la lightbox avec une liste de médias.
 * 
 * ### **Fonctionnement :**
 * - Vérifie que `mediaArray` est un **tableau valide** et **non vide**.
 * - Vérifie que `folderName` est **une chaîne de caractères valide**.
 * - Stocke la liste des médias et le dossier associé dans des variables globales.
 * - Initialise `currentIndex` à `0` pour afficher le premier média.
 * - Journalise chaque étape avec `logEvent()`.
 * 
 * ### **Gestion des erreurs :**
 * - Vérifie si `mediaArray` est **un tableau valide** avant de continuer.
 * - Vérifie que `folderName` est **une chaîne valide**, sinon une erreur est levée.
 * - Capture et journalise toute erreur rencontrée via `logEvent("error", ...)`.
 * - En cas d'erreur critique, **lève une exception** pour empêcher une mauvaise configuration.
 * 
 * @function initLightbox
 * @param {Array} mediaArray - Tableau contenant les médias à afficher dans la lightbox.
 * @param {string} folderName - Nom du dossier contenant les fichiers médias.
 * @throws {Error} Lève une erreur si `mediaArray` est invalide ou si `folderName` est incorrect.
 */

export function initLightbox(mediaArray, folderName) {
    logEvent("init", "Début de l'initialisation de la lightbox.", { mediaArray });

    if (!Array.isArray(mediaArray) || mediaArray.length === 0) {
        logEvent("warn", "Le tableau de médias est vide ou invalide.");
        mediaList = [];
        globalFolderName = folderName || "";
        return;
    }

    if (typeof folderName !== "string" || folderName.trim() === "") {
        logEvent("error", "Nom du dossier (folderName) invalide ou manquant.", { folderName });
        throw new Error("Le nom du dossier doit être une chaîne de caractères non vide.");
    }

    try {
        mediaList = [...mediaArray];
        globalFolderName = folderName;
        currentIndex = 0;

        lastDirection = "right";  
        isTransitioning = false;  

        logEvent("success", "Lightbox initialisée avec succès.", { mediaList });
    } catch (error) {
        logEvent("error", "Erreur lors de l'initialisation de la lightbox.", { error });
        throw new Error("Erreur d'initialisation de la lightbox : " + error.message);
    }
}


/*==============================================*/
/*              Ouverture lightbox            */
/*==============================================*/
/**
 * Ouvre la lightbox pour afficher un média à l'index spécifié.
 * 
 * ### **Fonctionnement :**
 * - Vérifie que `lightboxContainer` existe dans le DOM avant toute modification.
 * - Met à jour `mediaList` et `globalFolderName` si une nouvelle liste de médias est fournie.
 * - Vérifie que l'`index` demandé est dans les limites de la liste de médias.
 * - Met à jour `currentIndex` pour suivre le média actuellement affiché.
 * - Met à jour le contenu de la lightbox via `updateLightboxContent()`.
 * - Rend la lightbox visible (`.hidden` supprimé et `aria-hidden` mis à `false`).
 * - Journalise chaque étape avec `logEvent()`.
 * 
 * ### **Gestion des erreurs :**
 * - Vérifie que `lightboxContainer` est **présent dans le DOM** avant d’y accéder.
 * - Vérifie que `mediaArray` est **un tableau valide** et **différent de `mediaList` existant** avant de le mettre à jour.
 * - Vérifie que `index` est **un nombre valide et dans les limites** de `mediaList`, sinon une erreur est levée.
 * - Capture et journalise toute erreur avec `logEvent("error", ...)`.
 * 
 * @function openLightbox
 * @param {number} index - Index du média à afficher dans la lightbox.
 * @param {Array} mediaArray - Tableau contenant les médias (optionnel si déjà défini).
 * @param {string} folderName - Nom du dossier contenant les fichiers médias.
 * @throws {Error} Lève une erreur si `lightboxContainer` est introuvable ou si `index` est invalide.
 */

export function openLightbox(index, mediaArray, folderName) {
    logEvent("action", ` Tentative d'ouverture de la lightbox pour l'index ${index}.`, { index });

    try {
        const { lightboxContainer } = domSelectors.lightbox;

        if (!lightboxContainer) {
            throw new Error(" Conteneur principal de la lightbox introuvable.");
        }

        //  Vérifier si mediaArray contient des éléments valides avant de l'affecter
        if (Array.isArray(mediaArray) && mediaArray.length > 0) {
            mediaList = [...mediaArray];
            globalFolderName = folderName;
        }

       

        //  Tout est correct, on met à jour currentIndex et affiche le média
        currentIndex = index;
        updateLightboxContent(mediaList[currentIndex], globalFolderName, "right");

        lightboxContainer.classList.remove("hidden");
        lightboxContainer.setAttribute("aria-hidden", "false");

        // Ajoute les écouteurs pour navigation et fermeture
        document.querySelector(".lightbox-overlay")?.addEventListener("click", closeLightbox);
        
        if (!document.__lightboxKeyboardListener) {
            document.addEventListener("keydown", handleLightboxNavigation);
            document.__lightboxKeyboardListener = true;
        }

        logEvent("success", `Lightbox ouverte avec succès pour l'index ${currentIndex}.`);

    } catch (error) {
        logEvent("error", ` Erreur lors de l'ouverture de la lightbox : ${error.message}`, { error });
    }
}


/*==============================================*/
/*              Fermeture lightbox            */
/*==============================================*/
/**
 * Ferme la lightbox et réinitialise son état.
 * 
 * ### **Fonctionnement :**
 * - Vérifie que le `lightboxContainer` existe avant toute interaction.
 * - Supprime le média actuellement affiché pour libérer la mémoire.
 * - Réinitialise le texte du titre (`lightboxCaption`).
 * - Réinitialise les variables globales (`currentIndex`, `mediaList`, `globalFolderName`).
 * - Ajoute la classe `hidden` pour masquer la lightbox et met `aria-hidden` à `true` pour l’accessibilité.
 * - Journalise chaque étape et capture les erreurs éventuelles.
 * 
 * ### **Gestion des erreurs :**
 * - Vérifie que `lightboxContainer` existe avant d’essayer de le masquer.
 * - Vérifie que `lightboxMediaContainer` et `lightboxCaption` existent avant de les modifier.
 * - Capture et journalise toute erreur avec `logEvent("error", ...)`.
 * 
 * @function closeLightbox
 * @throws {Error} Lève une erreur si la lightbox ne peut pas être fermée correctement.
 */


// Variable globale pour suivre si la lightbox est ouverte sur une vidéo

export function closeLightbox() {
    logEvent("action", "Fermeture de la lightbox et réinitialisation du contenu.");

    try {
        const { lightboxContainer, lightboxMediaContainer, lightboxCaption } = domSelectors.lightbox;

        if (!lightboxContainer) {
            throw new Error("Conteneur principal de la lightbox introuvable.");
        }

        // Suppression UNIQUEMENT des médias (image/vidéo) sans toucher aux boutons
        const mediaToRemove = lightboxMediaContainer.querySelector(".active-media");
        if (mediaToRemove) {
            mediaToRemove.remove();
            logEvent("info", "🗑 Média actuel supprimé de la lightbox.");
        }

        // Réinitialisation du titre (caption)
        if (lightboxCaption) {
            lightboxCaption.textContent = "";
            logEvent("info", " Caption de la lightbox réinitialisée.");
        }

        // Réinitialisation de l'état vidéo
        if (isVideoLightboxOpen) {
            isVideoLightboxOpen = false;
            logEvent("info", "Réinitialisation de isVideoLightboxOpen après fermeture.");
        }

        //  Réactive les contrôles des vidéos dans la galerie après la fermeture
        setTimeout(() => {
            initializeVideoHandlers();  //  Assure que les vidéos redeviennent interactives après la fermeture
            logEvent("info", " Réactivation des vidéos après fermeture de la lightbox.");
        }, 300); // Petit délai pour éviter les conflits

        

        // Réinitialisation des variables globales
        currentIndex = 0;
        mediaList = [];
        globalFolderName = "";

        // Masquer la lightbox sans supprimer ses éléments de structure
        lightboxContainer.classList.add("hidden");
        lightboxContainer.setAttribute("aria-hidden", "true");

        logEvent("success", "Lightbox fermée, vidéos réactivées et touches clavier fonctionnelles.");

    } catch (error) {
        logEvent("error", ` Erreur lors de la fermeture de la lightbox : ${error.message}`, { error });
    }
}


/*==============================================*/
/*             Gestion des animations          */
/*==============================================*/
function handleAnimationEnd() {
        try {
            // Retirer l'écouteur d'événement pour éviter les répétitions
            mediaElement.removeEventListener("animationend", handleAnimationEnd);

            // Exécute la fonction de rappel après l'animation
            callback();

            logEvent("success", `Animation de sortie terminée avec effet : ${exitClass}`);
        } catch (callbackError) {
            logEvent("error", `Erreur dans la fonction de rappel après l'animation : ${callbackError.message}`, { callbackError });
        }
    }

/**-----------------------------------------------------------------------------------------------
 * Applique une animation de sortie vers la gauche au média actuellement affiché dans la lightbox.
 * ------------------------------------------------------------------------------------------------
 * 
 * ### **Fonctionnement :**
 * - Ajoute la classe CSS `"lightbox-exit-left"` pour déclencher l'animation de sortie.
 * - Attend la fin de l'animation (`animationend`) avant d'exécuter la fonction `callback()`.
 * - Supprime l'écouteur d'événement après la première exécution grâce à `{ once: true }`.
 * 
 * ### **Gestion des erreurs :**
 * - Vérifie si `mediaElement` est bien un élément HTML avant d'ajouter la classe.
 * - Vérifie si `callback` est une fonction avant de l'exécuter.
 * - Capture et journalise toute erreur avec `logEvent("error", ...)`.
 * 
 * @function animateMediaExitLeft
 * @param {HTMLElement} mediaElement - L'élément HTML du média en cours d'affichage dans la lightbox.
 * @param {Function} callback - Fonction de rappel exécutée une fois l'animation terminée.
 * @throws {Error} Lève une erreur si `mediaElement` n'est pas valide ou si `callback` n'est pas une fonction.
 */
function animateMediaExitLeft(mediaElement, callback) {
    try {
        // Vérifie que `mediaElement` est un élément HTML valide
        if (!(mediaElement instanceof HTMLElement)) {
            throw new Error("L'élément média est invalide ou non défini.");
        }

        // Vérifie que `callback` est bien une fonction avant de l'appeler
        if (typeof callback !== "function") {
            throw new Error("Le paramètre `callback` doit être une fonction valide.");
        }

        // Déterminer la direction de l'animation en fonction du tri
        const exitClass = sorted ? "lightbox-exit-right" : "lightbox-exit-left";

        // Supprime toutes les classes d'animation pour éviter les conflits
        mediaElement.classList.remove("lightbox-exit-left", "lightbox-exit-right");

        // Ajoute la classe CSS pour déclencher l'animation de sortie
        mediaElement.classList.add(exitClass);

        // Attacher un écouteur d'événement avec une fonction fléchée pour capturer `exitClass`
        mediaElement.addEventListener("animationend", () => {
            try {
                // Supprime l'écouteur immédiatement après exécution
                mediaElement.removeEventListener("animationend", handleAnimationEnd);

                // Exécute la fonction de rappel après l'animation
                callback();

                logEvent("success", `Animation de sortie terminée avec effet : ${exitClass}`);
            } catch (callbackError) {
                logEvent("error", `Erreur dans la fonction de rappel après l'animation : ${callbackError.message}`, { callbackError });
            }
        }, { once: true });

        logEvent("info", `Animation de sortie lancée avec effet : ${exitClass}`);
    } catch (error) {
        logEvent("error", `Erreur lors de l'animation de sortie : ${error.message}`, { error });
    }
}

/**-------------------------------------------------------------------------------------------------
 * Applique une animation de sortie vers la droite au média actuellement affiché dans la lightbox.
 * -------------------------------------------------------------------------------------------------
 * 
 * ### **Fonctionnement :**
 * - Ajoute la classe CSS `"lightbox-exit-right"` pour déclencher l'animation de sortie.
 * - Attend la fin de l'animation (`animationend`) avant d'exécuter la fonction `callback()`.
 * - Supprime l'écouteur d'événement après la première exécution grâce à `{ once: true }`.
 * 
 * ### **Gestion des erreurs :**
 * - Vérifie si `mediaElement` est bien un élément HTML avant d'ajouter la classe.
 * - Vérifie si `callback` est une fonction avant de l'exécuter.
 * - Capture et journalise toute erreur avec `logEvent("error", ...)`.
 * 
 * @function animateMediaExitRight
 * @param {HTMLElement} mediaElement - L'élément HTML du média en cours d'affichage dans la lightbox.
 * @param {Function} callback - Fonction de rappel exécutée une fois l'animation terminée.
 * @throws {Error} Lève une erreur si `mediaElement` n'est pas valide ou si `callback` n'est pas une fonction.
 */

function animateMediaExitRight(mediaElement, callback) {
    try {
        // Vérifie que `mediaElement` est un élément HTML valide
        if (!(mediaElement instanceof HTMLElement)) {
            throw new Error("L'élément média est invalide ou non défini.");
        }

        // Vérifie que `callback` est bien une fonction avant de l'appeler
        if (typeof callback !== "function") {
            throw new Error("Le paramètre `callback` doit être une fonction valide.");
        }

        // Déterminer la direction de l'animation en fonction du tri
        const exitClass = sorted ? "lightbox-exit-left" : "lightbox-exit-right";

        // Supprime toutes les classes d'animation pour éviter les conflits
        mediaElement.classList.remove("lightbox-exit-left", "lightbox-exit-right");

        // Ajoute la classe CSS pour déclencher l'animation de sortie
        mediaElement.classList.add(exitClass);

        // Attacher un écouteur d'événement pour détecter la fin de l'animation
        mediaElement.addEventListener("animationend", handleAnimationEnd);

        logEvent("info", `Animation de sortie lancée avec effet : ${exitClass}`);
    } catch (error) {
        logEvent("error", `Erreur lors de l'animation de sortie : ${error.message}`, { error });
}



    // Fonction séparée pour gérer la fin de l'animation
function handleAnimationEnd() {
        try {
            // Retirer l'écouteur d'événement pour éviter les répétitions
            mediaElement.removeEventListener("animationend", handleAnimationEnd);

            // Exécute la fonction de rappel après l'animation
            callback();

            logEvent("success", `Animation de sortie terminée avec effet : ${exitClass}`);
        } catch (callbackError) {
            logEvent("error", `Erreur dans la fonction de rappel après l'animation : ${callbackError.message}`, { callbackError });
        }
    }
}



/*==============================================*/
/*             Insertion           */
/*==============================================*/

/**
 * Insère un nouveau média dans la lightbox avec une animation d'entrée.
 * 
 * ### **Fonctionnement :**
 * - Vérifie si les paramètres `media` et `folderPath` sont valides.
 * - Crée dynamiquement un élément `<img>` ou `<video>` en fonction du type de média.
 * - Configure les attributs nécessaires pour chaque type de média (source, accessibilité, contrôles...).
 * - Ajoute une classe CSS pour animer l’entrée du média.
 * - Met à jour la légende (`lightboxCaption`) avec le titre du média.
 * - Journalise l'opération via `logEvent()`.
 * 
 * ### **Gestion des erreurs :**
 * - Vérifie que `media` est bien un objet avec une image ou une vidéo.
 * - Vérifie que `folderPath` est une chaîne valide.
 * - Vérifie que `lightboxMediaContainer` et `lightboxCaption` existent bien dans le DOM.
 * - Capture et journalise toute erreur inattendue.
 * 
 * @function insertNewMedia
 * @param {Object} media - Objet représentant le média à insérer.
 * @param {string} folderPath - Chemin d'accès au dossier contenant les médias.
 * @param {string} direction - Direction de l'animation d'entrée (`"left"` ou `"right"`).
 * @throws {Error} Génère une erreur si un paramètre est invalide ou si l'insertion échoue.
 */

function insertNewMedia(media, folderPath, direction) {
    try {
        // Vérifie que `media` est un objet valide avec une image ou une vidéo
        if (!media || (typeof media !== "object") || (!media.image && !media.video)) {
            throw new Error("Le paramètre `media` est invalide ou ne contient ni image ni vidéo.");
        }

        // Vérifie que `folderPath` est une chaîne valide
        if (typeof folderPath !== "string" || folderPath.trim() === "") {
            throw new Error("Le chemin du dossier `folderPath` est invalide.");
        }

        // Vérifie la validité des sélecteurs DOM avant d'interagir avec eux
        const { lightboxMediaContainer, lightboxCaption } = domSelectors.lightbox;
        if (!lightboxMediaContainer || !lightboxCaption) {
            throw new Error("Les éléments DOM de la lightbox sont introuvables.");
        }

        // Crée un nouvel élément média en fonction du type (image ou vidéo)
        let newMedia = document.createElement(media.image ? "img" : "video");
        newMedia.classList.add("lightbox-media", "active-media");

        // Configure les attributs spécifiques selon le type de média
        if (media.image) {
            newMedia.src = `${folderPath}${media.image}`;
            newMedia.alt = media.title || "Image sans titre"; // Accessibilité
            newMedia.loading = "lazy"; // Optimisation du chargement
        } else if (media.video) {
            newMedia.src = `${folderPath}${media.video}`;
            newMedia.controls = true;
            newMedia.autoplay = true;
            newMedia.muted = false;
        }

        // Ajoute le nouvel élément média au conteneur de la lightbox
        lightboxMediaContainer.appendChild(newMedia);

        // Met à jour la légende avec le titre du média
        lightboxCaption.textContent = media.title || "Sans titre";

        // Journalisation du succès
        logEvent("success", "Média inséré avec succès dans la lightbox.", { media, direction });

    } catch (error) {
        // Capture et journalise toute erreur rencontrée
        logEvent("error", `Erreur lors de l'insertion du média dans la lightbox : ${error.message}`, { error });
    }
}


/*==============================================*/
/*             Navigation          */
/*==============================================*/

/**----------------------------------------------------------------
 * Gère la navigation vers le média suivant dans la lightbox.
 * ----------------------------------------------------------------
 * 
 * ### **Fonctionnement :**
 * - Vérifie que `mediaList` est bien défini et contient des médias.
 * - Empêche les changements multiples rapides grâce à la variable `isTransitioning`.
 * - Met à jour l'index actuel (`currentIndex`) pour passer au média suivant en boucle.
 * - Met à jour l'affichage du média en appelant `updateLightboxContent()`.
 * - Utilise un `setTimeout()` pour limiter la rapidité des changements et garantir une animation fluide.
 * 
 * ### **Gestion des erreurs :**
 * - Vérifie que `mediaList` est bien un tableau et qu'il contient des médias.
 * - Vérifie que `globalFolderName` est bien une chaîne valide avant de l'utiliser.
 * - Empêche tout comportement erratique en bloquant les transitions trop rapides avec `isTransitioning`.
 * - Capture et journalise toute erreur inattendue.
 * 
 * @function showNextMedia
 * @throws {Error} Génère une erreur si `mediaList` est invalide ou vide.
 */

export function showNextMedia() {
    try {
        if (!Array.isArray(mediaList) || mediaList.length === 0) {
            throw new Error("Aucun média disponible pour la navigation.");
        }

        if (typeof globalFolderName !== "string") {
            throw new Error("Nom du dossier invalide ou non défini.");
        }

        if (isTransitioning) {
            logEvent("warn", "⏳ Tentative de navigation alors qu'une transition est en cours.");
            return;
        }

        //  Désactive les entrées clavier pendant la transition
        isTransitioning = true;
        document.removeEventListener("keydown", handleLightboxNavigation);

          // Si un tri a été fait, inverser la direction de navigation
          if (sorted) {
            currentIndex = (currentIndex - 1 + mediaList.length) % mediaList.length;
        } else {
            currentIndex = (currentIndex + 1) % mediaList.length;
        }
        
        // Animation de sortie et mise à jour du média
        updateLightboxContent(mediaList[currentIndex], globalFolderName, "right", () => {
            // Réactivation des entrées clavier après la fin de la transition
            isTransitioning = false;
            document.addEventListener("keydown", handleLightboxNavigation);
            logEvent("success", "Transition terminée, navigation réactivée.");
        });

        logEvent("success", ` Navigation vers le média suivant. Index actuel : ${currentIndex}`);

    } catch (error) {
        logEvent("error", ` Erreur lors de la navigation vers le média suivant : ${error.message}`, { error });
    }
}



/**----------------------------------------------------------------
 * Gère la navigation vers le média précédent dans la lightbox.
 * ----------------------------------------------------------------
 * 
 * ### **Fonctionnement :**
 * - Vérifie que `mediaList` est bien défini et contient des médias.
 * - Empêche les changements multiples rapides grâce à la variable `isTransitioning`.
 * - Met à jour l'index actuel (`currentIndex`) pour passer au média précédent en boucle.
 * - Met à jour l'affichage du média en appelant `updateLightboxContent()`.
 * - Utilise un `setTimeout()` pour limiter la rapidité des changements et garantir une animation fluide.
 * 
 * ### **Gestion des erreurs :**
 * - Vérifie que `mediaList` est bien un tableau et qu'il contient des médias.
 * - Vérifie que `globalFolderName` est bien une chaîne valide avant de l'utiliser.
 * - Empêche tout comportement erratique en bloquant les transitions trop rapides avec `isTransitioning`.
 * - Capture et journalise toute erreur inattendue.
 * 
 * @function showPreviousMedia
 * @throws {Error} Génère une erreur si `mediaList` est invalide ou vide.
 */

export function showPreviousMedia() {
    try {
        if (!Array.isArray(mediaList) || mediaList.length === 0) {
            throw new Error("Aucun média disponible pour la navigation.");
        }

        if (typeof globalFolderName !== "string") {
            throw new Error("Nom du dossier invalide ou non défini.");
        }

        if (isTransitioning) {
            logEvent("warn", " Tentative de navigation alors qu'une transition est en cours.");
            return;
        }

        //  Désactive les entrées clavier pendant la transition
        isTransitioning = true;
        document.removeEventListener("keydown", handleLightboxNavigation);

         if (sorted) {
            currentIndex = (currentIndex + 1) % mediaList.length;
        } else {
            currentIndex = (currentIndex - 1 + mediaList.length) % mediaList.length;
        }
        
        // Animation de sortie et mise à jour du média
        updateLightboxContent(mediaList[currentIndex], globalFolderName, "left", () => {
            //  Réactivation des entrées clavier après la fin de la transition
            document.addEventListener("keydown", handleLightboxNavigation);
            logEvent("success", " Transition terminée, navigation réactivée."); 
            isTransitioning = false;
        });

        logEvent("success", ` Navigation vers le média précédent. Index actuel : ${currentIndex}`);

    } catch (error) {
        logEvent("error", ` Erreur lors de la navigation vers le média précédent : ${error.message}`, { error });
    }
}


/*==============================================*/
/*             Mise a jour du contenu
/*==============================================*/
/**
 * Met à jour dynamiquement le contenu de la lightbox avec la bonne animation.
 * 
 * ### **Fonctionnement :**
 * - Vérifie que les paramètres `media` et `folderName` sont valides.
 * - Détermine le chemin correct du dossier des médias.
 * - Vérifie si un média est déjà affiché dans la lightbox.
 * - Applique une animation de sortie (`animateMediaExitLeft` ou `animateMediaExitRight`).
 * - Supprime l'ancien média avant d'insérer le nouveau (`insertNewMedia`).
 * - Journalise chaque étape du processus pour assurer une meilleure traçabilité.
 * 
 * ### **Gestion des erreurs :**
 * - Vérifie que `media` est défini avant de le traiter.
 * - Vérifie que `folderName` est une chaîne valide.
 * - Vérifie que `direction` est bien `"right"` ou `"left"`.
 * - Capture et journalise toute erreur inattendue via `logEvent("error", ...)`.
 * 
 * @function updateLightboxContent
 * @param {Object} media - L'objet contenant les informations du média à afficher.
 * @param {string} folderName - Le nom du dossier contenant les médias.
 * @param {string} direction - La direction de l'animation (`"right"` pour avancer, `"left"` pour reculer).
 * @throws {Error} Génère une erreur si `media` est invalide ou si `folderName` est incorrect.
 */

function updateLightboxContent(media, folderName, direction, callback) {
    try {
        logEvent("debug", ` Mise à jour de la lightbox : ${currentIndex} / ${mediaList.length}`, {
            media, 
            currentIndex, 
            folderName, 
            direction
        });


        if (direction !== "right" && direction !== "left") {
            throw new Error(`Direction "${direction}" non valide. Attendu : "right" ou "left".`);
        }

        const { lightboxMediaContainer } = domSelectors.lightbox;
        if (!lightboxMediaContainer) {
            throw new Error("Conteneur de médias de la lightbox introuvable.");
        }

        const currentMedia = lightboxMediaContainer.querySelector(".active-media");
        const folderPath = `../../../assets/photographers/${folderName}/`;

        //  Animation de sortie et suppression de l'ancien média
        if (currentMedia) {
            let exitAnimation = direction === "right" ? animateMediaExitLeft : animateMediaExitRight;
            
            exitAnimation(currentMedia, () => {
                currentMedia.remove();
                insertNewMedia(media, folderPath, direction);

                //  Appel de la fonction de rappel après insertion du média
                if (callback && typeof callback === "function") {
                    callback();
                }
            });
        } else {
            insertNewMedia(media, folderPath, direction);
            if (callback && typeof callback === "function") {
                callback();
            }
        }

        logEvent("success", ` Média mis à jour avec succès. Direction : ${direction}`);

    } catch (error) {
        logEvent("error", ` Erreur lors de la mise à jour du média dans la lightbox : ${error.message}`, { error });
    }
}

/**
 * Initialise les vidéos de la galerie pour permettre leur ouverture en lightbox.
 * 
 * @function initializeVideoHandlers
 */
/**
 * Initialise les vidéos pour permettre leur ouverture en lightbox.
 * Empêche les interactions non souhaitées et rétablit l'ouverture après fermeture.
 */
export function initializeVideoHandlers() {
    logEvent("init", " Initialisation des vidéos de la galerie...");

    const videos = document.querySelectorAll(".media-item video");

    if (!videos.length) {
        logEvent("warn", "Aucune vidéo détectée dans la galerie.");
        return;
    }

    videos.forEach((video) => {
        video.removeAttribute("controls"); // Supprime les contrôles vidéo

        // Ajoute un écouteur pour ouvrir la lightbox sur la vidéo
        video.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();

            // Si la lightbox est déjà ouverte sur une vidéo, on bloque
            if (isVideoLightboxOpen) {
                logEvent("warn", " Tentative de réouverture alors qu'une vidéo est déjà ouverte.");
                return;
            }

            logEvent("info", " Clic sur une vidéo, ouverture de la lightbox...", { video });

            const galleryItem = video.closest(".gallery-item");

            if (!galleryItem) {
                logEvent("error", " Impossible de récupérer .gallery-item pour la vidéo.");
                return;
            }

            const mediaIndex = parseInt(galleryItem.dataset.index, 10);
            if (isNaN(mediaIndex)) {
                logEvent("error", " Index de la vidéo introuvable.");
                return;
            }

            // On indique que la lightbox est ouverte pour une vidéo
            isVideoLightboxOpen = true;
            logEvent("success", ` Ouverture de la lightbox vidéo à l'index ${mediaIndex}.`);

            openLightbox(mediaIndex, window.mediaList, window.globalFolderName);
        });
    });

    logEvent("success", " Initialisation des vidéos terminée avec succès.");
}