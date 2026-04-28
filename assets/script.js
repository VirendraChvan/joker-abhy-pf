/* ============================================================
   JOKER_ABHY — PORTFOLIO SCRIPT  v3
   Reads:  assets/data.json
   Writes: DOM only (stats, socials, carousel, gallery,
           contact fields, footer)
   Does NOT touch: <title>, meta, og:*, twitter:* — those
   are hardcoded in index.html and must never be overwritten
   by JS (avoids Google Search Console structured data issues)
   ============================================================ */

(async function () {
  'use strict';

  /* ── 1. LOAD DATA ───────────────────────────────────────── */
  let data;
  try {
    const res = await fetch('assets/data.json');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    data = await res.json();
  } catch (e) {
    console.error('Failed to load portfolio data:', e);
    return;
  }

  const { stats, socials, brands, gallery, contact, footer } = data;

  /* ── 2. STATS GRID ──────────────────────────────────────── */
  const statsGrid = document.getElementById('stats-grid');
  if (statsGrid && stats) {
    statsGrid.innerHTML = stats.map(s => `
      <div class="stat-card reveal" aria-label="${s.ariaLabel}">
        <div class="stat-icon" aria-hidden="true">${getStatSVG(s.icon)}</div>
        <div class="stat-value">${s.value}</div>
        <div class="stat-label">${s.label}</div>
      </div>`).join('');
  }

  /* ── 3. SOCIALS GRID ────────────────────────────────────── */
  const socialsGrid = document.getElementById('socials-grid');
  if (socialsGrid && socials) {
    socialsGrid.innerHTML = socials.map(s => `
      <a class="social-card reveal"
         href="${s.url}"
         target="_blank"
         rel="noopener noreferrer"
         style="--card-color:${s.color}"
         aria-label="${s.ariaLabel}">
        <div class="social-icon-wrap">${getSocialSVG(s.icon, s.color)}</div>
        <div class="social-platform">${s.platform}</div>
        <div class="social-handle">${s.handle}</div>
        <span class="social-follow-btn">Follow &#x2197;</span>
      </a>`).join('');
  }

  /* ── 4. BRAND CAROUSEL (fixed seamless loop) ────────────── */
  const track = document.getElementById('carousel-track');
  if (track && brands) {
    /* Build one set of items */
    const buildItems = (suffix) => brands.map(b => `
      <span class="carousel-item" role="listitem">
        <img src="${b.logo}" alt="${b.alt}" title="${b.name}" loading="lazy" decoding="async" width="140" height="48">
      </span>
      <span class="carousel-divider" aria-hidden="true"></span>`
    ).join('');

    /* Insert 4 copies so we always have more than enough for seamless loop */
    const oneCopy = buildItems();
    track.innerHTML = oneCopy + oneCopy + oneCopy + oneCopy;

    /* After images settle, measure ONE copy width and set custom property
       so the CSS animation translates by exactly half the total track */
    const imgs = track.querySelectorAll('img');
    let loaded = 0;
    const onLoad = () => {
      loaded++;
      if (loaded < imgs.length) return;
      /* Width of 2 copies = half the 4-copy track */
      const halfW = track.scrollWidth / 2;
      track.style.setProperty('--carousel-half', halfW + 'px');
      track.classList.add('carousel-ready');
    };
    imgs.forEach(img => {
      if (img.complete) onLoad();
      else { img.addEventListener('load', onLoad); img.addEventListener('error', onLoad); }
    });
    /* Fallback: start after 1.5 s regardless */
    setTimeout(() => { if (!track.classList.contains('carousel-ready')) track.classList.add('carousel-ready'); }, 1500);
  }

  /* ── 5. GALLERY ─────────────────────────────────────────── */
  const galleryGrid = document.getElementById('gallery-grid');
  if (galleryGrid && gallery) {
    galleryGrid.innerHTML = gallery.map((img, i) => `
      <div class="gallery-item reveal" style="animation-delay:${i * 0.1}s">
        <img src="${img.src}" alt="${img.alt}" loading="${img.loading}" decoding="async">
        <div class="gallery-item-overlay">
          <span class="gallery-caption">${img.caption}</span>
        </div>
      </div>`).join('');
  }

  /* ── 6. CONTACT ─────────────────────────────────────────── */
  if (contact) {
    const mailLink = document.getElementById('contact-email-link');
    if (mailLink) {
      mailLink.href = `mailto:${contact.email}`;
      mailLink.textContent = contact.email;
    }
    const phoneLink = document.getElementById('contact-phone-link');
    if (phoneLink) {
      phoneLink.href = `tel:${contact.phone}`;
      phoneLink.textContent = contact.phoneDisplay;
    }
    const ctaText = document.getElementById('contact-cta-text');
    if (ctaText) ctaText.textContent = contact.ctaSubText;

    const formIframe = document.getElementById('google-form');
    if (formIframe) formIframe.src = contact.googleFormUrl;

    const contactSocials = document.getElementById('contact-socials');
    if (contactSocials && socials) {
      contactSocials.innerHTML = socials.map(s => `
        <a class="contact-social-btn"
           href="${s.url}"
           target="_blank"
           rel="noopener noreferrer"
           aria-label="${s.ariaLabel}">
          ${getSocialSVG(s.icon, '#ffffff')}
          ${s.platform}
        </a>`).join('');
    }
  }

  /* ── 7. FOOTER ──────────────────────────────────────────── */
  if (footer) {
    const copyEl = document.getElementById('footer-copy');
    if (copyEl) copyEl.textContent = footer.copyright;
    const creditEl = document.getElementById('footer-credit');
    if (creditEl) {
      creditEl.innerHTML = `<a href="${footer.developerUrl}" target="_blank" rel="nofollow noopener">${footer.developer}</a>`;
    }
  }

  /* ── 8. NAVBAR SCROLL ───────────────────────────────────── */
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
  }

  /* ── 9. HAMBURGER MENU ──────────────────────────────────── */
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      mobileMenu.setAttribute('aria-hidden',  String(!isOpen));
    });
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden',  'true');
      });
    });
  }

  /* ── 10. CUSTOM CURSOR (desktop only) ───────────────────── */
  const dot  = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  if (dot && ring && window.innerWidth > 768) {
    let mx = 0, my = 0;
    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + 'px';
      dot.style.top  = my + 'px';
    });
    (function animRing() {
      const rx = parseFloat(ring.style.left || 0);
      const ry = parseFloat(ring.style.top  || 0);
      ring.style.left = (rx + (mx - rx) * 0.15) + 'px';
      ring.style.top  = (ry + (my - ry) * 0.15) + 'px';
      requestAnimationFrame(animRing);
    })();
    document.querySelectorAll('a, button, .gallery-item, .social-card').forEach(el => {
      el.addEventListener('mouseenter', () => {
        ring.style.width = '54px'; ring.style.height = '54px';
        ring.style.borderColor = 'rgba(230,51,41,0.8)';
      });
      el.addEventListener('mouseleave', () => {
        ring.style.width = '36px'; ring.style.height = '36px';
        ring.style.borderColor = 'rgba(230,51,41,0.5)';
      });
    });
  }

  /* ── 11. SCROLL REVEAL ──────────────────────────────────── */
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  setTimeout(() => {
    document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));
  }, 100);

  /* ── 12. SMOOTH SCROLL ──────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  });

  /* ── STAT ICON SVG HELPER ────────────────────────────────── */
  function getStatSVG(icon) {
    const svgs = {
      'trending-up': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
      'briefcase': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
      'award': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>',
      'smartphone': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>'
    };
    return svgs[icon] || '';
  }

  /* ── SVG HELPER ─────────────────────────────────────────── */
  function getSocialSVG(icon, color) {
    const svgs = {
      instagram: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
      </svg>`,
      youtube: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
        <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="${color}" stroke="none"/>
      </svg>`,
      threads: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" aria-hidden="true">
        <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.473 12.01v-.017c.027-3.579.877-6.43 2.522-8.476C5.845 1.209 8.6.027 12.18 0h.014c2.746.021 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-.487-1.748-1.382-3.158-2.66-4.144-1.254-.97-2.906-1.477-4.907-1.491H12.9c-2.986.024-5.235.882-6.683 2.55-1.323 1.525-2.011 3.834-2.025 6.853v.013c.014 3.02.702 5.332 2.025 6.856 1.448 1.668 3.697 2.526 6.683 2.55h.04c2.722-.014 4.638-.826 5.849-2.48.94-1.294 1.41-3.012 1.41-5.107 0-2.153-.432-3.872-1.285-5.103-.965-1.4-2.482-2.153-4.51-2.153-.477 0-.961.055-1.45.165-.24-.524-.533-1.007-.885-1.44-.614-.754-1.378-1.175-2.254-1.175-.855 0-1.603.393-2.23 1.167-.574.71-1.002 1.673-1.275 2.863-.273 1.19-.41 2.535-.41 3.997 0 1.426.13 2.756.39 3.955.262 1.2.675 2.168 1.226 2.879.607.783 1.337 1.181 2.17 1.181.894 0 1.655-.436 2.258-1.296.406-.575.71-1.31.903-2.19a12.83 12.83 0 0 0 .189-2.53c0-1.62-.188-2.92-.56-3.863-.37-.942-.91-1.41-1.608-1.41-.462 0-.857.217-1.175.644-.315.424-.476.97-.476 1.62 0 .624.154 1.148.454 1.558.3.41.667.614 1.092.614.295 0 .553-.1.762-.295.21-.196.357-.472.435-.817l1.861.544c-.18.76-.545 1.354-1.082 1.765-.534.41-1.196.617-1.97.617-.985 0-1.829-.43-2.51-1.278-.682-.848-1.026-1.939-1.026-3.248 0-1.36.361-2.48 1.072-3.326.713-.847 1.586-1.278 2.595-1.278 1.242 0 2.284.593 3.1 1.762.817 1.17 1.23 2.73 1.23 4.634 0 1.138-.153 2.197-.456 3.148a8.003 8.003 0 0 1-1.372 2.62c-1.06 1.38-2.455 2.08-4.148 2.08z"/>
      </svg>`
    };
    return svgs[icon] || '';
  }

})();