const slider = document.getElementById("lightSlider");
const label = document.getElementById("intensityLabel");
const display = document.getElementById("lightDisplay");
const copyLinkBtn = document.getElementById("copyLinkBtn");
const resetBtn = document.getElementById("resetBtn");
const intensityInput = document.getElementById("intensityInput");
const themeToggleBtn = document.getElementById("themeToggleBtn");
const installBtn = document.getElementById("installBtn");
const cameraTorchBtn = document.getElementById('cameraTorchBtn');
const stopCameraBtn = document.getElementById('stopCameraBtn');
const torchSupportMsg = document.getElementById('torchSupportMsg');
const screenTorchBtn = document.getElementById('screenTorchBtn');
const screenTorchLevel = document.getElementById('screenTorchLevel');
const screenTorchOverlay = document.getElementById('screenTorchOverlay');

const STORAGE_KEY = "light-intensity";
const THEME_KEY = "theme-preference"; // 'light' | 'dark' | 'auto'

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function setIntensity(intensity) {
  const value = clamp(Number(intensity) || 0, 0, 255);
  slider.value = String(value);
  slider.setAttribute("aria-valuenow", String(value));
  label.textContent = `Light Intensity: ${value}`;
  display.style.backgroundColor = `rgb(${value}, ${value}, ${value})`;
  if (intensityInput) intensityInput.value = String(value);
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

intensityInput?.addEventListener("input", () => {
  setIntensity(intensityInput.value);
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

document.querySelectorAll('.preset').forEach((btn) => {
  btn.addEventListener('click', () => {
    const value = btn.getAttribute('data-value');
    if (value != null) setIntensity(Number(value));
  });
});

// Service worker registration (PWA)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    const swUrl = new URL('sw.js', window.location.href).toString();
    navigator.serviceWorker.register(swUrl).catch(() => {});
  });
}

// Initialize
setIntensity(readInitialIntensity());

// Theme handling
function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === 'auto') {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', theme);
  }
  if (themeToggleBtn) themeToggleBtn.textContent = `Theme: ${theme[0].toUpperCase()}${theme.slice(1)}`;
}

function getInitialTheme() {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'auto') return stored;
  } catch {}
  return 'auto';
}

let currentTheme = getInitialTheme();
applyTheme(currentTheme);

themeToggleBtn?.addEventListener('click', () => {
  const order = ['auto', 'light', 'dark'];
  const next = order[(order.indexOf(currentTheme) + 1) % order.length];
  currentTheme = next;
  try { localStorage.setItem(THEME_KEY, next); } catch {}
  applyTheme(next);
});

// Install prompt handling
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn?.classList.remove('hidden');
});

installBtn?.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  if (outcome) {
    installBtn.classList.add('hidden');
  }
  deferredPrompt = null;
});

// Torch feature: camera LED
let mediaStream = null;
async function enableCameraTorch() {
  if (!('mediaDevices' in navigator) || !navigator.mediaDevices.getUserMedia) {
    torchSupportMsg.textContent = 'Camera API not supported on this device.';
    return;
  }
  try {
    // Request rear camera if available
    mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } } });
    const track = mediaStream.getVideoTracks()[0];
    const capabilities = track.getCapabilities?.() || {};
    if (!('torch' in capabilities)) {
      torchSupportMsg.textContent = 'Torch capability not available. Some devices/browsers do not expose it.';
      return;
    }
    await track.applyConstraints({ advanced: [{ torch: true }] });
    torchSupportMsg.textContent = 'Camera torch enabled. Keep the page open to maintain torch.';
  } catch (err) {
    torchSupportMsg.textContent = 'Could not enable camera torch (permission or capability).';
  }
}

function stopCamera() {
  if (mediaStream) {
    mediaStream.getTracks().forEach(t => t.stop());
    mediaStream = null;
    torchSupportMsg.textContent = 'Camera stopped.';
  }
}

cameraTorchBtn?.addEventListener('click', enableCameraTorch);
stopCameraBtn?.addEventListener('click', stopCamera);

// Torch feature: screen torch + wake lock
let wakeLock = null;
async function requestWakeLock() {
  try {
    if ('wakeLock' in navigator) {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => { /* no-op */ });
    }
  } catch {}
}

function setScreenTorch(on) {
  if (!screenTorchOverlay) return;
  if (on) {
    screenTorchOverlay.hidden = false;
    screenTorchOverlay.style.opacity = '1';
    requestWakeLock();
  } else {
    screenTorchOverlay.hidden = true;
    if (wakeLock) { try { wakeLock.release(); } catch {} finally { wakeLock = null; } }
  }
}

screenTorchBtn?.addEventListener('click', () => {
  const isOn = !!screenTorchOverlay && !screenTorchOverlay.hidden;
  setScreenTorch(!isOn);
});

screenTorchLevel?.addEventListener('input', () => {
  const level = Math.max(0, Math.min(100, Number(screenTorchLevel.value) || 0));
  // simulate brightness by opacity blend over underlying UI
  screenTorchOverlay.style.opacity = String(level / 100);
});
