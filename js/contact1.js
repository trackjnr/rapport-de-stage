document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM entièrement chargé et analysé');

  // Charger utils.js dynamiquement sans utiliser import
  const script = document.createElement('script');
  script.src = '../js/utils/utils.js';
  script.type = 'text/javascript';
  script.onload = function () {
    console.log('utils.js chargé avec succès');
  };
  script.onerror = function () {
    console.error('Erreur lors du chargement de utils.js');
  };
  document.head.appendChild(script);

  const contactForm = document.createElement('form');
  contactForm.setAttribute('id', 'contact-form');
  contactForm.setAttribute('action', 'https://formspree.io/f/xanewnjz');
  contactForm.setAttribute('method', 'POST');

  contactForm.innerHTML = `
        <label for="name">Nom <span aria-hidden="true">*</span></label>
        <input type="text" id="name" name="name" placeholder="Votre nom" required>

        <label for="email">E-mail <span aria-hidden="true">*</span></label>
        <input type="email" id="email" name="email" placeholder="Votre adresse e-mail" required>

        <label for="subject">Sujet</label>
        <input type="text" id="subject" name="subject" placeholder="Objet de votre message">

        <label for="message">Message <span aria-hidden="true">*</span></label>
        <textarea id="message" name="message" rows="5" placeholder="Votre message ici..." required></textarea>

        <button type="submit">Envoyer</button>
    `;

  document.getElementById('contact').appendChild(contactForm);
  console.log('Formulaire ajouté au DOM');

  contactForm.addEventListener('submit', (event) => {
    console.log('Formulaire soumis');

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();

    console.log('Nom: ', name);
    console.log('Email: ', email);
    console.log('Message: ', message);

    if (name === '' || email === '' || message === '') {
      alert('Veuillez remplir tous les champs obligatoires.');
      console.warn('Champs obligatoires non remplis');
      event.preventDefault();
      return;
    }

    if (!validateEmail(email)) {
      alert('Veuillez entrer une adresse e-mail valide.');
      console.warn('Adresse e-mail invalide');
      event.preventDefault();
      return;
    }

    console.log('Envoi du formulaire vers Formspree');
  });

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
});
