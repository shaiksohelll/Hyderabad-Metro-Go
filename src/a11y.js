let dialogReturnFocus = null;

export function announce(message) {
  const live = document.querySelector('#live-region');
  if (!live) return;
  live.textContent = '';
  window.requestAnimationFrame(() => { live.textContent = message || ''; });
}

export function focusSelector(selector) {
  window.requestAnimationFrame(() => document.querySelector(selector)?.focus());
}

export function openDialog(dialog, trigger) {
  dialogReturnFocus = trigger || document.activeElement;
  dialog.hidden = false;
  dialog.setAttribute('aria-hidden', 'false');
  focusSelector('.dialog-close');
}

export function closeDialog(dialog) {
  dialog.hidden = true;
  dialog.setAttribute('aria-hidden', 'true');
  dialogReturnFocus?.focus?.();
  dialogReturnFocus = null;
}

export function trapDialogKeydown(event, dialog) {
  if (dialog.hidden) return false;
  if (event.key === 'Escape') {
    event.preventDefault();
    closeDialog(dialog);
    return true;
  }
  if (event.key !== 'Tab') return false;
  const focusable = [...dialog.querySelectorAll('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])')].filter((element) => !element.disabled);
  if (!focusable.length) return false;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
  return false;
}

export function applyPreferences(state) {
  document.documentElement.dataset.theme = state.theme;
  document.documentElement.dataset.motion = state.reducedMotion ? 'reduced' : 'full';
  document.documentElement.dataset.contrast = state.highContrast ? 'high' : 'normal';
  document.documentElement.lang = state.locale === 'te' ? 'te' : 'en';
}
