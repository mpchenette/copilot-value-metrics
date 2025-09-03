/*
  Simple 4-wheel score selector
  - Scroll, click up/down, or use keyboard arrows
  - Snap to 10 items (1–10)
*/

const DIGITS = Array.from({ length: 10 }, (_, i) => String(i + 1));
const WHEEL_COUNT = 4;
// Category labels for metric scoring
const NUMBER_LABELS = [
  'Ease of Gathering',
  'Signal Strength',
  'Resistance to Gaming',
  'Objectivity',
];

// Load static words + codes from words.js (window.WORDS_DATA).
// Fallback to a minimal default if the file is missing.
function clampScore(x) {
  const n = Number.isFinite(Number(x)) ? Math.floor(Number(x)) : 1;
  return Math.max(1, Math.min(10, n));
}

const WORDS_DATA = Array.isArray(window.WORDS_DATA) ? window.WORDS_DATA : [];

// Preprocess words: clamp scores to 1–10, compute totals, map to 0–9 indices for wheels, then sort by total desc.
const PROCESSED_WORDS = (WORDS_DATA || []).map(e => {
  const scores = Array.from({ length: WHEEL_COUNT }, (_, i) => clampScore(Array.isArray(e.digits) ? e.digits[i] : 1));
  const scoreIndices = scores.map(s => s - 1); // convert to 0–9 indices for wheels
  const ex = Array.isArray(e.explanations) ? e.explanations.slice(0, WHEEL_COUNT) : [];
  const explanations = Array.from({ length: WHEEL_COUNT }, (_, i) => ex[i] ?? '');
  const total = scores.reduce((a, b) => a + (Number.isFinite(b) ? b : 0), 0);
  return { word: e.word, scoreIndices, explanations, total };
}).sort((a, b) => {
  if (b.total !== a.total) return b.total - a.total; // desc by total
  return String(a.word).localeCompare(String(b.word)); // tiebreak by word asc
});

const WORDS = PROCESSED_WORDS.map(e => e.word);
const WORD_TO_SCORE_INDICES = new Map(PROCESSED_WORDS.map(e => [e.word, e.scoreIndices]));
const WORD_TO_EXPLANATIONS = new Map(PROCESSED_WORDS.map(e => [e.word, e.explanations]));

/** Create a single NUMBER wheel element */
function createNumberWheel(index, interactive = true) {
  const wheel = document.createElement('div');
  wheel.className = 'wheel' + (interactive ? '' : ' static');
  wheel.setAttribute('role', 'spinbutton');
  const label = NUMBER_LABELS[index] || `Category ${index + 1}`;
  wheel.setAttribute('aria-label', `${label} score`);
  wheel.setAttribute('aria-valuemin', '1');
  wheel.setAttribute('aria-valuemax', '10');
  wheel.setAttribute('aria-valuenow', '1');
  if (interactive) {
    wheel.tabIndex = 0; // focus container for keyboard arrows
  } else {
    wheel.tabIndex = -1;
    wheel.setAttribute('aria-readonly', 'true');
  }

  const track = document.createElement('div');
  track.className = 'track';
  track.setAttribute('role', 'listbox');
  track.setAttribute('aria-label', `Scores list for ${label}`);

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

  if (interactive) {
    const btnUp = document.createElement('button');
    btnUp.className = 'btn btn-up';
    btnUp.type = 'button';
    btnUp.title = 'Increase score';
    btnUp.innerHTML = '▲';

    const btnDown = document.createElement('button');
    btnDown.className = 'btn btn-down';
    btnDown.type = 'button';
    btnDown.title = 'Decrease score';
    btnDown.innerHTML = '▼';

    wheel.append(btnUp, track, btnDown);
    btnUp.addEventListener('click', () => step(+1));
    btnDown.addEventListener('click', () => step(-1));
  } else {
    // Static wheels: only the track
    wheel.append(track);
  }

  // Helpers for current index/value
  let currentValue = 0; // stores index 0–9; exposed as score 1–10 via getter
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
    const val = String(idx + 1);
    wheel.setAttribute('aria-valuenow', val);
  };

  const step = (delta) => {
    const idx = getIndexFromScroll();
    const next = (idx + delta + 10) % 10;
    snapToIndex(next);
  };

  // Events (only if interactive)
  if (interactive) {
    // If user interacts with the track, move focus to the wheel so ArrowUp/Down work
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
    get value() { return currentValue + 1; },
    set value(v) { const s = clampScore(v); const idx = ((s - 1) % 10 + 10) % 10; currentValue = idx; updatePadding(); snapToIndex(idx, 'auto'); setAriaSelected(idx); },
    spinTo,
  };
}

/** Create the WORD wheel that drives the number wheels
 * onSelectIndex(idx: number): fired after scroll settles or keyboard select
 * onScrollIndex(idx: number): live integer index while scrolling (rounded)
 * onScrollProgress(progress: number): live fractional index while scrolling
 */
function createWordWheel(words, onSelectIndex, onScrollIndex, onScrollProgress) {
  const wheel = document.createElement('div');
  wheel.className = 'wheel word';
  wheel.setAttribute('role', 'group');
  wheel.setAttribute('aria-label', 'Metric selector');
  wheel.tabIndex = 0;

  const btnUp = document.createElement('button');
  btnUp.className = 'btn btn-up';
  btnUp.type = 'button';
  btnUp.title = 'Previous word';
  btnUp.innerHTML = '▲';

  const track = document.createElement('div');
  track.className = 'track';
  track.setAttribute('role', 'listbox');
  track.setAttribute('aria-label', 'Metric list');

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
  const getIndexFloatFromScroll = () => {
    const h = getItemHeight();
    const pad = getPad();
    const center = track.scrollTop + track.clientHeight / 2;
    const raw = (center - pad - h / 2) / h;
    return Math.max(0, Math.min(words.length - 1, raw));
  };
  // Optimize ARIA selection updates to only touch changed nodes
  let lastSelectedIdx = -1;
  const setAriaSelected = (idx) => {
    const clamped = Math.max(0, Math.min(words.length - 1, idx|0));
    if (clamped === lastSelectedIdx) return;
    const prev = track.children[lastSelectedIdx];
    if (prev) prev.setAttribute('aria-selected', 'false');
    const next = track.children[clamped];
    if (next) next.setAttribute('aria-selected', 'true');
    lastSelectedIdx = clamped;
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
  // Realtime highlight while scrolling using rAF throttle
  let rafId = null;
  track.addEventListener('scroll', () => {
    if (rafId == null) {
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const liveIdx = getIndexFromScroll();
        setAriaSelected(liveIdx);
        // Live sync callback (e.g., mirror total wheel) while scrolling
        onScrollIndex?.(liveIdx);
        onScrollProgress?.(getIndexFloatFromScroll());
      });
    }
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
    onScrollIndex?.(0);
    onSelectIndex?.(0);
  });

  return { el: wheel, get index() { return getIndexFromScroll(); }, set index(v) { snapToIndex(v, 'auto'); setAriaSelected(v); onSelectIndex?.(v); } };
}

// Mount
const wheelsContainer = document.getElementById('wheels');
// Removed the "current value" readout; only keep sum/details.
const detailsEl = document.getElementById('details');
let sumEl = null; // inline total to the right of wheels
let currentWordIdx = 0;
const isVariant2 = document.body?.dataset?.variant === '2';
const TOTALS = PROCESSED_WORDS.map(e => e.total);
// Live-update references for details (badges/text per row)
let detailRefs = null; // { badges: HTMLElement[], texts: HTMLElement[], titles: HTMLElement[] }

// Map a score (0..max) to a red→green hue (0→120)
function scoreToColor(score, max = 40) {
  const s = Math.max(0, Math.min(max, Number(score) || 0));
  const hue = (s / max) * 120; // 0=red, 120=green
  // Bright, readable on dark background
  return `hsl(${hue}, 90%, 55%)`;
}

// A static total wheel that mirrors the metric selector
function createTotalWheel(totals) {
  const wheel = document.createElement('div');
  wheel.className = 'wheel total static';
  wheel.setAttribute('role', 'group');
  wheel.setAttribute('aria-label', 'Total score');
  wheel.setAttribute('aria-readonly', 'true');
  wheel.tabIndex = -1;

  const track = document.createElement('div');
  track.className = 'track';
  track.setAttribute('role', 'listbox');
  track.setAttribute('aria-label', 'Total scores list');

  totals.forEach((t, i) => {
    const item = document.createElement('div');
    item.className = 'digit';
    item.textContent = String(t);
    item.setAttribute('role', 'option');
    item.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    // Color code each total from red (0) to green (40)
    item.style.color = scoreToColor(t, 40);
    track.appendChild(item);
  });

  wheel.append(track);

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
  // Scroll to a fractional index for smooth mirroring
  const scrollToIndexFloat = (idxFloat) => {
    const h = getItemHeight();
    const pad = getPad();
    const y = pad + idxFloat * h + h / 2 - track.clientHeight / 2;
    track.scrollTo({ top: y, behavior: 'auto' });
    const rounded = Math.round(Math.max(0, Math.min(totals.length - 1, idxFloat)));
    setAriaSelected(rounded);
  };
  const getIndexFromScroll = () => {
    const h = getItemHeight();
    const pad = getPad();
    const center = track.scrollTop + track.clientHeight / 2;
    const idx = Math.round((center - pad - h / 2) / h);
    return Math.max(0, Math.min(totals.length - 1, idx));
  };
  const setAriaSelected = (idx) => {
    [...track.children].forEach((el, i) => el.setAttribute('aria-selected', i === idx ? 'true' : 'false'));
  };

  // Prevent manual scrolling
  track.addEventListener('wheel', (e) => e.preventDefault(), { passive: false });
  track.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
  track.addEventListener('pointerdown', (e) => e.preventDefault());

  const handleResize = () => {
    const current = getIndexFromScroll();
    updatePadding();
    snapToIndex(current, 'auto');
    setAriaSelected(current);
  };
  window.addEventListener('resize', handleResize);

  requestAnimationFrame(() => {
    updatePadding();
    snapToIndex(0, 'auto');
    setAriaSelected(0);
  });

  return {
    el: wheel,
    get index() { return getIndexFromScroll(); },
    set index(v) { snapToIndex(v, 'auto'); setAriaSelected(v); },
    setProgress(p) { scrollToIndexFloat(p); }
  };
}

// Number wheels are static (non-interactive) — skipped entirely in Variant 2
const numberWheels = isVariant2 ? [] : Array.from({ length: WHEEL_COUNT }, (_, i) => createNumberWheel(i, /* interactive */ false));
let totalWheel = null; // deprecated in variant 2
let scoreEl = null;    // static score display for variant 2

// Word wheel controls the number wheels
const wordWheel = createWordWheel(WORDS, (wordIdx) => {
  const word = WORDS[wordIdx];
  const scoreIdx = WORD_TO_SCORE_INDICES.get(word) || [0, 0, 0, 0];
  currentWordIdx = wordIdx;
  numberWheels.forEach((w, i) => {
    // Spin forward at least one full turn for effect
    w.spinTo(scoreIdx[i], { turns: 1, direction: 'forward' });
  });
  if (isVariant2 && scoreEl) {
    const total = TOTALS[wordIdx] ?? 0;
    scoreEl.textContent = String(total);
    scoreEl.style.color = scoreToColor(total, 40);
  }
  updateReadout();
}, (scrollIdx) => {
  // Live update score readout to nearest item while scrolling
  if (isVariant2 && scoreEl) {
    const total = TOTALS[scrollIdx] ?? 0;
    scoreEl.textContent = String(total);
    scoreEl.style.color = scoreToColor(total, 40);
  }
  // Live update breakdown details to match score responsiveness
  updateDetailsForIndex(scrollIdx);
}, (scrollProgress) => {
  // No-op: static score readout has no scroller
});

// Append in order: word wheel first, with an empty label to align tops
const wordCol = document.createElement('div');
wordCol.className = 'wheel-col';
const wordSpacer = document.createElement('div');
wordSpacer.className = 'wheel-label';
wordSpacer.textContent = 'Metric';
wordCol.append(wordSpacer, wordWheel.el);
wheelsContainer.appendChild(wordCol);
// Insert total wheel between metric selector and score columns (variant 2)
  if (isVariant2) {
    // Static score readout (no scroller), shows current metric's total
    const col = document.createElement('div');
    col.className = 'wheel-col';
    const label = document.createElement('div');
    label.className = 'wheel-label';
    label.textContent = 'Score';
    scoreEl = document.createElement('div');
    scoreEl.className = 'sum score';
    const initial = TOTALS[0] ?? 0;
    scoreEl.textContent = String(initial);
    scoreEl.style.color = scoreToColor(initial, 40);
    scoreEl.setAttribute('aria-live', 'polite');
    scoreEl.setAttribute('aria-label', 'Total score for selected metric');
    col.append(label, scoreEl);
    wheelsContainer.appendChild(col);

    // Insert a visual equals operator between Score and Breakdown
    const eq = document.createElement('div');
    eq.className = 'sum equals';
    eq.setAttribute('aria-hidden', 'true');
    eq.textContent = '=';
    wheelsContainer.appendChild(eq);
  }
// Variant 2: move details panel into the wheels row as the right-most column
if (isVariant2) {
  const detailsSection = document.querySelector('.details');
  if (detailsSection) {
    const detailsCol = document.createElement('div');
    detailsCol.className = 'wheel-col details-col';
    const detailsLabel = document.createElement('div');
    detailsLabel.className = 'wheel-label';
    detailsLabel.textContent = 'Breakdown';
    detailsCol.append(detailsLabel, detailsSection);
    wheelsContainer.appendChild(detailsCol);
  }
}
numberWheels.forEach((w, i) => {
  const col = document.createElement('div');
  col.className = 'wheel-col';
  const label = document.createElement('div');
  label.className = 'wheel-label';
  label.textContent = NUMBER_LABELS[i] || `Digit ${i + 1}`;
  col.append(label, w.el);
  wheelsContainer.appendChild(col);
});
// Add inline sum element at the end (only in variant 1)
if (!isVariant2) {
  sumEl = document.createElement('div');
  sumEl.className = 'sum';
  sumEl.textContent = '= 0';
  wheelsContainer.appendChild(sumEl);
}

function updateReadout() {
  if (!isVariant2) {
    const values = numberWheels.map(w => w.value); // scores 1–10
    const total = values.reduce((a, b) => a + (Number.isFinite(b) ? b : 0), 0);
    if (sumEl) {
      sumEl.textContent = `= ${total}`;
      // Apply color from red (0) to bright green (40)
      sumEl.style.color = scoreToColor(total, 40);
    }
  }
  // Keep the details in sync
  updateDetails();
}

// Initial render
updateReadout();

// Build (once) and then update details content fast
function ensureDetailsStructure() {
  if (!detailsEl || detailRefs) return;
  const labels = NUMBER_LABELS;
  detailRefs = { badges: [], texts: [], titles: [] };
  detailsEl.innerHTML = '';
  if (isVariant2) {
    for (let i = 0; i < WHEEL_COUNT; i++) {
      const detail = document.createElement('details');
      detail.className = 'detail-item';

      const summary = document.createElement('summary');
      summary.className = 'detail-summary';

      const caret = document.createElement('div');
      caret.className = 'detail-caret';
      const svgNS = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(svgNS, 'svg');
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('width', '20');
      svg.setAttribute('height', '20');
      const path = document.createElementNS(svgNS, 'path');
      path.setAttribute('d', 'M6 9l6 6 6-6');
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', 'currentColor');
      path.setAttribute('stroke-width', '2');
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('stroke-linejoin', 'round');
      svg.appendChild(path);
      caret.appendChild(svg);

      const badge = document.createElement('div');
      badge.className = 'detail-badge';
      badge.setAttribute('aria-label', `${labels[i]} score`);

      const title = document.createElement('div');
      title.className = 'detail-title';
      title.textContent = labels[i] || `Category ${i + 1}`;

      summary.append(badge, title, caret);

      const body = document.createElement('div');
      body.className = 'detail-body';
      const text = document.createElement('div');
      text.className = 'detail-text';
      body.append(text);

      detail.append(summary, body);
      detailsEl.appendChild(detail);
      if (i < WHEEL_COUNT - 1) {
        const sep = document.createElement('div');
        sep.className = 'detail-sep';
        sep.setAttribute('aria-hidden', 'true');
        sep.textContent = '+';
        detailsEl.appendChild(sep);
      }

      detailRefs.badges[i] = badge;
      detailRefs.texts[i] = text;
      detailRefs.titles[i] = title;
    }
  } else {
    for (let i = 0; i < WHEEL_COUNT; i++) {
      const item = document.createElement('div');
      item.className = 'detail-item row';

      const badge = document.createElement('div');
      badge.className = 'detail-badge';
      badge.setAttribute('aria-label', `${labels[i]} score`);

      const content = document.createElement('div');
      content.className = 'detail-content';

      const title = document.createElement('div');
      title.className = 'detail-title';
      title.textContent = labels[i] || `Category ${i + 1}`;

      const text = document.createElement('div');
      text.className = 'detail-text';

      content.append(title, text);
      item.append(badge, content);
      detailsEl.appendChild(item);

      detailRefs.badges[i] = badge;
      detailRefs.texts[i] = text;
      detailRefs.titles[i] = title;
    }
  }
}

function updateDetailsForIndex(wordIdx) {
  if (!detailsEl) return;
  ensureDetailsStructure();
  if (!detailRefs) return;
  const labels = NUMBER_LABELS;
  const word = WORDS[wordIdx] || '';
  const scores = isVariant2
    ? (PROCESSED_WORDS[wordIdx]?.scoreIndices || Array(WHEEL_COUNT).fill(0)).map(s => s + 1)
    : numberWheels.map(w => w.value);
  const ex = WORD_TO_EXPLANATIONS.get(word) || [];
  for (let i = 0; i < WHEEL_COUNT; i++) {
    const score = Number.isFinite(scores[i]) ? scores[i] : '';
    detailRefs.badges[i].textContent = String(score);
    if (Number.isFinite(scores[i])) {
      detailRefs.badges[i].style.color = scoreToColor(scores[i] - 1, 9);
    } else {
      detailRefs.badges[i].style.color = '';
    }
    const expl = (ex[i] || '').trim();
    detailRefs.texts[i].textContent = expl || 'No explanation provided.';
    detailRefs.titles[i].textContent = labels[i] || `Category ${i + 1}`;
  }
}

function updateDetails() {
  updateDetailsForIndex(currentWordIdx);
}

// Populate details on first paint
updateDetails();
