/*
  Simple 4-wheel digit selector
  - Scroll, click up/down, or use keyboard arrows
  - Snap to 0-9 items
  - Emits current 4-digit code to readout
*/

const DIGITS = Array.from({ length: 10 }, (_, i) => String(i));
const WHEEL_COUNT = 4;
const NUMBER_LABELS = ['Digit 1', 'Digit 2', 'Digit 3', 'Digit 4'];

// Load static words + codes from words.js (window.WORDS_DATA).
// Fallback to a minimal default if the file is missing.
const DEFAULT_WORDS_DATA = [
  { word: 'Alpha', digits: [0, 0, 0, 0] },
  { word: 'Bravo', digits: [1, 2, 3, 4] }
];

function normalizeDigits(arr) {
  return Array.from({ length: WHEEL_COUNT }, (_, i) => {
    const n = Number(Array.isArray(arr) ? arr[i] : 0);
    const v = Number.isFinite(n) ? Math.floor(n) : 0;
    return Math.max(0, Math.min(9, v));
  });
}

const WORDS_DATA = Array.isArray(window.WORDS_DATA) && window.WORDS_DATA.length > 0
  ? window.WORDS_DATA
  : DEFAULT_WORDS_DATA;

const WORDS = WORDS_DATA.map(e => e.word);
const WORD_TO_DIGITS = new Map(WORDS_DATA.map(e => [e.word, normalizeDigits(e.digits)]));

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

  // Fill digits, repeated to allow spin animations across multiple turns
  const REPEATS = 3; // middle block is canonical, others are for spinning room
  for (let r = 0; r < REPEATS; r++) {
    DIGITS.forEach((d, i) => {
      const item = document.createElement('div');
      item.className = 'digit';
      item.textContent = d;
      item.setAttribute('role', 'option');
      item.dataset.digit = String(i);
      // default selected on initial 0 (middle block will be corrected after layout)
      item.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      track.appendChild(item);
    });
  }

  wheel.append(btnUp, track, btnDown);

  // Helpers for current index/value
  let currentValue = 0; // authoritative value to avoid mid-animation reads
  const TOTAL_ITEMS = REPEATS * 10;
  const MID_BLOCK_START = 10 * Math.floor(REPEATS / 2); // 10 with REPEATS=3
  const getDigitHeight = () => track.firstElementChild?.getBoundingClientRect().height ?? 60;
  const getPad = () => parseFloat(getComputedStyle(track).paddingTop) || 0;
  const updatePadding = () => {
    const h = getDigitHeight();
    const pad = Math.max(0, Math.round(track.clientHeight / 2 - h / 2));
    track.style.paddingTop = pad + 'px';
    track.style.paddingBottom = pad + 'px';
  };
  const snapToRawIndex = (rawIdx, behavior = 'smooth') => {
    const h = getDigitHeight();
    const pad = getPad();
    const y = pad + rawIdx * h + h / 2 - track.clientHeight / 2;
    track.scrollTo({ top: y, behavior });
  };
  const snapToIndex = (idx, behavior = 'smooth') => {
    // Snap to the middle block by default
    snapToRawIndex(MID_BLOCK_START + ((idx % 10) + 10) % 10, behavior);
  };

  const getRawIndexFromScroll = () => {
    const h = getDigitHeight();
    const pad = getPad();
    const center = track.scrollTop + track.clientHeight / 2;
    const raw = Math.round((center - pad - h / 2) / h);
    return Math.max(0, Math.min(TOTAL_ITEMS - 1, raw));
  };
  const getIndexFromScroll = () => ((getRawIndexFromScroll() % 10) + 10) % 10;

  const setAriaSelected = (idx) => {
    const norm = ((idx % 10) + 10) % 10;
    [...track.children].forEach((el) => el.setAttribute('aria-selected', el.dataset.digit === String(norm) ? 'true' : 'false'));
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
    if (!interactive) {
      // Recenters to the middle block to keep room for next spin
      snapToIndex(idx, 'auto');
    }
    currentValue = idx;
  };
  track.addEventListener('scroll', () => {
    if (scrollTimer) clearTimeout(scrollTimer);
    scrollTimer = setTimeout(onScrollSettled, 80);
  }, { passive: true });

  // Keep centering working at different sizes
  const handleResize = () => {
    const current = getIndexFromScroll();
    updatePadding();
    snapToIndex(current, 'auto');
    setAriaSelected(current);
  };
  window.addEventListener('resize', handleResize);

  // Initialize to 0 centered after layout
  requestAnimationFrame(() => {
    updatePadding();
    snapToIndex(0, 'auto');
    setAriaSelected(0);
    currentValue = 0;
  });

  // Expose minimal API
  function spinTo(targetIdx, options = {}) {
    const { turns = 1, direction = 'forward' } = options;
    const current = ((currentValue % 10) + 10) % 10;
    // Recenter to middle block to start
    const startRaw = MID_BLOCK_START + current;
    snapToRawIndex(startRaw, 'auto');
    const forwardDelta = ((targetIdx - current) % 10 + 10) % 10; // 0..9
    const extra = direction === 'forward' ? turns * 10 : 0;
    let destRaw = startRaw + extra + forwardDelta;
    // Keep destination within available repeated range
    const last = TOTAL_ITEMS - 1;
    while (destRaw > last) destRaw -= 10;
    while (destRaw < 0) destRaw += 10;
    snapToRawIndex(destRaw, 'smooth');
  }

  return {
    el: wheel,
    get value() { return currentValue; },
    set value(v) { const vv = ((v % 10) + 10) % 10; currentValue = vv; updatePadding(); snapToIndex(vv, 'auto'); setAriaSelected(vv); },
    spinTo,
  };
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
  const getPad = () => parseFloat(getComputedStyle(track).paddingTop) || 0;
  const updatePadding = () => {
    const h = getItemHeight();
    const pad = Math.max(0, Math.round(track.clientHeight / 2 - h / 2));
    track.style.paddingTop = pad + 'px';
    track.style.paddingBottom = pad + 'px';
  };
  const snapToIndex = (idx, behavior = 'smooth') => {
    const h = getItemHeight();
    const pad = getPad();
    const y = pad + idx * h + h / 2 - track.clientHeight / 2;
    track.scrollTo({ top: y, behavior });
  };
  const getIndexFromScroll = () => {
    const h = getItemHeight();
    const pad = getPad();
    const center = track.scrollTop + track.clientHeight / 2;
    const idx = Math.round((center - pad - h / 2) / h);
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

  const handleResize = () => {
    const current = getIndexFromScroll();
    updatePadding();
    snapToIndex(current, 'auto');
    setAriaSelected(current);
    onSelectIndex?.(current);
  };
  window.addEventListener('resize', handleResize);

  requestAnimationFrame(() => {
    updatePadding();
    snapToIndex(0, 'auto');
    setAriaSelected(0);
    onSelectIndex?.(0);
  });

  return { el: wheel, get index() { return getIndexFromScroll(); }, set index(v) { snapToIndex(v, 'auto'); setAriaSelected(v); onSelectIndex?.(v); } };
}

// Mount
const wheelsContainer = document.getElementById('wheels');
const codeEl = document.getElementById('code');
let sumEl = null; // inline total to the right of wheels

// Number wheels are static (non-interactive)
const numberWheels = Array.from({ length: WHEEL_COUNT }, (_, i) => createNumberWheel(i, /* interactive */ false));

// Word wheel controls the number wheels
const wordWheel = createWordWheel(WORDS, (wordIdx) => {
  const word = WORDS[wordIdx];
  const digits = WORD_TO_DIGITS.get(word) || [0, 0, 0, 0];
  numberWheels.forEach((w, i) => {
    // Spin forward at least one full turn for effect
    w.spinTo(digits[i], { turns: 1, direction: 'forward' });
  });
  updateReadout();
});

// Append in order: word wheel first, with an empty label to align tops
const wordCol = document.createElement('div');
wordCol.className = 'wheel-col';
const wordSpacer = document.createElement('div');
wordSpacer.className = 'wheel-label';
wordSpacer.textContent = ' '; // spacer to reserve label height
wordCol.append(wordSpacer, wordWheel.el);
wheelsContainer.appendChild(wordCol);
numberWheels.forEach((w, i) => {
  const col = document.createElement('div');
  col.className = 'wheel-col';
  const label = document.createElement('div');
  label.className = 'wheel-label';
  label.textContent = NUMBER_LABELS[i] || `Digit ${i + 1}`;
  col.append(label, w.el);
  wheelsContainer.appendChild(col);
});
// Add inline sum element at the end
sumEl = document.createElement('div');
sumEl.className = 'sum';
sumEl.textContent = '= 0';
wheelsContainer.appendChild(sumEl);

function updateReadout() {
  const values = numberWheels.map(w => w.value);
  const val = values.map(v => String(v)).join('');
  codeEl.textContent = val.padEnd(WHEEL_COUNT, '0');
  const total = values.reduce((a, b) => a + (Number.isFinite(b) ? b : 0), 0);
  if (sumEl) sumEl.textContent = `= ${total}`;
}

// Disable direct digit clicking behavior (numbers are static now)

// Initial readout
updateReadout();
