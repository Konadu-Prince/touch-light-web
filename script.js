const slider = document.getElementById("lightSlider");
const label = document.getElementById("intensityLabel");
const display = document.getElementById("lightDisplay");
const copyLinkBtn = document.getElementById("copyLinkBtn");
const resetBtn = document.getElementById("resetBtn");

const STORAGE_KEY = "light-intensity";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function setIntensity(intensity) {
  const value = clamp(Number(intensity) || 0, 0, 255);
  slider.value = String(value);
  slider.setAttribute("aria-valuenow", String(value));
  label.textContent = `Light Intensity: ${value}`;
  display.style.backgroundColor = `rgb(${value}, ${value}, ${value})`;
  try { localStorage.setItem(STORAGE_KEY, String(value)); } catch {}
  const url = new URL(window.location.href);
  url.searchParams.set("i", String(value));
  window.history.replaceState({}, "", url);
}

function readInitialIntensity() {
  const url = new URL(window.location.href);
  const fromQuery = url.searchParams.get("i");
  if (fromQuery !== null) return clamp(Number(fromQuery), 0, 255);
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) return clamp(Number(stored), 0, 255);
  } catch {}
  return 0;
}

slider.addEventListener("input", () => {
  setIntensity(slider.value);
});

copyLinkBtn?.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(window.location.href);
    copyLinkBtn.textContent = "Copied!";
    setTimeout(() => (copyLinkBtn.textContent = "Copy link"), 1200);
  } catch {}
});

resetBtn?.addEventListener("click", () => {
  setIntensity(0);
});

// Service worker registration (PWA)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}

// Initialize
setIntensity(readInitialIntensity());
