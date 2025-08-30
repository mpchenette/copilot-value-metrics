/*
  Simple 4-wheel digit selector
  - Scroll, click up/down, or use keyboard arrows
  - Snap to 0-9 items
  - Emits current 4-digit code to readout
*/

const DIGITS = Array.from({ length: 10 }, (_, i) => String(i));
const WHEEL_COUNT = 4;

/** Create a single wheel element */
function createWheel(index) {
  const wheel = document.createElement('div');
  wheel.className = 'wheel';
  wheel.setAttribute('role', 'spinbutton');
  wheel.setAttribute('aria-label', `Digit ${index + 1}`);
  wheel.setAttribute('aria-valuemin', '0');
  wheel.setAttribute('aria-valuemax', '9');
  wheel.setAttribute('aria-valuenow', '0');
  wheel.tabIndex = 0; // focus container for keyboard arrows

  const btnUp = document.createElement('button');
  btnUp.className = 'btn btn-up';
  btnUp.type = 'button';
  btnUp.title = 'Increase digit';
  btnUp.innerHTML = '▲';

  const track = document.createElement('div');
  track.className = 'track';
  track.setAttribute('role', 'listbox');
  track.setAttribute('aria-label', `Digits list for wheel ${index + 1}`);

  const btnDown = document.createElement('button');
  btnDown.className = 'btn btn-down';
  btnDown.type = 'button';
  btnDown.title = 'Decrease digit';
  btnDown.innerHTML = '▼';

  // Fill digits
  DIGITS.forEach((d, i) => {
    const item = document.createElement('div');
    item.className = 'digit';
    item.textContent = d;
    item.setAttribute('role', 'option');
    item.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    track.appendChild(item);
  });

  wheel.append(btnUp, track, btnDown);

  // Helpers for current index/value
  const getDigitHeight = () => track.firstElementChild?.getBoundingClientRect().height ?? 60;
  const snapToIndex = (idx, behavior = 'smooth') => {
    const h = getDigitHeight();
    const y = idx * h + h / 2 - track.clientHeight / 2;
    track.scrollTo({ top: y, behavior });
  };

  const getIndexFromScroll = () => {
    const h = getDigitHeight();
    const center = track.scrollTop + track.clientHeight / 2;
    const idx = Math.round((center - h / 2) / h);
    return Math.max(0, Math.min(9, idx));
  };

  const setAriaSelected = (idx) => {
    [...track.children].forEach((el, i) => el.setAttribute('aria-selected', i === idx ? 'true' : 'false'));
    const val = String(idx);
    wheel.setAttribute('aria-valuenow', val);
  };

  const step = (delta) => {
    const idx = getIndexFromScroll();
    const next = (idx + delta + 10) % 10;
    snapToIndex(next);
  };

  // Events
  btnUp.addEventListener('click', () => step(+1));
  btnDown.addEventListener('click', () => step(-1));

  // Keyboard on wheel container
  wheel.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') { e.preventDefault(); step(+1); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); step(-1); }
    else if (e.key === 'Home') { e.preventDefault(); snapToIndex(0); }
    else if (e.key === 'End') { e.preventDefault(); snapToIndex(9); }
  });

  // Sync ARIA and readout on scroll end (debounced)
  let scrollTimer = null;
  const onScrollSettled = () => {
    const idx = getIndexFromScroll();
    setAriaSelected(idx);
    updateReadout();
  };
  track.addEventListener('scroll', () => {
    if (scrollTimer) clearTimeout(scrollTimer);
    scrollTimer = setTimeout(onScrollSettled, 80);
  }, { passive: true });

  // Initialize to 0 centered after layout
  requestAnimationFrame(() => {
    snapToIndex(0, 'auto');
    setAriaSelected(0);
  });

  // Expose minimal API
  return { el: wheel, get value() { return getIndexFromScroll(); }, set value(v) { snapToIndex(v, 'auto'); setAriaSelected(v); } };
}

// Mount
const wheelsContainer = document.getElementById('wheels');
const codeEl = document.getElementById('code');
const wheels = Array.from({ length: WHEEL_COUNT }, (_, i) => createWheel(i));
wheels.forEach(w => wheelsContainer.appendChild(w.el));

function updateReadout() {
  const val = wheels.map(w => String(w.value)).join('');
  codeEl.textContent = val.padEnd(WHEEL_COUNT, '0');
}

// Click on a digit to snap directly
document.addEventListener('click', (e) => {
  const d = e.target.closest('.digit');
  if (!d) return;
  const track = d.parentElement;
  const wheel = track.parentElement;
  const idx = [...track.children].indexOf(d);
  // Find matching wheel instance
  const w = wheels.find(wi => wi.el === wheel);
  if (w && idx >= 0) {
    w.value = idx;
    updateReadout();
  }
});

// Initial readout
updateReadout();
