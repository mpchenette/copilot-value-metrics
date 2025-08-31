## 4-Digit Rolling Number Selectors

A tiny vanilla web app with four vertical wheels you can scroll to pick digits 0–9, like setting a PIN or combo lock.

Features:
- Four independent digit wheels (0–9) with smooth scroll-snap
- Mouse/touch scroll, click on a digit, or use keyboard: Up/Down, Home/End
- Live 4-digit readout updates as you scroll
- Accessible roles/labels with `aria-valuenow` and `aria-selected`

### Run locally

Open `index.html` directly in your browser or serve the folder. On macOS you can use Python’s simple server:

```zsh
python3 -m http.server --directory . 5173
```

Then visit:

```
http://localhost:5173/
```

Alternatively, in VS Code, use the Live Server extension and click “Go Live”.

### Files

- `index.html` – markup and containers
- `styles.css` – layout and wheel visuals
- `script.js` – behavior and keyboard support
- `words.js` – static list of words and their 4-digit codes (edit this)

### Configure words and codes

Edit `words.js` to control the selectable words and the exact 4-digit codes they map to. Example entry:

```
{ word: 'Alpha', digits: [1, 5, 3, 7] }
```

You can add/remove entries; the UI adapts automatically. Each digit must be 0–9.
# copilot-value-metrics
