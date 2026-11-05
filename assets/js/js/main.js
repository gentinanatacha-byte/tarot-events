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

  /* =============================================================
     MOUVEMENT
     Rien ici n'est indispensable : si le JavaScript ne tourne pas,
     la page reste complète et lisible. Tout est coupé si la personne
     a demandé moins d'animations dans ses réglages système.
     ============================================================= */

  var sobre = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Barre de progression de lecture ---- */
  if (!sobre) {
    var barre = document.createElement('div');
    barre.className = 'progression';
    document.body.appendChild(barre);
    var majBarre = function () {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      barre.style.transform = 'scaleX(' + (h > 0 ? window.scrollY / h : 0) + ')';
    };
    majBarre();
    window.addEventListener('scroll', majBarre, { passive: true });
    window.addEventListener('resize', majBarre);
  }

  /* ---- Apparition au défilement ----
     On marque les éléments depuis le JS : aucune page n'a été touchée. */
  if ('IntersectionObserver' in window) {
    var groupes = [
      '.wrap > .eyebrow', '.wrap > h1', '.wrap > h2', '.wrap > h3', '.wrap > p',
      '.wrap > .btn', '.wrap > hr.rule', '.wrap > .tablewrap', '.wrap > .faq',
      '.wrap > ul', '.wrap > form', '.split > div', '.card', '.formule',
      '.post-card', '.bandeau p', '.tirage'
    ].join(',');

    var cibles = [].slice.call(document.querySelectorAll(groupes));
    cibles.forEach(function (el) {
      if (el.closest('.hero-body')) return;           // le héros a sa propre entrée
      if (el.closest('.site-header, .site-footer')) return;
      el.setAttribute('data-anim', '');
      var voisins = [].slice.call(el.parentNode.children).filter(function (n) {
        return n.hasAttribute && n.hasAttribute('data-anim');
      });
      el.style.setProperty('--rang', Math.min(voisins.indexOf(el), 6));
    });

    var vigie = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (e) {
        // On révèle aussi ce qui est DÉJÀ passé au-dessus de l'écran : sinon,
        // un saut direct en bas de page (touche Fin, glissement de l'ascenseur)
        // laisse invisibles tous les blocs survolés d'un coup.
        if (e.isIntersecting || e.boundingClientRect.top < 0) {
          e.target.classList.add('est-vu');
          vigie.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    cibles.forEach(function (el) { vigie.observe(el); });

    // Filet de sécurité : au cas où un bloc échapperait quand même à la vigie.
    window.addEventListener('load', function () {
      window.setTimeout(function () {
        cibles.forEach(function (el) {
          if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('est-vu');
        });
      }, 400);
    });
  }

  /* ---- Entrée du héros ---- */
  var heros = document.querySelector('.hero-body');
  if (heros && !sobre) {
    [].slice.call(heros.children).forEach(function (el, i) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(1.2rem)';
      el.style.transition = 'opacity .9s ease ' + (120 + i * 110) + 'ms, transform .9s cubic-bezier(.22,.68,.24,1) ' + (120 + i * 110) + 'ms';
    });
    requestAnimationFrame(function () {
      [].slice.call(heros.children).forEach(function (el) {
        el.style.opacity = ''; el.style.transform = '';
      });
    });
  }

  /* ---- Parallaxe des bandeaux ---- */
  var bandeaux = [].slice.call(document.querySelectorAll('.bandeau img'));
  if (bandeaux.length && !sobre) {
    var enCours = false;
    var majParallaxe = function () {
      bandeaux.forEach(function (img) {
        var b = img.parentNode.getBoundingClientRect();
        if (b.bottom < -200 || b.top > window.innerHeight + 200) return;
        var avance = (b.top + b.height / 2 - window.innerHeight / 2) / window.innerHeight;
        img.style.transform = 'translate3d(0,' + (avance * -26).toFixed(1) + 'px,0) scale(1.1)';
      });
      enCours = false;
    };
    window.addEventListener('scroll', function () {
      if (!enCours) { enCours = true; requestAnimationFrame(majParallaxe); }
    }, { passive: true });
    majParallaxe();
  }

  /* ---- Les prix se comptent ---- */
  if ('IntersectionObserver' in window && !sobre) {
    var prix = [].slice.call(document.querySelectorAll('td.num, .price, .tarif'))
      .filter(function (el) { return /CHF/.test(el.textContent) && /\d/.test(el.textContent); });

    prix.forEach(function (el) {
      // on isole le nombre dans un <span> pour ne pas abîmer le reste de la cellule
      var remplace = false;
      [].slice.call(el.childNodes).forEach(function (n) {
        if (remplace || n.nodeType !== 3 || !/\d/.test(n.nodeValue)) return;
        var m = n.nodeValue.match(/(\d(?:[\d\s'’]*\d)?)/);
        if (!m) return;
        var avant = n.nodeValue.slice(0, m.index);
        var apres = n.nodeValue.slice(m.index + m[0].length);
        var chiffre = document.createElement('span');
        chiffre.className = 'compteur';
        chiffre.setAttribute('data-cible', m[0].replace(/[\s'’]/g, ''));
        chiffre.textContent = m[0];
        var frag = document.createDocumentFragment();
        if (avant) frag.appendChild(document.createTextNode(avant));
        frag.appendChild(chiffre);
        if (apres) frag.appendChild(document.createTextNode(apres));
        n.parentNode.replaceChild(frag, n);
        remplace = true;
      });
    });

    var compteurs = [].slice.call(document.querySelectorAll('.compteur'));
    var vigiePrix = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (e) {
        if (!e.isIntersecting) return;
        vigiePrix.unobserve(e.target);
        var el = e.target, fin = parseInt(el.getAttribute('data-cible'), 10), t0 = null;
        if (!fin) return;
        var pas = function (ts) {
          if (t0 === null) t0 = ts;
          var k = Math.min((ts - t0) / 900, 1);
          var doux = 1 - Math.pow(1 - k, 3);
          el.textContent = Math.round(fin * doux).toLocaleString('fr-CH');
          if (k < 1) requestAnimationFrame(pas); else el.textContent = fin.toLocaleString('fr-CH');
        };
        requestAnimationFrame(pas);
      });
    }, { threshold: 0.4 });
    compteurs.forEach(function (el) { vigiePrix.observe(el); });
  }

  /* ---- Fond vidéo de la section tirage ----
     Une vidéo d'ambiance n'est jamais indispensable : on ne la sert qu'aux
     écrans larges, hors mouvement réduit et hors économiseur de données, et
     uniquement quand la section arrive à l'écran. Ailleurs, fond uni. */
  var fond = document.querySelector('[data-video-fond]');
  if (fond && 'IntersectionObserver' in window) {
    var reseau = navigator.connection || {};
    var lent = reseau.saveData === true || /2g/.test(reseau.effectiveType || '');
    var large = window.matchMedia('(min-width: 980px)').matches;

    if (large && !sobre && !lent) {
      var base = fond.getAttribute('data-video-fond');
      var guetFond = new IntersectionObserver(function (entrees) {
        if (!entrees[0].isIntersecting) return;
        guetFond.disconnect();
        fond.poster = base + '-poster.webp';
        // Deux formats : le navigateur n'en télécharge qu'un, le premier qu'il
        // sait lire. WebM d'abord (plus léger), MP4 pour Safari et les autres.
        [['.webm', 'video/webm'], ['.mp4', 'video/mp4']].forEach(function (f) {
          var s = document.createElement('source');
          s.src = base + f[0];
          s.type = f[1];
          fond.appendChild(s);
        });
        // preload="none" : il faut demander explicitement le chargement, puis
        // attendre d'avoir une image avant de lancer la lecture.
        fond.load();
        fond.addEventListener('loadeddata', function () {
          fond.classList.add('est-visible');   // au pire, l'image fixe s'affiche
          var lecture = fond.play();
          if (lecture && lecture.catch) lecture.catch(function () {});
        }, { once: true });
        // Si aucun des deux formats n'est lisible, on reste sur le fond uni
        // plutôt que d'afficher un rectangle vide.
        window.setTimeout(function () {
          if (fond.readyState < 2) fond.classList.remove('est-visible');
        }, 6000);
      }, { rootMargin: '300px' });
      guetFond.observe(fond);
    }
  }

  /* ---- Tirage : trois cartes du jeu de Natacha, une seule se retourne ---- */
  var tirage = document.querySelector('[data-tirage]');
  if (tirage) {
    var source = document.querySelector('script[data-arcanes]');
    var arcanes = [];
    try { arcanes = JSON.parse(source.textContent); } catch (e) { arcanes = []; }

    var cartes = [].slice.call(tirage.querySelectorAll('.carte'));
    var suite = document.querySelector('[data-tirage-suite]');
    var invite = document.querySelector('[data-tirage-invite]');
    var relancer = document.querySelector('[data-tirage-reset]');
    var visible = false;

    var urlCarte = function (id, largeur) { return '/assets/cartes/' + id + '-' + largeur + '.webp'; };

    var distribuer = function () {
      var pioche = arcanes.slice();
      cartes.forEach(function (c) {
        var a = pioche.splice(Math.floor(Math.random() * pioche.length), 1)[0];
        if (!a) return;
        c.dataset.id = a.id;
        c.dataset.nom = a.nom;
        c.dataset.num = a.num;
        var img = c.querySelector('.carte-face img');
        img.removeAttribute('src');
        img.removeAttribute('srcset');
        img.alt = '';
        c.classList.remove('est-tiree');
        c.disabled = false;
      });
      if (suite) suite.hidden = true;
      if (invite) invite.hidden = false;
      if (visible) precharger();
    };

    // On choisit la largeur nous-mêmes plutôt qu'avec un srcset : sur un téléphone
    // à forte densité, le navigateur prendrait la grande image alors que la carte
    // ne fait que 160 pixels de large à l'écran. 340 px y est déjà deux fois plus
    // fin que nécessaire, pour un tiers du poids.
    var largeurCarte = function () {
      var grand = window.matchMedia('(min-width: 980px)').matches;
      return (grand && window.devicePixelRatio > 1.5) ? 620 : 340;
    };

    // On ne télécharge les trois cartes distribuées qu'une fois la section à l'écran.
    var precharger = function () {
      var w = largeurCarte();
      cartes.forEach(function (c) {
        if (!c.dataset.id) return;
        var i = new Image();
        i.src = urlCarte(c.dataset.id, w);
      });
    };

    var reveler = function (c) {
      var img = c.querySelector('.carte-face img');
      img.src = urlCarte(c.dataset.id, largeurCarte());
      img.alt = c.dataset.num + ' — ' + c.dataset.nom;
      c.classList.add('est-tiree');
      cartes.forEach(function (autre) { if (autre !== c) autre.disabled = true; });
      if (invite) invite.hidden = true;
      window.setTimeout(function () { if (suite) suite.hidden = false; }, sobre ? 0 : 700);
    };

    cartes.forEach(function (c) {
      c.addEventListener('click', function () {
        if (tirage.querySelector('.est-tiree')) return;
        reveler(c);
      });
    });

    if (relancer) relancer.addEventListener('click', distribuer);
    distribuer();

    if ('IntersectionObserver' in window) {
      var guet = new IntersectionObserver(function (entrees) {
        if (!entrees[0].isIntersecting) return;
        visible = true; precharger(); guet.disconnect();
      }, { rootMargin: '200px' });
      guet.observe(tirage);
    } else {
      visible = true; precharger();
    }
  }

})();
