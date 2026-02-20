(function () {
  const phoneDisplay = '(800) XXX-XXXX';
  const phoneTel = 'tel:+1800XXXXXXX';

  const SERVICE_MAP = {
    'ac-repair': {
      h1: 'AC Repair & Installation',
      image: 'https://images.unsplash.com/photo-1523413651479-597eb2da0ad6?auto=format&fit=crop&w=2200&q=80',
      aria: 'HVAC technician servicing an air conditioner'
    },
    furnace: {
      h1: 'Furnace Repair & Replacement',
      image: 'https://images.unsplash.com/photo-1604014238170-4def1e19b8d9?auto=format&fit=crop&w=2200&q=80',
      aria: 'Technician inspecting a furnace system'
    },
    'heat-pump': {
      h1: 'Heat Pump Service',
      image: 'https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=2200&q=80',
      aria: 'Heat pump outdoor unit being serviced'
    },
    'hvac-emergency': {
      h1: '24/7 HVAC Emergency Service',
      image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=2200&q=80',
      aria: 'Emergency HVAC technician repairing an AC unit'
    }
  };

  const DEFAULT_H1 = '24/7 HVAC Repair & Installation - AC, Furnace, Heat Pump';
  const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=2200&q=80';
  const DEFAULT_ARIA = 'Professional HVAC technician repairing an AC unit';

  function $(id) {
    return document.getElementById(id);
  }

  function setPhoneLinks() {
    const callLinks = document.querySelectorAll('a[href^="tel:"]');
    callLinks.forEach((a) => {
      a.setAttribute('href', phoneTel);
    });

    const floating = document.querySelector('.floating-call');
    if (floating) {
      const num = floating.querySelector('.floating-call__number');
      if (num) num.textContent = phoneDisplay;
    }

    const heroBtn = $('heroCallBtn');
    if (heroBtn) heroBtn.textContent = `CALL NOW ${phoneDisplay}`;

    const footerNum = document.querySelector('.footer__number');
    if (footerNum) footerNum.textContent = phoneDisplay;
  }

  function applyDTR() {
    const params = new URLSearchParams(window.location.search);
    const svc = (params.get('service') || '').trim();

    const h1El = $('heroH1');
    const bgEl = $('heroBg');

    const conf = SERVICE_MAP[svc];

    const h1 = conf ? conf.h1 : DEFAULT_H1;
    const img = conf ? conf.image : DEFAULT_IMAGE;
    const aria = conf ? conf.aria : DEFAULT_ARIA;

    if (h1El) h1El.textContent = h1;
    if (bgEl) {
      bgEl.style.backgroundImage = `url('${img}')`;
      bgEl.setAttribute('aria-label', aria);
    }

    // Preload hero image (best effort)
    const preload = document.createElement('link');
    preload.rel = 'preload';
    preload.as = 'image';
    preload.href = img;
    document.head.appendChild(preload);

    // Update JSON-LD image
    const jsonld = $('localbusiness-jsonld');
    if (jsonld) {
      try {
        const obj = JSON.parse(jsonld.textContent);
        obj.image = [img];
        jsonld.textContent = JSON.stringify(obj);
      } catch (_) {
        // no-op
      }
    }

    // Optional: auto-scroll to service card on deep intent
    if (svc === 'ac-repair') {
      // no auto-scroll: keep above-the-fold conversion
    }
  }

  function setupCarousel() {
    const track = $('carouselTrack');
    const dotsWrap = $('carouselDots');
    const prev = $('prevBtn');
    const next = $('nextBtn');

    if (!track || !dotsWrap || !prev || !next) return;

    const slides = Array.from(track.children);
    let idx = 0;

    function renderDots() {
      dotsWrap.innerHTML = '';
      slides.forEach((_, i) => {
        const d = document.createElement('button');
        d.type = 'button';
        d.className = 'dot' + (i === idx ? ' is-active' : '');
        d.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
        d.addEventListener('click', () => {
          idx = i;
          update();
          resetAuto();
        });
        dotsWrap.appendChild(d);
      });
    }

    function update() {
      track.style.transform = `translateX(-${idx * 100}%)`;
      const dots = Array.from(dotsWrap.children);
      dots.forEach((d, i) => d.classList.toggle('is-active', i === idx));
    }

    prev.addEventListener('click', () => {
      idx = (idx - 1 + slides.length) % slides.length;
      update();
      resetAuto();
    });

    next.addEventListener('click', () => {
      idx = (idx + 1) % slides.length;
      update();
      resetAuto();
    });

    renderDots();
    update();

    let timer = null;
    function startAuto() {
      timer = window.setInterval(() => {
        idx = (idx + 1) % slides.length;
        update();
      }, 4500);
    }
    function resetAuto() {
      if (timer) window.clearInterval(timer);
      startAuto();
    }
    startAuto();
  }

  function setupReveal() {
    const els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            io.unobserve(e.target);
          }
        });
      },
      { root: null, threshold: 0.15 }
    );

    els.forEach((el) => io.observe(el));
  }

  function setupYear() {
    const y = document.getElementById('year');
    if (y) y.textContent = String(new Date().getFullYear());
  }

  document.addEventListener('DOMContentLoaded', function () {
    setPhoneLinks();
    applyDTR();
    setupCarousel();
    setupReveal();
    setupYear();
  });
})();
