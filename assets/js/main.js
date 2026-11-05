/* Natacha Laure · Tarot Events — interactions minimales */
(function () {
  'use strict';

  /* ---- Menu mobile ---- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('menu-principal');

  function syncNav() {
    if (!toggle || !nav) return;
    if (window.matchMedia('(max-width: 1024px)').matches) {
      if (!nav.hasAttribute('data-init')) {
        nav.hidden = true;
        nav.setAttribute('data-init', '1');
      }
    } else {
      nav.hidden = false;
      nav.removeAttribute('data-init');
      toggle.setAttribute('aria-expanded', 'false');
    }
  }

  if (toggle && nav) {
    syncNav();
    window.addEventListener('resize', syncNav);
    toggle.addEventListener('click', function () {
      var open = nav.hidden;
      nav.hidden = !open;
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A' && window.matchMedia('(max-width: 1024px)').matches) {
        nav.hidden = true;
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---- En-tête transparent posé sur le héros, solide dès qu'on défile ---- */
  if (document.body.classList.contains('avec-hero')) {
    var entete = document.querySelector('.site-header');
    if (entete) {
      var majEntete = function () {
        entete.classList.toggle('est-solide', window.scrollY > 40);
      };
      majEntete();
      window.addEventListener('scroll', majEntete, { passive: true });
    }
  }

  /* ---- Envoi des formulaires en AJAX, sans quitter la page ---- */
  Array.prototype.forEach.call(document.querySelectorAll('form[data-ajax]'), function (form) {
    var status = form.querySelector('.form-status');
    var submit = form.querySelector('[type="submit"]');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;

      var okMsg = form.getAttribute('data-ok') || 'Merci.';
      var koMsg = form.getAttribute('data-ko') || 'Erreur.';
      var label = submit ? submit.textContent : '';

      if (submit) { submit.disabled = true; submit.textContent = '…'; }
      if (status) { status.textContent = ''; status.className = 'form-status'; }

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      })
        .then(function (r) {
          if (!r.ok) throw new Error('http');
          form.reset();
          if (status) { status.textContent = okMsg; status.className = 'form-status ok'; }
        })
        .catch(function () {
          if (status) { status.textContent = koMsg; status.className = 'form-status ko'; }
        })
        .then(function () {
          if (submit) { submit.disabled = false; submit.textContent = label; }
        });
    });
  });
})();
