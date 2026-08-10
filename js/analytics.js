/**
 * =====================================================================
 * ANALYTICS.JS — Capa de tracking
 * =====================================================================
 * trackEvent(name, params) envía el evento a la consola (para que puedas
 * verificarlo mientras desarrollas) y, cuando conectes GA4 / Meta Pixel /
 * TikTok Pixel, lo reenvía automáticamente a cada uno si está presente.
 *
 * Para conectar Google Analytics 4:
 *   1. Agrega el snippet de gtag.js en <head> de index.html (ver comentario ahí).
 *   2. No necesitas tocar este archivo — detecta window.gtag automáticamente.
 *
 * Para conectar Meta Pixel:
 *   1. Agrega el snippet de fbq en <head> de index.html.
 *   2. Este archivo detecta window.fbq automáticamente y llama fbq('trackCustom', ...).
 *
 * Para conectar TikTok Pixel:
 *   1. Agrega el snippet de ttq en <head> de index.html.
 *   2. Este archivo detecta window.ttq automáticamente.
 * =====================================================================
 */

function trackEvent(eventName, params = {}) {
  const payload = { ...params, timestamp: new Date().toISOString() };

  // Log local — útil durante desarrollo / QA.
  console.log(`[trackEvent] ${eventName}`, payload);

  // Google Analytics 4
  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, params);
  }

  // Meta Pixel
  if (typeof window.fbq === "function") {
    window.fbq("trackCustom", eventName, params);
  }

  // TikTok Pixel
  if (typeof window.ttq !== "undefined" && window.ttq.track) {
    window.ttq.track(eventName, params);
  }

  // Guarda un historial local simple (útil para depurar sin conectar nada aún)
  try {
    const log = JSON.parse(sessionStorage.getItem("velas_event_log") || "[]");
    log.push({ eventName, ...payload });
    sessionStorage.setItem("velas_event_log", JSON.stringify(log.slice(-100)));
  } catch (e) {
    /* sessionStorage no disponible — no es crítico */
  }
}

// Evento de carga de página
document.addEventListener("DOMContentLoaded", () => {
  trackEvent("page_view", { page: "landing_velas" });
});
