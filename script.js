/*
  Simple 4-wheel digit selector
  - Scroll, click up/down, or use keyboard arrows
  - Snap to 0-9 items
  - Emits current 4-digit code to readout
*/

const DIGITS = Array.from({ length: 10 }, (_, i) => String(i));
const WHEEL_COUNT = 4;
const WORDS = [
  'Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo',
  'Foxtrot', 'Golf', 'Hotel', 'India', 'Juliet'
];

// Assign each word a random 4-digit code using digits 1-9
const WORD_TO_DIGITS = new Map(
  WORDS.map(w => [w, Array.from({ length: WHEEL_COUNT }, () => Math.floor(Math.random() * 9) + 1)])
);

/** Create a single NUMBER wheel element */
function createNumberWheel(index, interactive = true) {
  const wheel = document.createElement('div');
  wheel.className = 'wheel' + (interactive ? '' : ' static');
  wheel.setAttribute('role', 'spinbutton');
  wheel.setAttribute('aria-label', `Digit ${index + 1}`);
  wheel.setAttribute('aria-valuemin', '0');
  wheel.setAttribute('aria-valuemax', '9');
  wheel.setAttribute('aria-valuenow', '0');
  if (interactive) {
    wheel.tabIndex = 0; // focus container for keyboard arrows
  } else {
    wheel.tabIndex = -1;
    wheel.setAttribute('aria-readonly', 'true');
  }

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

  // Events (only if interactive)
  if (interactive) {
    btnUp.addEventListener('click', () => step(+1));
    btnDown.addEventListener('click', () => step(-1));
    // If user interacts with the track, move focus to the wheel
    // so ArrowUp/ArrowDown work immediately after a click/scroll.
    track.addEventListener('pointerdown', () => wheel.focus());
  } else {
    // Block manual scrolling on static number wheels
    track.addEventListener('wheel', (e) => e.preventDefault(), { passive: false });
    track.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
    track.addEventListener('pointerdown', (e) => e.preventDefault());
  }

  // Keyboard on wheel container (only if interactive)
  if (interactive) {
    wheel.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp') { e.preventDefault(); step(+1); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); step(-1); }
      else if (e.key === 'Home') { e.preventDefault(); snapToIndex(0); }
      else if (e.key === 'End') { e.preventDefault(); snapToIndex(9); }
    });
  }

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

/** Create the WORD wheel that drives the number wheels */
function createWordWheel(words, onSelectIndex) {
  const wheel = document.createElement('div');
  wheel.className = 'wheel word';
  wheel.setAttribute('role', 'group');
  wheel.setAttribute('aria-label', 'Word selector');
  wheel.tabIndex = 0;

  const btnUp = document.createElement('button');
  btnUp.className = 'btn btn-up';
  btnUp.type = 'button';
  btnUp.title = 'Previous word';
  btnUp.innerHTML = '▲';

  const track = document.createElement('div');
  track.className = 'track';
  track.setAttribute('role', 'listbox');
  track.setAttribute('aria-label', 'Word list');

  const btnDown = document.createElement('button');
  btnDown.className = 'btn btn-down';
  btnDown.type = 'button';
  btnDown.title = 'Next word';
  btnDown.innerHTML = '▼';

  words.forEach((w, i) => {
    const item = document.createElement('div');
    item.className = 'digit word';
    item.textContent = w;
    item.setAttribute('role', 'option');
    item.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    track.appendChild(item);
  });

  wheel.append(btnUp, track, btnDown);

  const getItemHeight = () => track.firstElementChild?.getBoundingClientRect().height ?? 60;
  const snapToIndex = (idx, behavior = 'smooth') => {
    const h = getItemHeight();
    const y = idx * h + h / 2 - track.clientHeight / 2;
    track.scrollTo({ top: y, behavior });
  };
  const getIndexFromScroll = () => {
    const h = getItemHeight();
    const center = track.scrollTop + track.clientHeight / 2;
    const idx = Math.round((center - h / 2) / h);
    return Math.max(0, Math.min(words.length - 1, idx));
  };
  const setAriaSelected = (idx) => {
    [...track.children].forEach((el, i) => el.setAttribute('aria-selected', i === idx ? 'true' : 'false'));
  };
  const step = (delta) => {
    const idx = getIndexFromScroll();
    const next = (idx + delta + words.length) % words.length;
    snapToIndex(next);
  };

  btnUp.addEventListener('click', () => step(-1));
  btnDown.addEventListener('click', () => step(+1));
  track.addEventListener('pointerdown', () => wheel.focus());
  wheel.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') { e.preventDefault(); step(-1); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); step(+1); }
    else if (e.key === 'Home') { e.preventDefault(); snapToIndex(0); }
    else if (e.key === 'End') { e.preventDefault(); snapToIndex(words.length - 1); }
  });

  let scrollTimer = null;
  const onScrollSettled = () => {
    const idx = getIndexFromScroll();
    setAriaSelected(idx);
    onSelectIndex?.(idx);
  };
  track.addEventListener('scroll', () => {
    if (scrollTimer) clearTimeout(scrollTimer);
    scrollTimer = setTimeout(onScrollSettled, 80);
  }, { passive: true });

  requestAnimationFrame(() => {
    snapToIndex(0, 'auto');
    setAriaSelected(0);
    onSelectIndex?.(0);
  });

  return { el: wheel, get index() { return getIndexFromScroll(); }, set index(v) { snapToIndex(v, 'auto'); setAriaSelected(v); onSelectIndex?.(v); } };
}

// Mount
const wheelsContainer = document.getElementById('wheels');
const codeEl = document.getElementById('code');

// Number wheels are static (non-interactive)
const numberWheels = Array.from({ length: WHEEL_COUNT }, (_, i) => createNumberWheel(i, /* interactive */ false));

// Word wheel controls the number wheels
const wordWheel = createWordWheel(WORDS, (wordIdx) => {
  const word = WORDS[wordIdx];
  const digits = WORD_TO_DIGITS.get(word) || [0, 0, 0, 0];
  numberWheels.forEach((w, i) => { w.value = digits[i]; });
  updateReadout();
});

// Append in order: word wheel first, then number wheels
wheelsContainer.appendChild(wordWheel.el);
numberWheels.forEach(w => wheelsContainer.appendChild(w.el));

function updateReadout() {
  const val = numberWheels.map(w => String(w.value)).join('');
  codeEl.textContent = val.padEnd(WHEEL_COUNT, '0');
}

// Disable direct digit clicking behavior (numbers are static now)

// Initial readout
updateReadout();
