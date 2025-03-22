/* eslint-disable import/extensions */
/* eslint-disable max-len */
/**
 * ===============================================================
 * Nom du fichier  : domSelectors.js
 * Description     : Centralisation et gestion avancée des sélecteurs DOM
 *                  pour l'application Fisheye. Ce module permet de
 *                  récupérer, gérer et surveiller les éléments du DOM
 *                  en optimisant les performances via un système de cache
 *                  intelligent.
 *
 * Auteur          : Trackjnr
 * Date de création: 05/01/2025
 * Dernière MAJ    : 09/02/2025 (Version 2.0.0)
 * ===============================================================
 */

/*= ============================================= */
/*                 Import                       */
/*= ============================================= */
/**
 * Importation du module `logEvent` pour gérer la journalisation des événements.
 * Ce module est utilisé pour enregistrer les erreurs, les succès et les informations
 * relatives aux sélections DOM.
 */
import { logEvent } from '../utils/utils.js';

/*= ============================================= */
/*         Cache et Sélection Sécurisée         */
/*= ============================================= */
/**
 * Cache des sélections DOM pour améliorer les performances.
 *
 */
const domCache = new Map();

/*= ============================================= */
/*          Clear Cache (Purge Sélecteurs)    */
/*= ============================================= */

/** ## DESCRIPTION ##
 * ---------------------------------------------------------------------------------------------------
 *  Vide intégralement le cache des sélections DOM pour garantir une mise à jour fiable des éléments.
 * ---------------------------------------------------------------------------------------------------
 *
 *
 * @function clearDomCache
 * @returns {void} Aucune valeur retournée, mais purge le cache interne.
 * @example
 *  Rafraîchir tous les sélecteurs après un gros changement dans le DOM
 * clearDomCache();
 *
 *  Exemple d'utilisation avant une mise à jour de l'UI
 * clearDomCache();
 * updateUI(); // Fonction de mise à jour de l'interface utilisateur
 */
export function clearDomCache() {
  domCache.clear();
  logEvent('info', 'Cache des sélections DOM vidé avec succès.');
}

/*= ============================================= */
/*       Sélection Sécurisée d'un Élément DOM   */
/*= ============================================= */

/** ## DESCRIPTION ##
 * ---------------------------------------------------------------------------------------------------
 *  Sélectionne un élément du DOM en toute sécurité avec gestion du cache et fallback optionnel.
 * ---------------------------------------------------------------------------------------------------
 *
 *
 * @function safeQuerySelector
 * @param {string} selector - Sélecteur CSS de l'élément à récupérer.
 * @param {boolean} [isOptional=false] - Ne génère pas d'erreur si l'élément est absent.
 * @param {Element|null} [fallbackValue=null] - Valeur de remplacement si l'élément est introuvable.
 * @returns {Element|null} L'élément DOM sélectionné ou le fallback.
 *
 * @example
 *  Récupérer un élément essentiel au fonctionnement de l'interface :
 * const mainContainer = safeQuerySelector("#main-container");
 *
 */
export function safeQuerySelector(
  selector,
  isOptional = false,
  fallbackValue = null,
) {
  if (domCache.has(selector)) {
    const cachedElement = domCache.get(selector);
    if (document.body.contains(cachedElement)) {
      return cachedElement;
    }
    domCache.delete(selector);
  }

  const element = document.querySelector(selector);
  if (!element) {
    if (!isOptional) {
      logEvent('error', `Élément DOM introuvable : ${selector}`);
    }
    return fallbackValue;
  }

  domCache.set(selector, element);
  return element;
}

/*= ============================================= */
/*       Sélection Sécurisée de Plusieurs Éléments DOM   */
/*= ============================================= */

/** ## DESCRIPTION ##
 * ---------------------------------------------------------------------------------------------------
 *  Récupère une liste d'éléments DOM en toute sécurité avec gestion du cache et validation dynamique.
 * ---------------------------------------------------------------------------------------------------
 *
 *
 * @function safeQuerySelectorAll
 * @param {string} selector - Sélecteur CSS des éléments à récupérer.
 * @returns {NodeList} Liste des éléments trouvés (peut être vide mais jamais `null`).
 *
 * @example
 *  Récupérer tous les boutons d'action d'une page :
 * const buttons = safeQuerySelectorAll(".action-btn");
 *
 */
export function safeQuerySelectorAll(selector) {
  if (domCache.has(selector)) {
    const cachedNodeList = domCache.get(selector);
    if (
      cachedNodeList.length > 0
      && document.body.contains(cachedNodeList[0])
    ) {
      return cachedNodeList;
    }
    domCache.delete(selector);
  }

  const elements = document.querySelectorAll(selector);
  if (!elements.length) {
    logEvent('warn', `Aucun élément trouvé pour : ${selector}`);
  } else {
    domCache.set(selector, elements);
  }

  return elements;
}

/*= ============================================= */
/*          Détection Dynamique de la Page      */
/*= ============================================= */

/**
 * =============================================================================
 * @function     getCurrentPage
 * @description  Détermine dynamiquement le nom de la page actuelle en analysant l’URL.
 *
 * @returns {string} - Le nom de la page actuelle parmi :
 *   - 'index'
 *   - 'projet'
 *   - 'apropos'
 *   - 'contact'
 *   - 'conclusion'
 *   - 'etapes-alim'
 *   - 'etapes-site'
 *   - 'unknown' (si non reconnu)
 *
 * @example
 * const currentPage = getCurrentPage();
 * if (currentPage === 'contact') {
 *   initContactForm();
 * }
 * =============================================================================
 */
export function getCurrentPage() {
  const url = window.location.pathname.toLowerCase();

  if (url.includes('etapes-site')) {
    return 'etapes-site';
  }
  if (url.includes('etapes-alim')) {
    return 'etapes-alim';
  }
  if (url.includes('contact')) {
    return 'contact';
  }
  if (url.includes('apropos')) {
    return 'apropos';
  }
  if (url.includes('contact')) {
    return 'contact';
  }
  if (url.includes('conclusion')) {
    return 'conclusion';
  }
  if (url.includes('index') || url === '/') {
    return 'index';
  }

  return 'unknown';
}

/*= ============================================= */
/*       Définition Structurée des Sélecteurs   */
/*= ============================================= */
/**
 * ## DESCRIPTION ##
 * ---------------------------------------------------------------------------------------------------
 *  Récupère les sélecteurs DOM essentiels pour la page d’accueil (`index.html`) et les organise
 *  par catégories afin de faciliter leur utilisation et leur gestion.
 * ---------------------------------------------------------------------------------------------------
 *
 * @function getIndexSelectors
 * @returns {Object} Un objet contenant les sélecteurs organisés par catégories.
 *
 * @example
 *  Initialiser les sélecteurs sur la page d’accueil :
 *  const selectors = getIndexSelectors();
 *  console.log(selectors.nav.menuButton); // Accède au bouton du menu toggle
 */

export function getIndexSelectors() {
  return {
    /* ============================== */
    /* Structure Principale           */
    /* ============================== */
    layout: {
      body: document.body,
      header: safeQuerySelector('header'),
      main: safeQuerySelector('main'),
      footer: safeQuerySelector('footer'),
    },

    /* ============================== */
    /* Navigation et Menu Burger      */
    /* ============================== */
    nav: {
      menuButton: safeQuerySelector('.menu-toggle'),
      navLinks: safeQuerySelector('.nav-links'),
      logo: safeQuerySelector('.logo-container img'),
    },

    /* ============================== */
    /* Section Hero                   */
    hero: {
      section: safeQuerySelector('.hero'),
      title: safeQuerySelector('.hero h1'),
    },

    /* ============================== */
    /* Section Projets                */
    project: {
      section: safeQuerySelector('#projets'),
      title: safeQuerySelector('.section-title'),
      wrapper: safeQuerySelector('#project-card-wrapper'),
      cards: safeQuerySelectorAll('.card'),
    },

    /* ============================== */
    /* Pied de page                   */
    footer: {
      container: safeQuerySelector('footer'),
      copyright: safeQuerySelector('.footer-content p'),
    },
  };
}

/**
 * ==================================================================================
 * @function getAproposSelectors
 * @description
 *  Récupère tous les sélecteurs DOM nécessaires à la page "À Propos" du site.
 *  Organise les sélections par sections fonctionnelles : présentation, mission,
 *  valeurs, équipe, informations légales, navigation et pied de page.
 *
 * @returns {Object} Un objet structuré contenant les éléments DOM utilisés sur
 *  la page "À Propos".
 *
 * @example
 *  // Initialiser les sélecteurs pour la page "À Propos"
 *  const selectors = getAproposSelectors();
 *  console.log(selectors.team.members); // Liste des membres de l’équipe
 * ==================================================================================
 */
export function getAproposSelectors() {
  return {
    /* ============================== */
    /* Structure Principale           */
    /* ============================== */
    layout: {
      body: document.body,
      header: safeQuerySelector('header'),
      main: safeQuerySelector('main'),
      footer: safeQuerySelector('footer'),
    },

    /* ============================== */
    /* Navigation et Menu Burger      */
    /* ============================== */
    nav: {
      menuButton: safeQuerySelector('.menu-toggle'),
      navLinks: safeQuerySelector('.nav-links'),
      logo: safeQuerySelector('.logo-container img'),
    },

    /* ============================== */
    /* Section Présentation           */
    about: {
      section: safeQuerySelector('#presentation'),
      image: safeQuerySelector('.hero-image'),
      heading: safeQuerySelector('#presentation h1'),
      paragraphs: safeQuerySelectorAll('#presentation p'),
      externalLink: safeQuerySelector('#presentation a'),
    },

    /* ============================== */
    /* Section Mission & Valeurs      */
    mission: {
      section: safeQuerySelector('#mission-valeurs'),
      heading: safeQuerySelector('#mission-valeurs h2'),
      missionList: safeQuerySelector('.mission-list'),
      valuesList: safeQuerySelector('.values-list'),
    },

    /* ============================== */
    /* Section Équipe                 */
    team: {
      section: safeQuerySelector('#equipe'),
      heading: safeQuerySelector('#equipe h2'),
      members: safeQuerySelectorAll('.profile-container'),
    },

    /* ============================== */
    /* Section Légale                 */
    legal: {
      section: safeQuerySelector('#infos-legales'),
      heading: safeQuerySelector('#infos-legales h2'),
      content: safeQuerySelector('#infos-legales p'),
    },

    /* ============================== */
    /* Pied de page                   */
    footer: {
      container: safeQuerySelector('footer'),
      copyright: safeQuerySelector('footer p'),
    },
  };
}

/**
 * ==================================================================================
 * @function getConclusionSelectors
 * @description
 *  Récupère les sélecteurs DOM nécessaires à la page "Conclusion" du rapport de stage.
 *  Organise les éléments par sections : structure, navigation, contenu textuel, signature
 *  et pied de page.
 *
 * @returns {Object} Un objet contenant les sélections DOM utilisées dans conclusion.html.
 *
 * @example
 *  const selectors = getConclusionSelectors();
 *  console.log(selectors.text.sections); // Renvoie la liste des sections <h2> et <p>
 * ==================================================================================
 */
export function getConclusionSelectors() {
  return {
    /* ============================== */
    /* Structure Principale           */
    /* ============================== */
    layout: {
      body: document.body,
      header: safeQuerySelector('header'),
      main: safeQuerySelector('main'),
      footer: safeQuerySelector('footer'),
    },

    /* ============================== */
    /* Navigation et Menu Burger      */
    nav: {
      menuButton: safeQuerySelector('.menu-toggle'),
      navLinks: safeQuerySelector('.nav-links'),
      logo: safeQuerySelector('.logo-container img'),
    },

    /* ============================== */
    /* Section Hero (Bannière)        */
    hero: {
      section: safeQuerySelector('.hero'),
      container: safeQuerySelector('.hero-container'),
      title: safeQuerySelector('.hero h1'),
    },

    /* ============================== */
    /* Section Texte (Conclusion)     */
    text: {
      section: safeQuerySelector('.conclusion-text'),
      headings: safeQuerySelectorAll('.conclusion-text h2'),
      paragraphs: safeQuerySelectorAll('.conclusion-text p'),
      signature: safeQuerySelector('.signature'),
    },

    /* ============================== */
    /* Pied de page                   */
    footer: {
      container: safeQuerySelector('footer'),
      copyright: safeQuerySelector('footer p'),
    },
  };
}

/**
 * =============================================================================
 * @function     getContactSelectors
 * @description  Centralise et structure les sélecteurs DOM spécifiques à la page
 *              `contact.html` pour un accès sécurisé via `safeQuerySelector()`.
 *              Regroupe les sections : layout, navigation, formulaire, modales, footer.
 *
 * @returns {Object} - Objet contenant les éléments DOM regroupés par contexte.
 *
 * @example
 * const selectors = getContactSelectors();
 * selectors.form.email.value = "exemple@mail.com";
 * selectors.form.submitButton.click();
 * =============================================================================
 */
export function getContactSelectors() {
  return {
    /* ============================== */
    /* Structure Générale             */
    /* ============================== */
    layout: {
      body: document.body,
      header: safeQuerySelector('header'),
      main: safeQuerySelector('main'),
      footer: safeQuerySelector('footer'),
    },

    /* ============================== */
    /* Navigation et Logo             */
    /* ============================== */
    nav: {
      menuButton: safeQuerySelector('.menu-toggle'), // Bouton menu burger
      navLinks: safeQuerySelector('.nav-links'), // Liste des liens nav
      logo: safeQuerySelector('.logo-container img'), // Logo Cocoba
    },

    /* ============================== */
    /* Formulaire de Contact          */
    /* ============================== */
    form: {
      section: safeQuerySelector('.contact-container'), // Bloc principal
      formWrapper: safeQuerySelector('.form-wrapper'), // Conteneur visuel
      form: safeQuerySelector('#contact-form'), // Formulaire lui-même
      name: safeQuerySelector('#name'), // Champ nom
      email: safeQuerySelector('#email'), // Champ email
      message: safeQuerySelector('#message'), // Champ message
      submitButton: safeQuerySelector('.btn-submit'), // Bouton "Envoyer"
      status: safeQuerySelector('#status'), // Affichage du statut
    },

    /* ============================== */
    /* Modales dynamiques             */
    /* ============================== */
    modals: {
      success: safeQuerySelector('#modal-success'), // Modale succès
      error: safeQuerySelector('#modal-error'), // Modale erreur
    },

    /* ============================== */
    /* Pied de page                   */
    /* ============================== */
    footer: {
      container: safeQuerySelector('footer'),
      copyright: safeQuerySelector('footer p'),
    },
  };
}

/**
 * =============================================================================
 * @function     getProjetSelectors
 * @description  Récupère et structure les sélecteurs DOM de la page `projet.html`.
 *               Inclut les cartes projets, les onglets dynamiques, galeries et boutons.
 *
 * @returns {Object} Objet structuré avec les sélecteurs DOM liés aux projets.
 *
 * @example
 * const selectors = getProjetSelectors();
 * selectors.projet1.tabs.resume.classList.add("active");
 * =============================================================================
 */
export function getProjetSelectors() {
  return {
    /* ============================== */
    /* Structure Principale           */
    /* ============================== */
    layout: {
      body: document.body,
      header: safeQuerySelector('header'),
      main: safeQuerySelector('main'),
      footer: safeQuerySelector('footer'),
    },

    /* ============================== */
    /* Navigation et Logo             */
    /* ============================== */
    nav: {
      menuButton: safeQuerySelector('.menu-toggle'),
      navLinks: safeQuerySelector('.nav-links'),
      logo: safeQuerySelector('.logo-container img'),
    },

    /* ============================== */
    /* Section Hero + Bannière        */
    /* ============================== */
    hero: {
      section: safeQuerySelector('.hero'),
      title: safeQuerySelector('.hero h1'),
      banner: safeQuerySelector('.hero-banner'),
      bannerOverlay: safeQuerySelector('.hero-banner-overlay'),
      bannerContent: safeQuerySelector('.hero-banner-content'),
      bannerText: safeQuerySelector('.hero-banner-content p'),
    },

    /* ============================== */
    /* Carte Projet 1 : Alimentation  */
    /* ============================== */
    projet1: {
      section: safeQuerySelector('#projet-alim'),
      title: safeQuerySelector('#projet-alim h2'),
      tabs: {
        container: safeQuerySelector('#projet-alim .tabs'),
        resume: safeQuerySelector('#resume1'),
        materiel: safeQuerySelector('#materiel1'),
        duree: safeQuerySelector('#temps1'),
        galerie: safeQuerySelector('#galerie1'),
        etapes: safeQuerySelector('#etapes1'),
      },
      tabButtons: safeQuerySelectorAll('#projet-alim .tab-button'),
      images: safeQuerySelectorAll('#galerie1 img'),
      voirEtapesBtn: safeQuerySelector('#etapes1 .btn'),
    },

    /* ============================== */
    /* Carte Projet 2 : Site Web      */
    /* ============================== */
    projet2: {
      section: safeQuerySelector('#projet-site'),
      title: safeQuerySelector('#projet-site h2'),
      tabs: {
        container: safeQuerySelector('#projet-site .tabs'),
        resume: safeQuerySelector('#resume2'),
        materiel: safeQuerySelector('#materiel2'),
        duree: safeQuerySelector('#temps2'),
        galerie: safeQuerySelector('#galerie2'),
        etapes: safeQuerySelector('#etapes2'),
      },
      tabButtons: safeQuerySelectorAll('#projet-site .tab-button'),
      images: safeQuerySelectorAll('#galerie2 img'),
      voirEtapesBtn: safeQuerySelector('#etapes2 .btn'),
    },

    /* ============================== */
    /* Pied de page                   */
    /* ============================== */
    footer: {
      container: safeQuerySelector('footer'),
      copyright: safeQuerySelector('footer p'),
    },
  };
}

/**
 * =============================================================================
 * @function     getEtapesAlimSelectors
 * @description  Récupère et organise les sélecteurs DOM spécifiques à la page
 *               "Étapes - Alimentation Stabilisée".
 *
 * @returns {Object} Objet structuré contenant tous les éléments clés de la page.
 *
 * @example
 * const selectors = getEtapesAlimSelectors();
 * selectors.steps.step1.classList.add("highlight");
 * =============================================================================
 */
export function getEtapesAlimSelectors() {
  return {
    /* ============================== */
    /* Structure Générale             */
    /* ============================== */
    layout: {
      body: document.body,
      header: safeQuerySelector('header'),
      main: safeQuerySelector('main'),
      footer: safeQuerySelector('footer'),
    },

    /* ============================== */
    /* Navigation                     */
    /* ============================== */
    nav: {
      logo: safeQuerySelector('.logo-container img'),
      navLinks: safeQuerySelector('.nav-links'),
    },

    /* ============================== */
    /* Titre & Introduction           */
    /* ============================== */
    intro: {
      section: safeQuerySelector('.etapes-intro'),
      title: safeQuerySelector('.etapes-intro h1'),
      paragraph: safeQuerySelector('.etapes-intro p'),
    },

    /* ============================== */
    /* Étapes du projet               */
    /* ============================== */
    steps: {
      all: safeQuerySelectorAll('.etape'),
      step1: safeQuerySelector('.etape:nth-of-type(2)'),
      step2: safeQuerySelector('.etape:nth-of-type(3)'),
      step3: safeQuerySelector('.etape:nth-of-type(4)'),
      step4: safeQuerySelector('.etape:nth-of-type(5)'),
      step5: safeQuerySelector('.etape:nth-of-type(6)'),
    },

    /* ============================== */
    /* Pied de page                   */
    /* ============================== */
    footer: {
      container: safeQuerySelector('footer'),
      copyright: safeQuerySelector('footer p'),
    },
  };
}

/**
 * =============================================================================
 * @function     getEtapesSiteSelectors
 * @description  Récupère et structure les sélecteurs DOM de la page
 *               "Étapes - Site Web" du rapport de stage.
 *
 * @returns {Object} Objet structuré contenant les éléments DOM de la page.
 *
 * @example
 * const selectors = getEtapesSiteSelectors();
 * console.log(selectors.steps.step3); // Accède à l'étape "Mise en page avec SCSS"
 * =============================================================================
 */
export function getEtapesSiteSelectors() {
  return {
    /* ============================== */
    /* Structure Générale             */
    /* ============================== */
    layout: {
      body: document.body,
      header: safeQuerySelector('header'),
      main: safeQuerySelector('main'),
      footer: safeQuerySelector('footer'),
    },

    /* ============================== */
    /* Navigation                     */
    /* ============================== */
    nav: {
      logo: safeQuerySelector('.logo-container img'),
      navLinks: safeQuerySelector('.nav-links'),
    },

    /* ============================== */
    /* Introduction                   */
    /* ============================== */
    intro: {
      section: safeQuerySelector('.etapes-intro'),
      title: safeQuerySelector('.etapes-intro h1'),
      paragraph: safeQuerySelector('.etapes-intro p'),
    },

    /* ============================== */
    /* Étapes détaillées              */
    /* ============================== */
    steps: {
      all: safeQuerySelectorAll('.etape'),
      step1: safeQuerySelector('.etape:nth-of-type(2)'), // Définition arborescence
      step2: safeQuerySelector('.etape:nth-of-type(3)'), // HTML pages
      step3: safeQuerySelector('.etape:nth-of-type(4)'), // SCSS
      step4: safeQuerySelector('.etape:nth-of-type(5)'), // JS interactions
      step5: safeQuerySelector('.etape:nth-of-type(6)'), // Tests & améliorations
    },

    /* ============================== */
    /* Pied de page                   */
    /* ============================== */
    footer: {
      container: safeQuerySelector('footer'),
      copyright: safeQuerySelector('footer p'),
    },
  };
}

/* =============================================================================
/*   WaitforElement
/* ============================================================================= */
/**
 * Attend qu'un élément spécifique apparaisse dans le DOM avant de l’utiliser.
 *
 * - Utilise `safeQuerySelector()` pour exploiter le cache DOM.
 * - Observe les changements en temps réel avec `MutationObserver`.
 * - Gère proprement le timeout pour éviter les boucles infinies.
 *
 * @function waitForElement
 * @param {string} selector - Sélecteur CSS de l'élément à attendre.
 * @param {number} [timeout=5000] - Délai maximum d’attente (en millisecondes).
 * @returns {Promise<Element>} Élément DOM résolu ou erreur si timeout atteint.
 */
export function waitForElement(selector, timeout = 5000) {
  logEvent('info', `Attente de l'élément : "${selector}" (Timeout: ${timeout}ms)`);

  return new Promise((resolve, reject) => {
    // Vérifie d'abord si l'élément est déjà présent dans le DOM via le cache
    const cachedElement = safeQuerySelector(selector, true);
    if (cachedElement) {
      logEvent('success', `Élément trouvé immédiatement via le cache : "${selector}"`);
      resolve(cachedElement);
      return; //  nécessaire pour éviter le "no-promise-return" ESLint
    }

    logEvent('info', 'Élément non trouvé, lancement de l\'observation avec MutationObserver...');

    // Création de l'observateur pour surveiller l'ajout de l'élément dans le DOM
    const observer = new MutationObserver(() => {
      logEvent('info', `DOM modifié, recherche de "${selector}"...`);
      const element = safeQuerySelector(selector, true);
      if (element) {
        logEvent('success', `Élément détecté dynamiquement : "${selector}"`);
        observer.disconnect();
        resolve(element);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Timeout de sécurité
    setTimeout(() => {
      logEvent('warn', `Timeout atteint : "${selector}" non trouvé après ${timeout}ms.`);
      observer.disconnect();
      reject(new Error(`waitForElement : "${selector}" introuvable après ${timeout}ms.`));
    }, timeout);
  });
}

/*= ============================================= */
/*    Vérification de la Présence des Éléments  */
/*= ============================================= */

/**
 * Parcourt un objet contenant des sélecteurs DOM pour vérifier leur présence et signaler ceux manquants.
 *
 * - Construit une hiérarchie des sélecteurs pour un meilleur suivi.
 * - Identifie et stocke les sélecteurs manquants.
 *
 * @function recursiveCheck
 * @param {Object} obj - Objet contenant les sélecteurs à vérifier (ex: `getIndexSelectors()`).
 * @param {string} [parentKey=""] - Clé parent servant à générer un chemin hiérarchique clair des sélecteurs.
 * @param {Array<string>} [missingSelectors=[]] - Tableau utilisé pour stocker les sélecteurs manquants.
 * @returns {Array<string>} Liste des sélecteurs manquants sous forme de chaînes de caractères.
 *
 * @example
 * const selectors = getIndexSelectors();
 * const missing = recursiveCheck(selectors);
 * if (missing.length > 0) {
 *    logEvent("warn", "Sélecteurs manquants détectés.", { missing });
 * }
 */
export function recursiveCheck(obj, parentKey = '', missingSelectors = []) {
  logEvent(
    'test_start',
    `Début de la vérification des sélecteurs DOM pour : ${parentKey || 'racine'}`,
  );

  Object.entries(obj).forEach(([key, value]) => {
    const fullKey = parentKey ? `${parentKey}.${key}` : key;

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      logEvent('info', `Exploration du groupe de sélecteurs : ${fullKey}`);
      recursiveCheck(value, fullKey, missingSelectors);
    } else if (!value) {
      logEvent('warn', `Sélecteur manquant détecté : ${fullKey}`);
      missingSelectors.push(fullKey);
    }
  });

  if (missingSelectors.length > 0) {
    logEvent('error', 'Vérification terminée : Des sélecteurs manquent.', {
      missingSelectors,
    });
  } else {
    logEvent('test_end', 'Vérification terminée : Aucun sélecteur manquant.');
  }

  return missingSelectors;
}


/*= ============================================= */
/*    Vérification Globale des Sélecteurs       */
/*= ============================================= */
/**
 * Vérifie la présence de tous les sélecteurs nécessaires au bon fonctionnement d’une page donnée.
 *
 * - Analyse l’objet de sélecteurs et identifie ceux qui sont manquants.
 * - Utilise `recursiveCheck()` pour une détection approfondie.
 *
 * @function checkSelectors
 * @param {Object} selectors - Objet contenant les sélecteurs DOM à vérifier (ex: `getIndexSelectors()`).
 * @returns {Array<string>} Liste des sélecteurs manquants sous forme de chaînes de caractères.
 *
 * @example
 *  Vérifier les sélecteurs d'une page spécifique :
 * const missingSelectors = checkSelectors(getIndexSelectors());
 * if (missingSelectors.length > 0) {
 *    logEvent("warn", "Sélecteurs DOM manquants :", { missingSelectors });
 * }
 */
export function checkSelectors(selectors) {
  logEvent('info', 'Début de la vérification globale des sélecteurs DOM.');

  const missingSelectors = recursiveCheck(selectors);

  if (missingSelectors.length > 0) {
    logEvent('error', 'Sélecteurs DOM manquants détectés.', {
      missingSelectors,
    });
  } else {
    logEvent('success', 'Tous les sélecteurs DOM sont présents.');
  }

  return missingSelectors;
}

/*= ============================================= */
/*          Chargement Dynamique des Sélecteurs */
/*= ============================================= */
/**
 * Charge dynamiquement les sélecteurs nécessaires en fonction de la page détectée.
 *
 * - Identifie la page en cours.
 * - Récupère les sélecteurs appropriés.
 * - Vérifie la présence des sélecteurs et signale ceux qui sont absents.
 *
 * @function loadSelectorsForCurrentPage
 * @returns {Object} Un objet contenant les sélecteurs DOM propres à la page actuelle.
 *
 * @example
 *  Charger les sélecteurs de la page courante :
 * const selectors = loadSelectorsForCurrentPage();
 * console.log(selectors);
 */
export function loadSelectorsForCurrentPage() {
  logEvent(
    'info',
    'Début du chargement des sélecteurs DOM pour la page actuelle.',
  );

  // Détecte la page en cours
  const currentPage = getCurrentPage();
  logEvent('info', `Page détectée : ${currentPage}`);

  // Sélection des sélecteurs en fonction de la page
  let selectors = {};
  if (currentPage === 'index') {
    logEvent('info', "Chargement des sélecteurs pour la page d'accueil.");
    selectors = getIndexSelectors();
  } else {
    logEvent('warn', 'Aucun sélecteur spécifique défini pour cette page.');
  }

  // Vérification des sélecteurs manquants
  const missingSelectors = checkSelectors(selectors);
  if (missingSelectors.length > 0) {
    logEvent('error', 'Sélecteurs manquants détectés.', { missingSelectors });
  } else {
    logEvent('success', 'Tous les sélecteurs DOM sont présents.');
  }

  return selectors;
}
/*= ============================================= */
/*        Rafraîchissement des Sélecteurs       */
/*= ============================================= */
/**
 * Réinitialise dynamiquement les sélecteurs DOM pour garantir leur validité et éviter les erreurs.
 *
 * - Vide le cache pour s'assurer d'utiliser des références valides.
 * - Recharge les sélecteurs adaptés à la page active.
 *
 * @function refreshSelectors
 * @returns {void} Ne retourne rien mais met à jour les sélecteurs en arrière-plan.
 *
 * @example
 *  Rafraîchir les sélecteurs après un changement dynamique :
 * refreshSelectors();
 *
 *  Exemple d'utilisation avant une action critique :
 * refreshSelectors();
 * updateUI(); // Fonction qui met à jour l'affichage
 */
export function refreshSelectors() {
  logEvent('info', 'Début du rafraîchissement des sélecteurs DOM...');

  // Purge le cache pour garantir des références valides
  logEvent('info', 'Vidage du cache des sélections DOM.');
  clearDomCache();

  // Recharge les sélecteurs dynamiquement en fonction de la page active
  logEvent(
    'info',
    'Rechargement des sélecteurs en fonction de la page active.',
  );
  Object.assign(domSelectors, loadSelectorsForCurrentPage());

  logEvent('success', 'Sélecteurs DOM mis à jour avec succès.');
}

/*= ============================================= */
/*        Initialisation des Sélecteurs         */
/*= ============================================= */
/**
 * ---------------------------------------------------------------------------------------------------
 *  Initialise les sélecteurs DOM après le chargement complet de la page et empêche une double exécution.
 * ---------------------------------------------------------------------------------------------------
/**
 * Initialise les sélecteurs DOM après le chargement complet de la page et empêche une double exécution.
 *
 * - Charge les sélecteurs DOM en fonction de la page détectée.
 * - Vérifie si l'initialisation a déjà eu lieu pour éviter toute duplication.
 *
 * @function initializeDomSelectors
 * @returns {void} Ne retourne rien mais charge les sélecteurs DOM de manière sécurisée.
 *
 * @example
 *  Lancement automatique au chargement du DOM :
 * document.addEventListener("DOMContentLoaded", initializeDomSelectors);
 *
 *  Vérification manuelle avant utilisation :
 * if (!window.domSelectorsLoaded) {
 *     initializeDomSelectors();
 * }
 */
function initializeDomSelectors() {
  logEvent('info', "Début de l'initialisation des sélecteurs DOM.");

  // Empêche une double initialisation
  if (window.domSelectorsLoaded) {
    logEvent(
      'warn',
      'Initialisation des sélecteurs DOM ignorée (déjà effectuée).',
    );
    return;
  }

  // Charge dynamiquement les sélecteurs de la page
  logEvent(
    'info',
    'Chargement des sélecteurs en fonction de la page actuelle.',
  );
  Object.assign(domSelectors, loadSelectorsForCurrentPage());

  logEvent('success', 'Sélecteurs DOM chargés avec succès.');

  // Marque l'initialisation comme terminée pour éviter les répétitions
  window.domSelectorsLoaded = true;
}

/*= ============================================= */
/*   Observation des Changements du DOM        */
/*= ============================================= */

/**
 * ---------------------------------------------------------------------------------------------------
 *  Observe en temps réel les modifications du DOM et met à jour dynamiquement les sélecteurs.
 * ---------------------------------------------------------------------------------------------------
 *
 * @function observeDomChanges
 * @returns {void} Ne retourne rien, mais active un `MutationObserver` sur le `document.body`.
 *
 * @example
 *  Activer l'observation après le chargement du DOM :
 * document.addEventListener("DOMContentLoaded", observeDomChanges);
 *
 *  Déclenchement automatique en cas de changement dans le DOM :
 * const newElement = document.createElement("div");
 * document.body.appendChild(newElement); // Déclenche l’observation et rafraîchit les sélecteurs
 */
function observeDomChanges() {
  const observer = new MutationObserver(() => {
    // Limite les rafraîchissements inutiles avec un délai anti-rebond (debounce)
    clearTimeout(window.domUpdateTimeout);
    window.domUpdateTimeout = setTimeout(() => {
      logEvent(
        'info',
        'Changements détectés, rafraîchissement des sélecteurs...',
      );
      refreshSelectors();
    }, 300);
  });

  // Active l'observation sur tout le document pour détecter les modifications
  observer.observe(document.body, { childList: true, subtree: true });

  logEvent('success', 'Observation des changements du DOM activée.');
}

// Exécute l'observation après le chargement complet du DOM
document.addEventListener(
  'DOMContentLoaded',
  observeDomChanges,
  initializeDomSelectors,
);

/*= ============================================= */
/*       Export des Fonctions & Sélecteurs      */
/*= ============================================= */

/**
 * ---------------------------------------------------------------------------------------------------
 *  Regroupe et expose les fonctions essentielles de gestion des sélecteurs DOM pour toute l’application.
 * ---------------------------------------------------------------------------------------------------
 *
 * @constant {Object} domSelectors - Regroupe les fonctions clés pour la gestion des sélecteurs DOM.
 * @property {Function} safeQuerySelector - Sélection sécurisée d'un élément DOM avec cache.
 * @property {Function} getCurrentPage - Détermine la page actuelle en fonction de l'URL.
 * @property {Function} refreshSelectors - Met à jour dynamiquement les sélecteurs après une modification du DOM.
 *
 * @example
 *  Importation et utilisation dans un autre fichier :
 * import { domSelectors } from "./domSelectors.js";
 *
 *  Sélectionner un élément en toute sécurité :
 * const header = domSelectors.safeQuerySelector("header");
 *
 *  Rafraîchir les sélecteurs après un changement de DOM :
 * domSelectors.refreshSelectors();
 */

export const domSelectors = {
  safeQuerySelector,
  getCurrentPage,
  refreshSelectors,
};

// Exporte `domSelectors` comme export par défaut pour un accès simplifié
export default domSelectors;
