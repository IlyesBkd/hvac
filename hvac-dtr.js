/**
 * HVAC Dynamic Text Replacement (DTR) + Geo-location
 * Shared across all HVAC landing pages.
 *
 * URL params supported:
 *   ?service=ac-repair|heating-repair|hvac-repair
 *   ?city=Miami,%20FL   (overrides geo-IP)
 *
 * Elements targeted (by data-attribute):
 *   data-dtr="h1"        → main headline
 *   data-dtr="sub"       → subtitle
 *   data-dtr="cta"       → CTA button text
 *   data-dtr="hero-img"  → hero background image (style.backgroundImage)
 *   class="geo"          → city insertion (inline)
 *   class="geo-text"     → city insertion (inline, multiple)
 *   id="geo-headline"    → city in hero badge
 */
(function () {
  'use strict';

  /* ── Phone number (single source of truth) ── */
  var PHONE_DISPLAY = '(844) 833-1956';
  var PHONE_TEL     = 'tel:+18448331956';

  /* ── Service → text mapping ── */
  var SERVICE_MAP = {
    'ac-repair': {
      h1:    '24/7 Emergency AC Repair in {city}',
      h1def: '24/7 Emergency AC Repair Near You',
      sub:   'Fast Air Conditioning Repair in {city}. Licensed & Insured HVAC Technicians.',
      subdef:'Fast Air Conditioning Repair. Licensed & Insured HVAC Technicians.',
      cta:   'Call Now – 24/7 AC Repair',
      heroImg: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=2200&q=80',
      heroAlt: 'Technician repairing an outdoor AC unit'
    },
    'heating-repair': {
      h1:    '24/7 Emergency Heating & Furnace Repair in {city}',
      h1def: '24/7 Emergency Heating & Furnace Repair',
      sub:   'No Heat? Fast 24/7 Furnace & Heating Repair in {city}.',
      subdef:'No Heat? We Provide Fast, 24/7 Furnace & Heating Repair.',
      cta:   'Call Now – Emergency Heating Repair',
      heroImg: 'https://images.unsplash.com/photo-1604014238170-4def1e19b8d9?auto=format&fit=crop&w=2200&q=80',
      heroAlt: 'Technician inspecting a furnace system'
    },
    'hvac-repair': {
      h1:    '24/7 Emergency HVAC Repair in {city}',
      h1def: '24/7 Emergency HVAC Repair – Heating & Cooling',
      sub:   'Full HVAC System Repair in {city}, Day or Night. Licensed & Insured.',
      subdef:'Full HVAC System Repair, Day or Night. Licensed & Insured.',
      cta:   'Call Now – 24/7 HVAC Service',
      heroImg: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=2200&q=80',
      heroAlt: 'HVAC technician working on heating and cooling system'
    }
  };

  /* ── Helpers ── */
  function qsa(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }
  function qs(sel)  { return document.querySelector(sel); }
  function param(name) {
    var p = new URLSearchParams(window.location.search);
    return (p.get(name) || '').trim();
  }

  /* ── Phone swap ── */
  function setPhoneLinks() {
    qsa('a[href^="tel:"]').forEach(function (a) { a.setAttribute('href', PHONE_TEL); });
    qsa('.swap-target').forEach(function (el) {
      if (el.tagName === 'A' && el.getAttribute('href') && el.getAttribute('href').indexOf('tel:') === 0) {
        el.setAttribute('href', PHONE_TEL);
      }
    });
    var phoneEls = qsa('.phone-display');
    phoneEls.forEach(function (el) { el.textContent = PHONE_DISPLAY; });
  }

  /* ── Geo-location (IP-based or ?city= override) ── */
  var GEO_FALLBACK = 'Your Local Area';

  function applyGeo(city) {
    var label = city || GEO_FALLBACK;
    var h = document.getElementById('geo-headline');
    if (h) h.textContent = label;
    qsa('.geo-text').forEach(function (s) { s.textContent = label; });
    qsa('.geo').forEach(function (s) { s.textContent = label; });
    return label;
  }

  function resolveGeo(callback) {
    var cityParam = param('city');
    if (cityParam) { callback(decodeURIComponent(cityParam)); return; }

    try {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', 'https://ipapi.co/json/', true);
      xhr.timeout = 3000;
      xhr.onload = function () {
        if (xhr.status === 200) {
          var d = JSON.parse(xhr.responseText);
          var c = d.city, r = d.region;
          callback(c && r ? c + ', ' + r : c || GEO_FALLBACK);
        } else { callback(GEO_FALLBACK); }
      };
      xhr.onerror = xhr.ontimeout = function () { callback(GEO_FALLBACK); };
      xhr.send();
    } catch (e) { callback(GEO_FALLBACK); }
  }

  /* ── DTR (Dynamic Text Replacement) ── */
  function applyDTR(cityLabel) {
    var svc = param('service');
    var conf = SERVICE_MAP[svc];
    if (!conf) return;

    var hasCity = cityLabel && cityLabel !== GEO_FALLBACK;

    var h1El  = qs('[data-dtr="h1"]');
    var subEl = qs('[data-dtr="sub"]');
    var ctaEls = qsa('[data-dtr="cta"]');
    var imgEl  = qs('[data-dtr="hero-img"]');

    if (h1El) {
      var h1Text = hasCity ? conf.h1.replace('{city}', cityLabel) : conf.h1def;
      h1El.textContent = h1Text;
    }
    if (subEl) {
      var subText = hasCity ? conf.sub.replace('{city}', cityLabel) : conf.subdef;
      subEl.textContent = subText;
    }
    ctaEls.forEach(function (el) { el.textContent = conf.cta; });
    if (imgEl && conf.heroImg) {
      imgEl.style.backgroundImage = "url('" + conf.heroImg + "')";
      imgEl.setAttribute('aria-label', conf.heroAlt || '');
    }
  }

  /* ── Init ── */
  document.addEventListener('DOMContentLoaded', function () {
    setPhoneLinks();
    resolveGeo(function (city) {
      var label = applyGeo(city);
      applyDTR(label);
    });
  });
})();
