export function announce(message) {
  const live = document.querySelector('#live-region');
  if (!live) return;
  live.textContent = '';
  window.requestAnimationFrame(() => { live.textContent = message || ''; });
}

export function focusSelector(selector) {
  window.requestAnimationFrame(() => document.querySelector(selector)?.focus());
}

export function applyPreferences(state) {
  document.documentElement.dataset.theme = state.theme;
  document.documentElement.dataset.motion = state.reducedMotion ? 'reduced' : 'full';
  document.documentElement.dataset.contrast = state.highContrast ? 'high' : 'normal';
  document.documentElement.lang = state.locale === 'te' ? 'te' : 'en';
}
