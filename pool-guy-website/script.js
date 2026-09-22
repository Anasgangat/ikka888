// Mobile navigation: opens and closes the menu without any framework.
const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');

if (menuToggle && siteNav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = siteNav.classList.toggle('open');
    document.body.classList.toggle('menu-open', isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
  });

  siteNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      siteNav.classList.remove('open');
      document.body.classList.remove('menu-open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Open navigation');
    });
  });
}

// Reveal sections as they enter the screen for a soft, premium scroll effect.
const revealItems = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealItems.forEach((item) => revealObserver.observe(item));

// This demo form confirms the enquiry locally. Connect it to email or a form service later.
const quoteForm = document.querySelector('#quote-form');
const formStatus = document.querySelector('#form-status');

if (quoteForm && formStatus) {
  quoteForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = new FormData(quoteForm).get('name');
    formStatus.textContent = `Thanks${name ? `, ${name}` : ''}! Your quote request is ready to send.`;
    quoteForm.reset();
  });
}

// Keep the footer year current automatically.
const year = document.querySelector('#current-year');
if (year) year.textContent = new Date().getFullYear();
