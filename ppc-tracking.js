/**
 * PPC Tracking — Vanilla JS
 * Captures Google Ads ValueTrack + UTM params, persists them,
 * injects dynamic city into H1, logs call clicks, and fills hidden form fields.
 *
 * Supported params:
 *   campaignid, adgroupid, keyword, matchtype, device, gclid,
 *   loc_physical_ms, utm_source, utm_medium, utm_campaign, city
 */
(function () {
  'use strict';

  var PPC_KEYS = [
    'campaignid', 'adgroupid', 'keyword', 'matchtype', 'device',
    'gclid', 'loc_physical_ms', 'utm_source', 'utm_medium', 'utm_campaign', 'city'
  ];

  var STORAGE_KEY = 'ppc_params';

  /* ------------------------------------------------------------------ */
  /*  Utility helpers                                                    */
  /* ------------------------------------------------------------------ */

  /** Read all PPC params from the current URL query string */
  function getPPCParams() {
    var params = {};
    var sp = new URLSearchParams(window.location.search);
    for (var i = 0; i < PPC_KEYS.length; i++) {
      params[PPC_KEYS[i]] = (sp.get(PPC_KEYS[i]) || '').trim();
    }
    return params;
  }

  /** Save params to sessionStorage (survives internal navigation) */
  function savePPCParams(params) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(params));
    } catch (e) { /* private browsing / quota */ }
  }

  /** Load params from sessionStorage (fallback if URL has no params) */
  function loadPPCParams() {
    try {
      var raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  /** Merge: URL params win over stored params; stored fill the gaps */
  function resolveParams() {
    var fromURL = getPPCParams();
    var stored  = loadPPCParams() || {};
    var merged  = {};
    for (var i = 0; i < PPC_KEYS.length; i++) {
      var k = PPC_KEYS[i];
      merged[k] = fromURL[k] || stored[k] || '';
    }
    savePPCParams(merged);
    return merged;
  }

  /* ------------------------------------------------------------------ */
  /*  City resolution                                                    */
  /* ------------------------------------------------------------------ */

  /**
   * TODO: Implement actual geo-id → city lookup.
   * When ready, call an API or use a static map to resolve
   * Google's loc_physical_ms (Canonical Criteria ID) to a city name.
   * Must return a string or empty string.
   */
  function resolveCityFromGeoId(locPhysicalMs) {
    // STUB — replace with real implementation later
    // Example static map (uncomment & extend when needed):
    // var map = { '1014221': 'Miami', '1014895': 'Houston' };
    // return map[locPhysicalMs] || '';
    return '';
  }

  /**
   * Determine the city to display:
   *   1. ?city=Austin  → "Austin"
   *   2. ?loc_physical_ms=XXX  → resolveCityFromGeoId (stub)
   *   3. fallback → "" (H1 keeps its default text)
   */
  function resolveCity(params) {
    if (params.city) {
      // Capitalize first letter of each word for clean display
      return params.city.replace(/\b\w/g, function (c) { return c.toUpperCase(); });
    }
    if (params.loc_physical_ms) {
      return resolveCityFromGeoId(params.loc_physical_ms);
    }
    return '';
  }

  /* ------------------------------------------------------------------ */
  /*  Dynamic H1 injection                                               */
  /* ------------------------------------------------------------------ */

  function injectCity(city) {
    var el = document.getElementById('ppc-city');
    if (!el) return;
    if (city) {
      el.textContent = ' in ' + city;
    } else {
      el.textContent = '';  // keep fallback (no suffix)
    }
  }

  /* ------------------------------------------------------------------ */
  /*  CTA call-click tracking                                            */
  /* ------------------------------------------------------------------ */

  /**
   * TODO: Replace with real tracking endpoint when ready.
   * Example: POST to a webhook with params + timestamp.
   */
  function trackCallClick(params) {
    // STUB — wire up your webhook / GA4 event / server endpoint here
    // fetch('/api/track-call', { method:'POST', body: JSON.stringify(params) });
  }

  function bindCallTracking(params) {
    var links = document.querySelectorAll('a[href^="tel:"]');
    for (var i = 0; i < links.length; i++) {
      (function (link) {
        link.addEventListener('click', function () {
          var payload = {
            event: 'call_click',
            timestamp: new Date().toISOString(),
            page: window.location.pathname,
            params: params
          };
          console.log('[PPC] call_click', payload);
          trackCallClick(payload);
        });
      })(links[i]);
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Hidden form fields                                                 */
  /* ------------------------------------------------------------------ */

  function fillHiddenFields(params) {
    var forms = document.querySelectorAll('form');
    for (var f = 0; f < forms.length; f++) {
      for (var i = 0; i < PPC_KEYS.length; i++) {
        var k = PPC_KEYS[i];
        var input = forms[f].querySelector('input[name="' + k + '"]');
        if (!input) {
          input = document.createElement('input');
          input.type = 'hidden';
          input.name = k;
          forms[f].appendChild(input);
        }
        input.value = params[k];
      }
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Expose globally for external use                                   */
  /* ------------------------------------------------------------------ */

  window.PPCTracking = {
    getPPCParams:  getPPCParams,
    savePPCParams: savePPCParams,
    loadPPCParams: loadPPCParams,
    resolveParams: resolveParams,
    resolveCity:   resolveCity,
    resolveCityFromGeoId: resolveCityFromGeoId
  };

  /* ------------------------------------------------------------------ */
  /*  Init on DOM ready                                                  */
  /* ------------------------------------------------------------------ */

  function init() {
    var params = resolveParams();
    var city   = resolveCity(params);

    injectCity(city);
    bindCallTracking(params);
    fillHiddenFields(params);

    console.log('[PPC] params resolved', params, '| city:', city || '(none)');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
